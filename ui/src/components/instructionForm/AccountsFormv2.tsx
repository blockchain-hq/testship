import { Label } from "../ui/label";
import { Input } from "../ui/input";
import type { ModIdlAccount } from "@/lib/types";
import SignerAccountInput from "../accounts/SignerAccountInput";
import { isAccountPda } from "@/lib/pdaUtils";
import { Badge } from "../ui";
import { KeyIcon } from "lucide-react";
import type { Keypair } from "@solana/web3.js";
import { cn } from "@/lib/utils";
import { useCallback } from "react";
import type { DerivedPDA } from "@/hooks/useAutoDerivePDAs";

interface AccountsFormv2Props {
  accounts: ModIdlAccount[] | null;
  accountsAddressMap: Map<string, string | null>;
  onAccountChange: (accountsAddressMap: Map<string, string | null>) => void;
  signersKeypairs: Map<string, Keypair>;
  onSignerChange: (signersKeypairs: Map<string, Keypair>) => void;
  validationErrors: Record<string, string>;
  formData: Record<string, string | number>;
  derivedPDAs: Map<string, DerivedPDA>;
}

const AccountsFormv2 = (props: AccountsFormv2Props) => {
  const {
    accounts,
    accountsAddressMap,
    onAccountChange,
    signersKeypairs,
    onSignerChange,
    validationErrors,
    formData,
    derivedPDAs,
  } = props;

  const handleAccountChange = useCallback(
    (accountName: string, address: string | null) => {
      const newMap = new Map(accountsAddressMap);
      newMap.set(accountName, address);
      onAccountChange(newMap);
    },
    [accountsAddressMap, onAccountChange]
  );

  const handleSignerChange = useCallback(
    (accountName: string, keypair: Keypair | null) => {
      if (keypair) {
        const newSignersMap = new Map(signersKeypairs);
        newSignersMap.set(accountName, keypair);
        onSignerChange(newSignersMap);
      }
    },
    [signersKeypairs, onSignerChange]
  );

  if (!accounts) return null;
  return (
    <div className="flex flex-col bg-card border border-border/50 rounded-md p-4 space-y-4">
      <h4 className="text-sm font-semibold text-foreground/90 uppercase tracking-wider">
        {accounts.length > 0 ? `Accounts (${accounts.length})` : "No Accounts"}
      </h4>

      {accounts.map((account) =>
        account.signer ? (
          <SignerAccountInput
            key={account.name}
            account={account}
            signerAccountAddress={accountsAddressMap.get(account.name) ?? null}
            signerAccountKeypair={signersKeypairs.get(account.name) ?? null}
            onChange={(address, keypair) => {
              handleAccountChange(account.name, address);
              handleSignerChange(account.name, keypair);
            }}
          />
        ) : (
          <div key={account.name} className="grid w-full items-center gap-3">
            <div className="flex flex-row items-center gap-2 w-full">
              <Label
                htmlFor={account.name}
                className="text-sm font-medium text-foreground text-left"
              >
                {account.name}
              </Label>

              {isAccountPda(account) && (
                <Badge
                  variant="outline"
                  className="self-end ml-auto text-xs gap-2 text-black bg-yellow-300/50 "
                >
                  <KeyIcon className="w-4 h-4" />
                  PDA
                </Badge>
              )}
            </div>

            <Input
              id={account.name}
              type="text"
              value={accountsAddressMap.get(account.name) ?? ""}
              placeholder={`Enter value for ${account.name}`}
              onChange={(e) =>
                handleAccountChange(account.name, e.target.value)
              }
              className={cn(
                "border-input-border text-foreground",
                validationErrors[account.name] && "border-red-500"
              )}
            />
            {validationErrors[account.name] && (
              <p className="text-red-500 text-sm">
                {validationErrors[account.name]}
              </p>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default AccountsFormv2;
