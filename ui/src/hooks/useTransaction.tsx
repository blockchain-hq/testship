import { useState } from "react";
import { Program, AnchorProvider, AnchorError } from "@coral-xyz/anchor";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import type { Keypair } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { toast } from "sonner";
import { toAnchorType, derivePDA } from "@/lib/solana";
import { toCamelCase } from "@/lib/utils";
import type { IdlInstruction, ModIdlAccount } from "@/lib/types";
import { useTransactionToast } from "./useTransactionToast";
import { parseSolanaError, type ErrorWithLogs } from "@/lib/errorParser";
import {
  type TransactionRecord,
  type AccountSnapshot,
} from "./useTransactionHistory";
import { useIDL } from "@/context/IDLContext";
import { useInvalidateAccountQueries } from "./useProgramAccounts";
import { useCluster } from "@/context/ClusterContext";
import { captureAccountSnapshot } from "@/lib/utils/account-diff";

export default function useTransaction(
  addTransaction: (tx: TransactionRecord) => void
) {
  const { idl } = useIDL();
  const [isExecuting, setIsExecuting] = useState(false);
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const wallet = useAnchorWallet();
  const txToast = useTransactionToast();
  const invalidateAccountQueries = useInvalidateAccountQueries(idl, {
    name: cluster.name,
    endpoint: cluster.endpoint,
  });

  const execute = async (
    instruction: IdlInstruction,
    accounts: Map<string, string | null>,
    args: Record<string, unknown>,
    signers: Map<string, Keypair>
  ) => {
    if (!wallet) {
      toast.error("Connect your wallet first");
      return null;
    }

    if (!idl) {
      toast.error("IDL not found");
      return null;
    }

    setIsExecuting(true);
    const toastId = txToast.loading(`Executing ${instruction.name}...`);

    try {
      const provider = new AnchorProvider(connection, wallet, {
        commitment: "confirmed",
      });
      const program = new Program(idl, provider);

      // Auto-derive PDAs
      const accountMap = new Map(accounts);
      for (const account of instruction.accounts) {
        const acc = account as ModIdlAccount;
        if (acc.pda?.seeds && !accountMap.get(acc.name)) {
          try {
            const pda = await derivePDA(
              acc.pda.seeds,
              idl.address,
              accountMap,
              args,
              connection,
              idl,
              acc.pda.program
            );
            accountMap.set(acc.name, pda.toBase58());
          } catch (error) {
            console.warn(`Could not auto-derive PDA for ${acc.name}:`, error);
          }
        }
      }

      const accountPubkeys: Record<string, PublicKey> = {};
      for (const [name, address] of accountMap) {
        if (!address) throw new Error(`Missing account: ${name}`);
        accountPubkeys[toCamelCase(name)] = new PublicKey(address);
      }

      // Convert arguments to Anchor types with IDL for complex type resolution
      const anchorArgs = instruction.args.map((arg) => {
        const value = args[arg.name];
        if (value === undefined || value === null) {
          // Allow null for Option types
          const isOptionArg =
            typeof arg.type === "object" &&
            arg.type !== null &&
            "option" in arg.type;
          if (isOptionArg) {
            return null;
          }
          throw new Error(`Missing argument: ${arg.name}`);
        }
        try {
          return toAnchorType(value, arg.type, idl);
        } catch (e) {
          throw new Error(
            `Failed to convert argument "${arg.name}": ${e instanceof Error ? e.message : e}`
          );
        }
      });

      // Log for debugging (can be removed in production)
      console.log(`Executing ${instruction.name} with args:`, anchorArgs);

      // Capture before snapshots for writable accounts
      const writableAccounts: Array<{ name: string; pubkey: PublicKey }> = [];
      for (const account of instruction.accounts) {
        const acc = account as ModIdlAccount;
        const accountName = acc.name;
        const address = accountMap.get(accountName);

        if (address && acc.writable) {
          writableAccounts.push({
            name: accountName,
            pubkey: new PublicKey(address),
          });
        }
      }

      // Also capture payer wallet (always pays fees, even if not marked writable)
      if (wallet.publicKey) {
        const payerInWritable = writableAccounts.some((acc) =>
          acc.pubkey.equals(wallet.publicKey!)
        );
        if (!payerInWritable) {
          writableAccounts.push({
            name: "payer (wallet)",
            pubkey: wallet.publicKey,
          });
        }
      }

      const beforeSnapshots: Record<string, unknown | null> = {};
      for (const { name, pubkey } of writableAccounts) {
        const snapshot = await captureAccountSnapshot(connection, pubkey, idl);
        // Store even if null (account doesn't exist yet - will be created)
        beforeSnapshots[name] = snapshot;
      }

      const signature = await program.methods[toCamelCase(instruction.name)](
        ...anchorArgs
      )
        .accounts(accountPubkeys)
        .signers(Array.from(signers.values()))
        .rpc();

      // Capture after snapshots for the same accounts
      const afterSnapshots: Record<string, unknown | null> = {};
      for (const { name, pubkey } of writableAccounts) {
        const snapshot = await captureAccountSnapshot(connection, pubkey, idl);
        // Store even if null (account was closed)
        afterSnapshots[name] = snapshot;
      }

      // Build account snapshots for storage
      const accountSnapshots: Record<string, AccountSnapshot> = {};
      for (const { name } of writableAccounts) {
        const before = beforeSnapshots[name];
        const after = afterSnapshots[name];

        // Handle all cases: creation, modification, closure
        if (before || after) {
          const beforeData = before as {
            decoded: unknown;
            accountType?: string;
          } | null;
          const afterData = after as {
            decoded: unknown;
            accountType?: string;
          } | null;

          accountSnapshots[name] = {
            before: beforeData?.decoded || null,
            after: afterData?.decoded || null,
            accountType: beforeData?.accountType || afterData?.accountType,
          };
        }
      }

      txToast.dismiss(toastId);

      txToast.success(
        signature,
        `Instruction ${instruction.name} executed successfully`
      );

      addTransaction({
        signature,
        instructionName: instruction.name,
        programId: idl.address,
        status: "success",
        timestamp: Date.now(),
        accounts: Object.fromEntries(accountMap),
        accountSnapshots:
          Object.keys(accountSnapshots).length > 0
            ? accountSnapshots
            : undefined,
      });

      return { signature, accounts: accountMap };
    } catch (error: unknown) {
      console.error("Transaction error:", error);

      if (error instanceof Error) {
        // Check for the specific Borsh enum error
        if (error.message.includes("unable to infer src variant")) {
          console.error(
            "\n❌ ENUM SERIALIZATION ERROR:",
            "\nThis error occurs when an enum variant name doesn't match the IDL exactly.",
            "\nMake sure enum variants use EXACT casing from the IDL (e.g., 'USA' not 'usa').\n"
          );
        }
      }

      txToast.dismiss(toastId);

      const parsedError = parseSolanaError(
        error as Error | AnchorError | ErrorWithLogs
      );

      txToast.error(parsedError);

      const errorSignature = (error as unknown as { signature?: string })
        ?.signature;
      if (errorSignature) {
        addTransaction({
          signature: errorSignature,
          instructionName: instruction.name,
          programId: idl.address,
          status: "error",
          timestamp: Date.now(),
          error: parsedError.message,
          accounts: accounts ? Object.fromEntries(accounts) : undefined,
        });
      }

      return null;
    } finally {
      setIsExecuting(false);
      invalidateAccountQueries();
    }
  };

  return { execute, isExecuting };
}