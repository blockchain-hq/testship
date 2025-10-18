import type { ModIdlAccount, SavedAccount } from "@/lib/types";
import { Badge, Button, Input, Label } from "../ui";
import { memo } from "react";
import {
  isAccountPda,
  isPdaAutoDerivable,
  isPdaComplexToDerive,
} from "@/lib/pdaUtils";
import { Loader2 } from "lucide-react";

interface AccountInputProps {
  account: ModIdlAccount;
  value: string;
  onChange: (value: string) => void;
  onUseConnectedWallet: () => void;
  generateAndUseKeypair: () => void;
  savedAccounts: SavedAccount[];
  onDerivePda: () => void;
  validationError?: string;
  isDerivingPda?: boolean;
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
    isDerivingPda,
  } = props;

  const dataListId = `${account.name}-suggestions`;
  const filteredSuggestions = savedAccounts
    .filter((savedAcc) => savedAcc.accountName === account.name)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);

  return (
    <div className="flex flex-col space-y-2 w-full justify-center items-start gap-4 border border-muted p-4 rounded-md">
      <div className="flex flex-row gap-2 w-full">
        <Label htmlFor={account.name}>{account.name}</Label>
        {account.signer && <Badge variant="secondary">Signer</Badge>}
        {account.writable && <Badge variant="default">Writable</Badge>}
        {isAccountPda(account) && <Badge variant="default">PDA</Badge>}
        {isPdaAutoDerivable(account) && (
          <Badge variant="outline">Auto-derivable</Badge>
        )}
        {isPdaComplexToDerive(account) && (
          <Badge variant="outline">Complex PDA</Badge>
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
          disabled={isDerivingPda}
        />

        {isPdaAutoDerivable(account) && (
          <Button type="button" onClick={onDerivePda} disabled={isDerivingPda}>
            {isDerivingPda ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Deriving...
              </>
            ) : isPdaComplexToDerive(account) ? (
              "Derive (Advanced)"
            ) : (
              "Derive"
            )}
          </Button>
        )}

        <datalist id={dataListId}>
          {filteredSuggestions.map((savedAcc) => (
            <option key={savedAcc.address} value={savedAcc.address}>
              {savedAcc.instructionName} - {savedAcc.accountName} -{" "}
              {new Date(savedAcc.timestamp).toLocaleString()}
            </option>
          ))}
        </datalist>

        {account.signer && (
          <>
            <Button type="button" onClick={onUseConnectedWallet}>
              Use Wallet
            </Button>
            <Button type="button" onClick={generateAndUseKeypair}>
              Generate
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default memo(AccountInput);
