import type { ModIdlAccount, SavedAccount } from "@/lib/types";
import { Badge, Button, Input, Label } from "../ui";
import { memo } from "react";
import { derivePda, isAccountPda, isPdaAutoDerivable } from "@/lib/pdaUtils";

interface AccountInputProps {
  account: ModIdlAccount;
  value: string;
  onChange: (value: string) => void;
  onUseConnectedWallet: () => void;
  generateAndUseKeypair: () => void;
  savedAccounts: SavedAccount[];
  onDerivePda: () => void;
  validationError?: string;
}

const AccountInput = (props: AccountInputProps) => {
  const {
    account,
    onUseConnectedWallet,
    generateAndUseKeypair,
    value,
    onChange,
    savedAccounts,
    validationError,
    onDerivePda,
  } = props;

  const dataListId = `${account.name}-suggestions`;

  return (
    <div className="flex flex-col space-y-2 w-full justify-center items-start gap-4 border border-muted p-4 rounded-md">
      <div className="flex flex-row gap-2 w-full">
        <Label htmlFor={account.name}>{account.name}</Label>
        {account.signer && <Badge variant="secondary">Signer</Badge>}
        {account.writable && <Badge variant="default">Writable</Badge>}
        {isAccountPda(account) && <Badge variant="default">PDA</Badge>}
        {isPdaAutoDerivable(account) && (
          <Badge variant="outline">PDA Auto Derivable</Badge>
        )}
      </div>

      {validationError && (
        <p className="text-red-500 text-sm">{validationError}</p>
      )}

      <div className="flex flex-row gap-2 w-full">
        <Input
          id={account.name}
          type="text"
          placeholder={`Enter ${account.name}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
          list={dataListId}
        />

        {isPdaAutoDerivable(account) && (
          <Button type="button" className="right-0" onClick={onDerivePda}>
            Derive
          </Button>
        )}

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
