import { Label } from "../ui/label";
import { Input } from "../ui/input";
import type { ModIdlAccount } from "@/lib/types";
import SignerAccountInput from "../accounts/SignerAccountInput";
import {
  isAccountPda,
  getPDAStatusMessage,
  getPDADependencies,
} from "@/lib/pdaUtils";
import { Badge } from "../ui";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import {
  KeyIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  InfoIcon,
  RefreshCw,
} from "lucide-react";
import type { Keypair } from "@solana/web3.js";
import { cn } from "@/lib/utils";
import { useCallback, useEffect } from "react";
import { Button } from "../ui/button";
import { useSavedAccounts } from "@/context/SavedAccountsContext";

interface AccountsFormv2Props {
  accounts: ModIdlAccount[] | null;
  accountsAddressMap: Map<string, string | null>;
  onAccountChange: (accountsAddressMap: Map<string, string | null>) => void;
  signersKeypairs: Map<string, Keypair>;
  onSignerChange: (signersKeypairs: Map<string, Keypair>) => void;
  validationErrors: Record<string, string>;
  formData: Record<string, string | number>;
  derivedPDAs: Map<
    string,
    {
      address: string;
      status: "idle" | "deriving" | "ready" | "error";
      error?: string;
    }
  >;
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

  const { savedAccounts } = useSavedAccounts();

  const handleAccountChange = useCallback(
    (accountName: string, address: string | null) => {
      const newMap = new Map(accountsAddressMap);
      newMap.set(accountName, address);
      onAccountChange(newMap);
    },
    [accountsAddressMap, onAccountChange]
  );

  const handleSignerChange = useCallback(
    (accountName: string, address: string | null, keypair: Keypair | null) => {
      handleAccountChange(accountName, address);
      const newSignersMap = new Map(signersKeypairs);
      if (keypair) {
        newSignersMap.set(accountName, keypair);
      } else {
        newSignersMap.delete(accountName);
      }
      onSignerChange(newSignersMap);
    },
    [signersKeypairs, onSignerChange, handleAccountChange]
  );

  const handleClearPDA = useCallback(
    (accountName: string) => {
      handleAccountChange(accountName, null);
    },
    [handleAccountChange]
  );

  useEffect(() => {
    console.log("accountsAddressMap", accountsAddressMap);
  }, [accountsAddressMap]);

  const getPDABadge = (account: ModIdlAccount) => {
    if (!isAccountPda(account)) return null;

    const derivedStatus = derivedPDAs.get(account.name);

    if (derivedStatus?.status === "deriving") {
      return (
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className="text-xs gap-2 bg-orange-500/20 text-orange-700 border-orange-500/30"
            >
              <Loader2 className="w-3 h-3 animate-spin" />
              Deriving
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Calculating PDA address...</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    if (derivedStatus?.status === "ready") {
      return (
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className="text-xs gap-2 bg-green-500/20 text-green-700 border-green-500/30"
            >
              <CheckCircle2 className="w-3 h-3" />
              Auto-PDA
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Address automatically derived</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    if (derivedStatus?.status === "error") {
      return (
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className="text-xs gap-2 bg-red-500/20 text-red-700 border-red-500/30"
            >
              <AlertCircle className="w-3 h-3" />
              Error
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-xs">{derivedStatus.error}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className="text-xs gap-2 bg-yellow-300/50 text-yellow-800 border-yellow-500/30"
          >
            <KeyIcon className="w-3 h-3" />
            PDA
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            Program Derived Address - will auto-calculate
          </p>
        </TooltipContent>
      </Tooltip>
    );
  };

  const getPDAStatus = (account: ModIdlAccount) => {
    if (!isAccountPda(account)) return null;

    const derivedStatus = derivedPDAs.get(account.name);
    const hasAddress = accountsAddressMap.get(account.name);

    if (derivedStatus?.status === "ready" && hasAddress) {
      return (
        <div className="flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-3 h-3 text-green-500" />
          <span className="text-green-600">Auto-derived successfully</span>
        </div>
      );
    }

    if (derivedStatus?.status === "deriving") {
      return (
        <div className="flex items-center gap-2 text-xs">
          <Loader2 className="w-3 h-3 text-orange-500 animate-spin" />
          <span className="text-orange-600">Calculating PDA address...</span>
        </div>
      );
    }

    if (derivedStatus?.status === "error") {
      return (
        <div className="flex items-start gap-2 text-xs">
          <AlertCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
          <span className="text-red-600">
            {derivedStatus.error || "Failed to derive PDA"}
          </span>
        </div>
      );
    }

    if (derivedStatus?.status === "idle" || !derivedStatus) {
      const statusMessage = getPDAStatusMessage(
        account,
        formData,
        accountsAddressMap
      );

      if (statusMessage.includes("Waiting for")) {
        const deps = getPDADependencies(account);
        const missingDeps = [
          ...deps.args.filter((arg) => !formData[arg]),
          ...deps.accounts.filter((acc) => !accountsAddressMap.get(acc)),
        ];

        return (
          <div className="flex items-start gap-2 text-xs">
            <InfoIcon className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-blue-600 font-medium">
                Waiting for dependencies:
              </span>
              <ul className="mt-1 space-y-0.5 text-blue-600/80">
                {missingDeps.map((dep) => (
                  <li key={dep}>• {dep}</li>
                ))}
              </ul>
            </div>
          </div>
        );
      }
    }

    return null;
  };

  const getInputClassName = (account: ModIdlAccount) => {
    if (!isAccountPda(account)) {
      return cn(
        "transition-all",
        validationErrors[account.name] && "border-red-500"
      );
    }

    const derivedStatus = derivedPDAs.get(account.name);

    return cn(
      "transition-all",
      derivedStatus?.status === "deriving" &&
        "bg-orange-500/5 border-orange-500/30 cursor-not-allowed",
      derivedStatus?.status === "ready" &&
        "bg-green-500/10 border-green-500/30",
      derivedStatus?.status === "error" && "border-red-500",
      validationErrors[account.name] && "border-red-500"
    );
  };

  if (!accounts) return null;

  const getDataListId = (accountName: string) => {
    return `${accountName}-suggestions`;
  };

  const getFilteredSuggestions = (accountName: string) => {
    return savedAccounts
      .filter((savedAcc) => savedAcc.accountName === accountName)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
  };

  return (
    <div className="flex flex-col bg-card border border-border/50 rounded-md p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground/90 uppercase tracking-wider">
          {accounts.length > 0
            ? `Accounts (${accounts.length})`
            : "No Accounts"}
        </h4>

        {accounts.length > 0 && (
          <div className="flex gap-2">
            {accounts.filter(isAccountPda).length > 0 && (
              <Badge variant="outline" className="text-xs">
                {accounts.filter(isAccountPda).length} PDA
              </Badge>
            )}
            {accounts.filter((a) => a.signer).length > 0 && (
              <Badge variant="outline" className="text-xs">
                {accounts.filter((a) => a.signer).length} Signer
              </Badge>
            )}
          </div>
        )}
      </div>

      {accounts.map((account) =>
        account.signer ? (
          <SignerAccountInput
            key={account.name}
            account={account}
            signerAccountAddress={accountsAddressMap.get(account.name) ?? null}
            signerAccountKeypair={signersKeypairs.get(account.name) ?? null}
            onChange={(address, keypair) =>
              handleSignerChange(account.name, address, keypair)
            }
          />
        ) : (
          <div
            key={account.name}
            className={cn(
              "grid w-full items-center gap-3 p-3 rounded-lg transition-all",
              isAccountPda(account) &&
                derivedPDAs.get(account.name)?.status === "ready" &&
                "bg-green-500/5"
            )}
          >
            <div className="flex flex-row items-center gap-2 w-full">
              <Label
                htmlFor={account.name}
                className="text-sm font-medium text-foreground text-left"
              >
                {account.name}
              </Label>

              <div className="ml-auto flex items-center gap-2">
                {account.writable && (
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="text-xs">
                        Writable
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">This account will be modified</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {getPDABadge(account)}
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                id={account.name}
                type="text"
                value={accountsAddressMap.get(account.name) ?? ""}
                placeholder={
                  isAccountPda(account)
                    ? "Will auto-derive when ready..."
                    : `Enter ${account.name} address`
                }
                onChange={(e) =>
                  handleAccountChange(account.name, e.target.value)
                }
                className={getInputClassName(account)}
                readOnly={
                  isAccountPda(account) &&
                  derivedPDAs.get(account.name)?.status === "deriving"
                }
                disabled={
                  isAccountPda(account) &&
                  derivedPDAs.get(account.name)?.status === "deriving"
                }
                list={getDataListId(account.name)}
              />

              <datalist id={getDataListId(account.name)}>
                {getFilteredSuggestions(account.name).map((savedAcc) => (
                  <option key={savedAcc.address} value={savedAcc.address} />
                ))}
              </datalist>

              {isAccountPda(account) &&
                derivedPDAs.get(account.name)?.status === "ready" && (
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleClearPDA(account.name)}
                        className="flex-shrink-0"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Clear and re-derive</p>
                    </TooltipContent>
                  </Tooltip>
                )}
            </div>

            {getPDAStatus(account)}

            {validationErrors[account.name] && (
              <div className="flex items-start gap-2 text-xs text-red-500">
                <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>{validationErrors[account.name]}</span>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default AccountsFormv2;
