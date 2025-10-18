import type { IdlInstruction, ModIdlAccount, SavedAccount } from "@/lib/types";
import AccountInput from "./AccountInput";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair } from "@solana/web3.js";
import React, { useCallback, useState } from "react";
import { derivePDA } from "@/lib/solana";
import type { Idl } from "@coral-xyz/anchor";
import { toast } from "sonner";

interface AccountsFormProps {
  instruction: IdlInstruction;
  accountsMap: Map<string, string | null>;
  setAccountsMap: (map: Map<string, string | null>) => void;
  signersKeypairs: Map<string, Keypair>;
  setSignersKeypairs: (map: Map<string, Keypair>) => void;
  savedAccounts: SavedAccount[];
  validationErrors: Record<string, string>;
  setValidationErrors: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  formData: Record<string, unknown>;
  programId: string;
  idl: Idl;
}

const AccountsForm = (props: AccountsFormProps) => {
  const {
    instruction,
    accountsMap,
    setAccountsMap,
    signersKeypairs,
    setSignersKeypairs,
    savedAccounts,
    validationErrors,
    setValidationErrors,
    formData,
    programId,
    idl,
  } = props;

  const { publicKey: walletPublicKey } = useWallet();
  const { connection } = useConnection();
  const [derivingPda, setDerivingPda] = useState<string | null>(null);

  const onChange = useCallback(
    (accountName: string, value: string) => {
      const newMap = new Map(accountsMap);
      newMap.set(accountName, value);
      setAccountsMap(newMap);

      // Clear validation error for this field
      const error =
        value && value.trim() !== "" ? null : `${accountName} is required`;
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[accountName] = error;
        } else {
          delete newErrors[accountName];
        }
        return newErrors;
      });
    },
    [accountsMap, setAccountsMap, setValidationErrors]
  );

  const generateNewKeypair = useCallback(
    (accountName: string) => {
      const keypair = new Keypair();
      const newMap = new Map(accountsMap);
      newMap.set(accountName, keypair.publicKey.toBase58());
      setAccountsMap(newMap);

      const newSignersKeypairs = new Map(signersKeypairs);
      newSignersKeypairs.set(accountName, keypair);
      setSignersKeypairs(newSignersKeypairs);
    },
    [accountsMap, setAccountsMap, signersKeypairs, setSignersKeypairs]
  );

  const handleUseWallet = useCallback(
    (accountName: string) => {
      if (!walletPublicKey) return;

      const newMap = new Map(accountsMap);
      newMap.set(accountName, walletPublicKey.toBase58());
      setAccountsMap(newMap);

      const newSignersKeypairs = new Map(signersKeypairs);
      newSignersKeypairs.delete(accountName);
      setSignersKeypairs(newSignersKeypairs);
    },
    [
      walletPublicKey,
      accountsMap,
      setAccountsMap,
      signersKeypairs,
      setSignersKeypairs,
    ]
  );

  const onDerivePda = async (account: ModIdlAccount) => {
    if (!account.pda?.seeds) return;

    setDerivingPda(account.name);

    try {
      const pda = await derivePDA(
        account.pda.seeds,
        programId,
        accountsMap,
        formData,
        connection,
        idl
      );

      const newMap = new Map(accountsMap);
      newMap.set(account.name, pda.toBase58());
      setAccountsMap(newMap);

      toast.success(`Derived PDA for ${account.name}`);
    } catch (error) {
      console.error("PDA derivation error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to derive PDA";
      toast.error(message);
    } finally {
      setDerivingPda(null);
    }
  };

  return (
    <div className="space-y-2 flex flex-col w-full justify-center items-center">
      {instruction.accounts.map((account: ModIdlAccount) => (
        <AccountInput
          key={account.name}
          account={account}
          value={accountsMap.get(account.name) || ""}
          onChange={(value) => onChange(account.name, value)}
          onUseConnectedWallet={() => handleUseWallet(account.name)}
          generateAndUseKeypair={() => generateNewKeypair(account.name)}
          savedAccounts={savedAccounts}
          validationError={validationErrors[account.name]}
          onDerivePda={() => onDerivePda(account)}
          isDerivingPda={derivingPda === account.name}
        />
      ))}
    </div>
  );
};

export default AccountsForm;
