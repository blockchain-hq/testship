import type { ModIdlAccount, SavedAccount } from "@/lib/types";
import { Button, Input, Label } from "../ui";
import { memo } from "react";

interface AccountInputProps {
  account: ModIdlAccount;
  value: string;
  onChange: (value: string) => void;
  onUseConnectedWallet: () => void;
  generateAndUseKeypair: () => void;
  savedAccounts: SavedAccount[];
}

const AccountInput = (props: AccountInputProps) => {
  const {
    account,
    onUseConnectedWallet,
    generateAndUseKeypair,
    value,
    onChange,
    savedAccounts,
  } = props;

  const dataListId = `${account.name}-suggestions`;

  return (
    <div className="flex flex-col space-y-2">
      <Label htmlFor={account.name}>{account.name}</Label>
      <div className="flex flex-row gap-2">
        <Input
          id={account.name}
          type="text"
          placeholder={`Enter ${account.name}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
          list={dataListId}
        />

        <datalist id={dataListId}>
          {savedAccounts.map((savedAcc) => (
            <option key={savedAcc.address} value={savedAcc.address}>
              {savedAcc.instructionName} - {savedAcc.accountName} -{" "}
              {new Date(savedAcc.timestamp).toLocaleString()}
            </option>
          ))}
        </datalist>

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

export default memo(AccountInput);
