import type { ModIdlAccount } from "@/lib/types";
import { Button, Input, Label } from "../ui";

interface AccountInputProps {
  account: ModIdlAccount;
  value: string;
  onChange: (value: string) => void;
  onUseConnectedWallet: () => void;
  generateAndUseKeypair: () => void;
}

const AccountInput = (props: AccountInputProps) => {
  const {
    account,
    onUseConnectedWallet,
    generateAndUseKeypair,
    value,
    onChange,
  } = props;

  return (
    <div className="flex flex-col space-y-2">
      <Label htmlFor={account.name}>{account.name}</Label>
      <div className="flex flex-row gap-2">
        <Input
          id={account.name}
          type="text"
          placeholder={`Enter ${account.name}`}
          defaultValue={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
        />

        {account.signer && (
          <Button type="button" onClick={onUseConnectedWallet}>
            Use Connected Wallet
          </Button>
        )}

        {account.signer && (
          <Button type="button" onClick={generateAndUseKeypair}>
            Generate Keypair
          </Button>
        )}
      </div>
    </div>
  );
};

export default AccountInput;
