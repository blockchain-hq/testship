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
import { type TransactionRecord } from "./useTransactionHistory";
import { useIDL } from "@/context/IDLContext";

export default function useTransaction(
  addTransaction: (tx: TransactionRecord) => void
) {
  const { idl } = useIDL();
  const [isExecuting, setIsExecuting] = useState(false);
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const txToast = useTransactionToast();

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

      // auto-derive
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

      const anchorArgs = instruction.args.map((arg) => {
        const value = args[arg.name];
        if (value === undefined || value === null) {
          throw new Error(`Missing argument: ${arg.name}`);
        }
        return toAnchorType(value, arg.type);
      });

      for (const [name, pubkey] of Object.entries(accountPubkeys)) {
        const balance = await connection.getBalance(pubkey as PublicKey);
        console.log(
          `${name}:`,
          pubkey.toBase58(),
          "Balance:",
          balance / 1e9,
          "SOL"
        );
      }

      const signature = await program.methods[toCamelCase(instruction.name)](
        ...anchorArgs
      )
        .accounts(accountPubkeys)
        .signers(Array.from(signers.values()))
        .rpc();

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
      });

      return { signature, accounts: accountMap };
    } catch (error: unknown) {
      console.error("Transaction error:", error);

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
    }
  };

  return { execute, isExecuting };
}
