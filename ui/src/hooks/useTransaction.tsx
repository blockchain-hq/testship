import { useState } from "react";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import type { Idl } from "@coral-xyz/anchor";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import type { Keypair } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { toast } from "sonner";
import { toAnchorType, derivePDA } from "@/lib/solana";
import { toCamelCase } from "@/lib/utils";
import type { IdlInstruction, ModIdlAccount } from "@/lib/types";
import { useTransactionToast } from "./useTransactionToast";
import { parseSolanaError } from "@/lib/errorParser";

export default function useTransaction(idl: Idl) {
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

    setIsExecuting(true);
    const toastId = txToast.loading(`Executing ${instruction.name}...`);

    try {
      // Setup program
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
              idl
            );
            accountMap.set(acc.name, pda.toBase58());
          } catch (error) {
            console.warn(`Could not auto-derive PDA for ${acc.name}:`, error);
          }
        }
      }

      // Convert accounts to PublicKeys
      const accountPubkeys: Record<string, PublicKey> = {};
      for (const [name, address] of accountMap) {
        if (!address) throw new Error(`Missing account: ${name}`);
        accountPubkeys[toCamelCase(name)] = new PublicKey(address);
      }

      // Convert args to Anchor types
      const anchorArgs = instruction.args.map((arg) => {
        const value = args[arg.name];
        if (value === undefined || value === null) {
          throw new Error(`Missing argument: ${arg.name}`);
        }
        return toAnchorType(value, arg.type);
      });

      // Execute transaction
      const signature = await program.methods[toCamelCase(instruction.name)](
        ...anchorArgs
      )
        .accounts(accountPubkeys)
        .signers(Array.from(signers.values()))
        .rpc();

      // Dismiss loading toast
      txToast.dismiss(toastId);

      // Show success toast
      txToast.success(
        signature,
        `Instruction ${instruction.name} executed successfully`
      );

      return { signature, accounts: accountMap };
    } catch (error) {
      console.error("Transaction error:", error);

      // Dismiss loading toast
      txToast.dismiss(toastId);

      // Parse the error for user-friendly display
      const parsedError = parseSolanaError(error);

      // Show error toast with parsed information
      txToast.error(parsedError);

      return null;
    } finally {
      setIsExecuting(false);
    }
  };

  return { execute, isExecuting };
}
