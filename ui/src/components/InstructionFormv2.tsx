import type { IdlInstruction } from "@/lib/types";
import type { Idl } from "@coral-xyz/anchor";
import ArgumentForm from "./instructionForm/ArgumentForm";
import AccountsFormv2 from "./instructionForm/AccountsFormv2";
import { Button, ScrollArea } from "./ui";
import { Share } from "lucide-react";

interface InstructionFormv2Props {
  instruction: IdlInstruction | null;
  idl: Idl;
}

const InstructionFormv2 = (props: InstructionFormv2Props) => {
  const { instruction, idl } = props;
  if (!instruction) return null;
  return (
    <div className="bg-level-2-bg w-full max-w-[800px] border-level-2-border border rounded-md p-4 space-y-8">
      <ScrollArea className="h-[60vh] border border-level-2-border rounded-md overflow-hidden">
        <div className="space-y-8">
          <ArgumentForm args={instruction.args ?? null} />
          <AccountsFormv2 accounts={instruction.accounts ?? null} />
        </div>
      </ScrollArea>

      <div className="flex flex-row justify-end items-center gap-2">
        <Button
          variant="outline"
          className="bg-level-4-primary hover:bg-level-4-primary/90 text-white shadow-lg shadow-level-4-primary/30 hover:shadow-xl hover:shadow-level-4-primary/50  transition-all"
        >
          <Share />
        </Button>

        <Button className="bg-level-4-primary hover:bg-level-4-primary/90 text-white shadow-lg shadow-level-4-primary/30 hover:shadow-xl hover:shadow-level-4-primary/50  transition-all">
          Run Instruction
        </Button>
      </div>
    </div>
  );
};

export default InstructionFormv2;
