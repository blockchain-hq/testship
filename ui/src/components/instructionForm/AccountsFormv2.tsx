import { Label } from "../ui/label";
import { Input } from "../ui/input";
import type { ModIdlAccount } from "@/lib/types";
import SignerAccountInput from "../accounts/SignerAccountInput";
import { isAccountPda } from "@/lib/pdaUtils";
import { Badge } from "../ui";
import { KeyIcon } from "lucide-react";

interface AccountsFormv2Props {
  accounts: ModIdlAccount[] | null;
}

const AccountsFormv2 = (props: AccountsFormv2Props) => {
  const { accounts } = props;

  if (!accounts) return null;
  return (
    <div className="flex flex-col bg-card border border-border/50 rounded-md p-4 space-y-4">
      <h4 className="text-sm font-semibold text-foreground/90 uppercase tracking-wider">
        {accounts.length > 0 ? `Accounts (${accounts.length})` : "No Accounts"}
      </h4>

      {accounts.map((account) =>
        account.signer ? (
          <SignerAccountInput key={account.name} account={account} />
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
              placeholder={`Enter value for ${account.name}`}
            />
          </div>
        )
      )}
    </div>
  );
};

export default AccountsFormv2;
