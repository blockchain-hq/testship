import type { IdlInstruction } from "@/lib/types";
import AccountInput from "./AccountInput";
import { useWallet } from "@solana/wallet-adapter-react";
import { Keypair } from "@solana/web3.js";

interface AccountsFormProps {
  instruction: IdlInstruction;
  accountsMap: Map<string, string | null>;
  setAccountsMap: (map: Map<string, string | null>) => void;
}

const AccountsForm = (props: AccountsFormProps) => {
  const { instruction, accountsMap, setAccountsMap } = props;

  const { publicKey: walletPublicKey } = useWallet();

  const onChange = (accountName: string, value: string) => {
    const newMap = new Map(accountsMap);
    newMap.set(accountName, value);
    setAccountsMap(newMap);
  };

  const generateNewKeypair = (accountName: string) => {
    const keypair = new Keypair();
    onChange(accountName, keypair.publicKey.toBase58());
  };

  return (
    <div className="space-y-2 flex flex-col justify-center items-center gap-4">
      {instruction.accounts.map((account) => (
        <AccountInput
          key={account.name}
          account={account}
          value={accountsMap.get(account.name) || ""}
          onChange={(value) => {
            onChange(account.name, value);
          }}
          onUseConnectedWallet={() => {
            console.log("using connected wallet");
            console.log(walletPublicKey?.toBase58());
            accountsMap.set(account.name, walletPublicKey?.toBase58() || "");
          }}
          generateAndUseKeypair={() => {
            generateNewKeypair(account.name);
          }}
        />
      ))}
    </div>
  );
};

export default AccountsForm;
