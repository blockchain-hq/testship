import { useState } from "react";
import type {
  InstructionNode,
  ProgramNode,
  InstructionAccountNode,
  InstructionArgumentNode,
} from "@codama/nodes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TypeInput } from "./type-input";
import { Play, Loader2, CheckCircle, XCircle } from "lucide-react";
import { buildInstruction, executeTransaction, type TxResult } from "@/lib/transaction";
import { address } from "@solana/kit";

type Props = {
  instruction: InstructionNode;
  programNode: ProgramNode;
};

export const InstructionForm = ({ instruction, programNode }: Props) => {
  const [accountValues, setAccountValues] = useState<Record<string, string>>(
    () => buildAccountDefaults(instruction.accounts)
  );
  const [argValues, setArgValues] = useState<Record<string, any>>({});
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<TxResult | null>(null);

  const setAccount = (name: string, value: string) =>
    setAccountValues((prev) => ({ ...prev, [name]: value }));

  const setArg = (name: string, value: any) =>
    setArgValues((prev) => ({ ...prev, [name]: value }));

  const handleExecute = async () => {
    if (!programNode.publicKey) return;

    setExecuting(true);
    setResult(null);

    try {
      const ix = buildInstruction(
        instruction,
        accountValues,
        argValues,
        programNode.publicKey,
        programNode
      );

      // TODO: wire wallet signer and RPC URL from connector
      const rpcUrl = "http://127.0.0.1:8899";
      const feePayer = address(accountValues[instruction.accounts[0]?.name] ?? "");

      const txResult = await executeTransaction(
        ix,
        feePayer,
        rpcUrl,
        async (tx) => tx // placeholder: needs real wallet signing
      );

      setResult(txResult);
    } catch (err: any) {
      setResult({
        signature: "",
        success: false,
        error: err.message ?? String(err),
      });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold font-mono">
          {instruction.name}
        </h2>
        {instruction.accounts.length > 0 && (
          <Badge variant="outline" className="text-[10px]">
            {instruction.accounts.length} accounts
          </Badge>
        )}
      </div>

      {instruction.accounts.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Accounts
          </h3>
          <div className="space-y-2">
            {instruction.accounts.map((acc) => (
              <AccountField
                key={acc.name}
                account={acc}
                value={accountValues[acc.name] ?? ""}
                onChange={(v) => setAccount(acc.name, v)}
              />
            ))}
          </div>
        </section>
      )}

      {instruction.arguments.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Arguments
          </h3>
          <div className="space-y-2">
            {instruction.arguments.map((arg) => (
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

      <div className="flex items-center gap-3">
        <Button onClick={handleExecute} disabled={executing} className="gap-2">
          {executing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
          {executing ? "Executing..." : "Execute"}
        </Button>
      </div>

      {result && <TxResultDisplay result={result} />}
    </div>
  );
};

const TxResultDisplay = ({ result }: { result: TxResult }) => (
  <div
    className={`rounded-md border p-4 text-sm font-mono space-y-2 ${
      result.success
        ? "border-green-500/30 bg-green-500/5"
        : "border-destructive/30 bg-destructive/5"
    }`}
  >
    <div className="flex items-center gap-2">
      {result.success ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-destructive" />
      )}
      <span>{result.success ? "Success" : "Failed"}</span>
    </div>
    {result.signature && (
      <div className="text-xs text-muted-foreground break-all">
        {result.signature}
      </div>
    )}
    {result.error && (
      <div className="text-xs text-destructive break-all">{result.error}</div>
    )}
    {result.logs && result.logs.length > 0 && (
      <div className="text-[11px] text-muted-foreground space-y-0.5 max-h-40 overflow-y-auto">
        {result.logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>
    )}
  </div>
);

const AccountField = ({
  account,
  value,
  onChange,
}: {
  account: InstructionAccountNode;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="flex items-center gap-2">
    <div className="flex items-center gap-1.5 w-40 shrink-0">
      <span className="text-sm font-mono truncate">{account.name}</span>
      <div className="flex gap-1">
        {account.isSigner === true && (
          <Badge variant="secondary" className="text-[9px] px-1 py-0">
            signer
          </Badge>
        )}
        {account.isWritable && (
          <Badge variant="secondary" className="text-[9px] px-1 py-0">
            mut
          </Badge>
        )}
      </div>
    </div>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Public key (base58)"
      className="flex-1 text-xs font-mono px-3 py-2 border border-border rounded-md bg-background"
    />
  </div>
);

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
  <div className="flex items-start gap-2">
    <div className="w-40 shrink-0 pt-2">
      <span className="text-sm font-mono truncate block">{arg.name}</span>
      <span className="text-[10px] text-muted-foreground">
        {typeLabel(arg.type)}
      </span>
    </div>
    <div className="flex-1">
      <TypeInput
        type={arg.type}
        value={value}
        onChange={onChange}
        programNode={programNode}
      />
    </div>
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
