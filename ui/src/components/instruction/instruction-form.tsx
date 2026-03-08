import { useState, useEffect, useCallback } from "react";
import type {
  InstructionNode,
  ProgramNode,
  InstructionAccountNode,
  InstructionArgumentNode,
} from "@codama/nodes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { TypeInput } from "./type-input";
import { SignerAccountInput } from "./signer-account-input";
import {
  CircleNotchIcon,
  CheckCircleIcon,
  KeyIcon,
  WarningCircleIcon,
  InfoIcon,
  ArrowClockwiseIcon,
  ArrowRightIcon,
  ShareIcon,
} from "@phosphor-icons/react";
import { buildInstruction, executeTransaction } from "@/lib/transaction";
import { address } from "@solana/kit";
import { useCluster } from "@/store/use-cluster";
import { useTxHistory } from "@/store/use-tx-history";
import {
  useAutoDerivePDAs,
  isPdaAccount,
  getPdaDependencies,
  type DerivedPDA,
} from "@/hooks/use-auto-derive-pdas";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Props = {
  instruction: InstructionNode;
  programNode: ProgramNode;
};

export const InstructionForm = ({ instruction, programNode }: Props) => {
  const [accountValues, setAccountValues] = useState<Record<string, string>>(
    () => buildAccountDefaults(instruction.accounts)
  );
  const [argValues, setArgValues] = useState<Record<string, any>>({});
  const [signerKeypairs, setSignerKeypairs] = useState<
    Record<string, CryptoKeyPair | null>
  >({});
  const [executing, setExecuting] = useState(false);
  const { active: cluster, getExplorerUrl } = useCluster();
  const { addTransaction } = useTxHistory();

  // Filter out discriminator arguments (auto-handled, not user-facing)
  const discriminatorNames = new Set(
    (instruction.discriminators ?? [])
      .filter((d) => d.kind === "fieldDiscriminatorNode")
      .map((d) => d.name)
  );
  const visibleArgs = instruction.arguments.filter(
    (arg) => !discriminatorNames.has(arg.name)
  );

  const derivedPDAs = useAutoDerivePDAs(
    instruction.accounts,
    programNode,
    accountValues,
    argValues
  );

  // auto-fill derived PDA addresses
  useEffect(() => {
    derivedPDAs.forEach((pda, name) => {
      if (pda.status === "ready" && pda.address) {
        setAccountValues((prev) => {
          if (prev[name] !== pda.address) {
            return { ...prev, [name]: pda.address };
          }
          return prev;
        });
      }
    });
  }, [derivedPDAs]);

  const setAccount = (name: string, value: string) =>
    setAccountValues((prev) => ({ ...prev, [name]: value }));

  const setSignerAccount = useCallback(
    (name: string, addr: string, keypair: CryptoKeyPair | null) => {
      setAccountValues((prev) => ({ ...prev, [name]: addr }));
      setSignerKeypairs((prev) => ({ ...prev, [name]: keypair }));
    },
    []
  );

  const setArg = (name: string, value: any) =>
    setArgValues((prev) => ({ ...prev, [name]: value }));

  const handleExecute = async () => {
    if (!programNode.publicKey) return;

    setExecuting(true);

    try {
      const ix = buildInstruction(
        instruction,
        accountValues,
        argValues,
        programNode.publicKey,
        programNode
      );

      const feePayer = address(accountValues[instruction.accounts[0]?.name] ?? "");

      const txResult = await executeTransaction(
        ix,
        feePayer,
        cluster.endpoint,
        async (tx) => tx
      );

      addTransaction({
        signature: txResult.signature,
        instructionName: instruction.name,
        programName: programNode.name,
        status: txResult.success ? "success" : "error",
        error: txResult.error,
        timestamp: Date.now(),
        logs: txResult.logs,
      });

      if (txResult.success) {
        toast.success("Transaction Successful", {
          description: `${instruction.name} executed successfully`,
          action: {
            label: "View on Explorer",
            onClick: () => window.open(getExplorerUrl(txResult.signature, "tx"), "_blank"),
          },
        });
      } else {
        toast.error("Transaction Failed", {
          description: txResult.error,
        });
      }
    } catch (err: any) {
      addTransaction({
        signature: "",
        instructionName: instruction.name,
        programName: programNode.name,
        status: "error",
        error: err.message ?? String(err),
        timestamp: Date.now(),
      });
      toast.error(err.message ?? String(err));
    } finally {
      setExecuting(false);
    }
  };

  const pdaCount = instruction.accounts.filter(isPdaAccount).length;
  const signerCount = instruction.accounts.filter((a) => a.isSigner === true).length;

  return (
    <form
      className="w-full bg-card flex flex-col h-full"
      onSubmit={(e) => { e.preventDefault(); handleExecute(); }}
    >
      <ScrollArea className="flex-1">
        <div className="space-y-6 px-4 py-4">
          {visibleArgs.length > 0 && (
            <section className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Arguments ({visibleArgs.length})
              </h4>
              <div className="space-y-3">
                {visibleArgs.map((arg) => (
                  <ArgField
                    key={arg.name}
                    arg={arg}
                    value={argValues[arg.name]}
                    onChange={(v) => setArg(arg.name, v)}
                    programNode={programNode}
                  />
                ))}
              </div>
            </section>
          )}

          {visibleArgs.length > 0 && instruction.accounts.length > 0 && (
            <Separator />
          )}

          {instruction.accounts.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Accounts ({instruction.accounts.length})
                </h4>
                <div className="flex gap-1.5">
                  {pdaCount > 0 && (
                    <Badge variant="outline" className="text-[10px]">
                      {pdaCount} PDA
                    </Badge>
                  )}
                  {signerCount > 0 && (
                    <Badge variant="outline" className="text-[10px]">
                      {signerCount} Signer
                    </Badge>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                {instruction.accounts.map((acc) =>
                  acc.isSigner === true && !isPdaAccount(acc) ? (
                    <SignerAccountInput
                      key={acc.name}
                      account={acc}
                      value={accountValues[acc.name] ?? ""}
                      onChange={(addr, kp) =>
                        setSignerAccount(acc.name, addr, kp)
                      }
                    />
                  ) : (
                    <AccountField
                      key={acc.name}
                      account={acc}
                      value={accountValues[acc.name] ?? ""}
                      onChange={(v) => setAccount(acc.name, v)}
                      derivedPDA={derivedPDAs.get(acc.name)}
                      argValues={argValues}
                      accountValues={accountValues}
                    />
                  )
                )}
              </div>
            </section>
          )}
        </div>
      </ScrollArea>

      <div className="flex items-center justify-end gap-2 border-t px-4 py-2 shrink-0">
        <Button variant="outline" size="sm" type="button" disabled>
          <ShareIcon className="size-3.5" />
        </Button>
        <Button type="submit" disabled={executing} className="gap-2">
          {executing ? (
            <CircleNotchIcon className="size-4 animate-spin" />
          ) : (
            <ArrowRightIcon className="size-4" />
          )}
          {executing ? "Running..." : "Run Instruction"}
        </Button>
      </div>
    </form>
  );
};

const AccountField = ({
  account,
  value,
  onChange,
  derivedPDA,
  argValues,
  accountValues,
}: {
  account: InstructionAccountNode;
  value: string;
  onChange: (v: string) => void;
  derivedPDA?: DerivedPDA;
  argValues: Record<string, any>;
  accountValues: Record<string, string>;
}) => {
  const isPda = isPdaAccount(account);

  const getPdaBadge = () => {
    if (!isPda) return null;

    if (derivedPDA?.status === "deriving") {
      return (
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="text-[9px] gap-1 bg-orange-500/20 text-orange-700 border-orange-500/30">
              <CircleNotchIcon className="size-3 animate-spin" />
              Deriving
            </Badge>
          </TooltipTrigger>
          <TooltipContent><p className="text-xs">Calculating PDA address...</p></TooltipContent>
        </Tooltip>
      );
    }

    if (derivedPDA?.status === "ready") {
      return (
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="text-[9px] gap-1 bg-green-500/20 text-green-700 border-green-500/30">
              <CheckCircleIcon className="size-3" />
              Auto-PDA
            </Badge>
          </TooltipTrigger>
          <TooltipContent><p className="text-xs">Address automatically derived</p></TooltipContent>
        </Tooltip>
      );
    }

    if (derivedPDA?.status === "error") {
      return (
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="text-[9px] gap-1 bg-red-500/20 text-red-700 border-red-500/30">
              <WarningCircleIcon className="size-3" />
              Error
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs"><p className="text-xs">{derivedPDA.error}</p></TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="text-[9px] gap-1 bg-yellow-300/50 text-yellow-800 border-yellow-500/30">
            <KeyIcon className="size-3" />
            PDA
          </Badge>
        </TooltipTrigger>
        <TooltipContent><p className="text-xs">Program Derived Address - will auto-calculate</p></TooltipContent>
      </Tooltip>
    );
  };

  const getPdaStatus = () => {
    if (!isPda) return null;

    if (derivedPDA?.status === "ready" && value) {
      return (
        <div className="flex items-center gap-1.5 text-xs">
          <CheckCircleIcon className="size-3 text-green-500" />
          <span className="text-green-600">Auto-derived successfully</span>
        </div>
      );
    }

    if (derivedPDA?.status === "deriving") {
      return (
        <div className="flex items-center gap-1.5 text-xs">
          <CircleNotchIcon className="size-3 text-orange-500 animate-spin" />
          <span className="text-orange-600">Calculating PDA address...</span>
        </div>
      );
    }

    if (derivedPDA?.status === "error") {
      return (
        <div className="flex items-center gap-1.5 text-xs">
          <WarningCircleIcon className="size-3 text-red-500" />
          <span className="text-red-600">{derivedPDA.error}</span>
        </div>
      );
    }

    if (!derivedPDA || derivedPDA.status === "idle") {
      const deps = getPdaDependencies(account);
      const missingArgs = deps.args.filter((a) => !argValues[a] && argValues[a] !== 0);
      const missingAccounts = deps.accounts.filter((a) => !accountValues[a]?.trim());
      const missing = [...missingArgs, ...missingAccounts];

      if (missing.length > 0) {
        return (
          <div className="flex items-start gap-1.5 text-xs">
            <InfoIcon className="size-3 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <span className="text-blue-600 font-medium">Waiting for dependencies:</span>
              <ul className="mt-0.5 space-y-0.5 text-blue-600/80">
                {missing.map((dep) => (
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

  const inputClassName = cn(
    "transition-all",
    isPda && derivedPDA?.status === "deriving" && "bg-orange-500/5 border-orange-500/30",
    isPda && derivedPDA?.status === "ready" && "bg-green-500/10 border-green-500/30",
    isPda && derivedPDA?.status === "error" && "border-red-500",
  );

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">{account.name}</Label>
        <div className="ml-auto flex items-center gap-1.5">
          {account.isWritable && (
            <Badge variant="outline" className="text-[9px] px-1 py-0">Writable</Badge>
          )}
          {account.isSigner === true && (
            <Badge variant="outline" className="text-[9px] px-1 py-0 bg-primary/10">Signer</Badge>
          )}
          {getPdaBadge()}
        </div>
      </div>
      <div className="flex gap-2">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isPda ? "Will auto-derive when ready..." : `Enter ${account.name} address`}
          className={cn("font-mono text-xs", inputClassName)}
          readOnly={isPda && derivedPDA?.status === "deriving"}
          disabled={isPda && derivedPDA?.status === "deriving"}
        />
        {isPda && derivedPDA?.status === "ready" && (
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0 border-green-300 bg-green-500/10 text-green-600"
                onClick={() => onChange("")}
              >
                <ArrowClockwiseIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p className="text-xs">Clear and re-derive</p></TooltipContent>
          </Tooltip>
        )}
      </div>
      {getPdaStatus()}
    </div>
  );
};

const ArgField = ({
  arg,
  value,
  onChange,
  programNode,
}: {
  arg: InstructionArgumentNode;
  value: any;
  onChange: (v: any) => void;
  programNode: ProgramNode;
}) => (
  <div className="space-y-1">
    <div className="flex items-center gap-2">
      <Label className="text-sm font-medium">{arg.name}</Label>
      <span className="text-[10px] text-muted-foreground">({typeLabel(arg.type)})</span>
    </div>
    <TypeInput
      type={arg.type}
      value={value}
      onChange={onChange}
      programNode={programNode}
    />
  </div>
);

const buildAccountDefaults = (
  accounts: InstructionAccountNode[]
): Record<string, string> => {
  const defaults: Record<string, string> = {};
  for (const acc of accounts) {
    if (acc.defaultValue && acc.defaultValue.kind === "publicKeyValueNode") {
      defaults[acc.name] = acc.defaultValue.publicKey;
    }
  }
  return defaults;
};

const typeLabel = (type: any): string => {
  if (!type) return "";
  if (type.kind === "numberTypeNode") return type.format;
  if (type.kind === "booleanTypeNode") return "bool";
  if (type.kind === "publicKeyTypeNode") return "pubkey";
  if (type.kind === "stringTypeNode") return "string";
  if (type.kind === "bytesTypeNode") return "bytes";
  if (type.kind === "optionTypeNode") return `Option<${typeLabel(type.item)}>`;
  if (type.kind === "arrayTypeNode") return `Vec<${typeLabel(type.item)}>`;
  if (type.kind === "definedTypeLinkNode") return type.name;
  if (type.kind === "enumTypeNode") return "enum";
  if (type.kind === "structTypeNode") return "struct";
  if (type.kind === "tupleTypeNode") return "tuple";
  return type.kind?.replace("TypeNode", "") ?? "unknown";
};
