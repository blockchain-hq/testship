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
import { Play } from "lucide-react";

type Props = {
  instruction: InstructionNode;
  programNode: ProgramNode;
};

export const InstructionForm = ({ instruction, programNode }: Props) => {
  const [accountValues, setAccountValues] = useState<Record<string, string>>(
    () => buildAccountDefaults(instruction.accounts)
  );
  const [argValues, setArgValues] = useState<Record<string, any>>({});

  const setAccount = (name: string, value: string) =>
    setAccountValues((prev) => ({ ...prev, [name]: value }));

  const setArg = (name: string, value: any) =>
    setArgValues((prev) => ({ ...prev, [name]: value }));

  const handleExecute = () => {
    console.log("Execute:", {
      program: programNode.publicKey,
      instruction: instruction.name,
      accounts: accountValues,
      args: argValues,
    });
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

      <Button onClick={handleExecute} className="gap-2">
        <Play className="h-3.5 w-3.5" />
        Execute
      </Button>
    </div>
  );
};

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
