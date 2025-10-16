import type { IdlInstruction, SavedAccount } from "@/lib/types";
import AccountInput from "./AccountInput";
import { useWallet } from "@solana/wallet-adapter-react";
import { Keypair } from "@solana/web3.js";
import { useCallback } from "react";

interface AccountsFormProps {
  instruction: IdlInstruction;
  accountsMap: Map<string, string | null>;
  setAccountsMap: (map: Map<string, string | null>) => void;
  signersKeypairs: Map<string, Keypair>;
  setSignersKeypairs: (map: Map<string, Keypair>) => void;
  savedAccounts: SavedAccount[];
}

const AccountsForm = (props: AccountsFormProps) => {
  const {
    instruction,
    accountsMap,
    setAccountsMap,
    signersKeypairs,
    setSignersKeypairs,
    savedAccounts,
  } = props;

  const { publicKey: walletPublicKey } = useWallet();

  const onChange = useCallback(
    (accountName: string, value: string) => {
      const newMap = new Map(accountsMap);
      newMap.set(accountName, value);
      setAccountsMap(newMap);
    },
    [accountsMap, setAccountsMap]
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

  return (
    <div className="space-y-2 flex flex-col justify-center items-center gap-4">
      {instruction.accounts.map((account) => (
        <AccountInput
          key={account.name}
          account={account}
          value={accountsMap.get(account.name) || ""}
          onChange={(value) => onChange(account.name, value)}
          onUseConnectedWallet={() => handleUseWallet(account.name)}
          generateAndUseKeypair={() => generateNewKeypair(account.name)}
          savedAccounts={savedAccounts}
        />
      ))}
    </div>
  );
};

export default AccountsForm;
