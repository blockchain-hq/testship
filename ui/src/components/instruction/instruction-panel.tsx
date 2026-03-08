import { useActiveProgram } from "@/store/use-workspace";
import { useInstructionStore } from "@/store/use-instruction";
import { InstructionForm } from "./instruction-form";

export const InstructionPanel = () => {
  const program = useActiveProgram();
  const selected = useInstructionStore((s) => s.selected);

  if (!program) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No program loaded
      </div>
    );
  }

  const instruction = program.programNode.instructions.find(
    (ix) => ix.name === selected
  );

  if (!instruction) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select an instruction above
      </div>
    );
  }

  return (
    <InstructionForm
      key={`${program.name}-${instruction.name}`}
      instruction={instruction}
      programNode={program.programNode}
    />
  );
};
