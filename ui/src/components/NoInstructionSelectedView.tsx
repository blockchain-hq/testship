import { Button } from "./ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "./ui/empty";
import { FileCode } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

const NoInstructionSelectedView = () => {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileCode />
        </EmptyMedia>
        <EmptyTitle>No Instruction Selected</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t selected any instruction yet. Get started by
          selecting an instruction.
        </EmptyDescription>
      </EmptyHeader>

      <Button
        variant="link"
        asChild
        className="text-muted-foreground"
        size="sm"
      >
        <a href="https://docs.testship.xyz" target="_blank">
          Learn More <ArrowUpRight />
        </a>
      </Button>
    </Empty>
  );
};

export default NoInstructionSelectedView;
