import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import type { ModIdlAccount } from "@/lib/types";

interface AccountsFormv2Props {
  accounts: ModIdlAccount[] | null;
}

const AccountsFormv2 = (props: AccountsFormv2Props) => {
  const { accounts } = props;

  if (!accounts) return null;
  return (
    <div className="flex flex-col bg-level-2-bg w-full max-w-[800px] border-level-2-border border rounded-md p-4 gap-8">
      <h4 className="text-sm font-medium text-foreground dark:text-foreground-dark">
        Accounts ({accounts.length})
      </h4>

      {accounts.map((account) => (
        <div key={account.name} className="grid w-full items-center gap-3">
          <Label
            htmlFor={account.name}
            className="text-foreground dark:text-foreground-dark text-left w-full"
          >
            {account.name}
          </Label>
          <Input
            id={account.name}
            type="text"
            placeholder={`Enter value for ${account.name}`}
            className="text-foreground dark:text-foreground-dark bg-level-3-bg text-left w-full"
          />
        </div>
      ))}
    </div>
  );
};

export default AccountsFormv2;
