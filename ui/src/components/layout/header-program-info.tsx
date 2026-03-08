import { useActiveProgram } from "@/store/use-workspace";
import { useCluster } from "@/store/use-cluster";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowSquareOutIcon, CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { useState } from "react";

export const HeaderProgramInfo = () => {
  const program = useActiveProgram();
  const { getExplorerUrl } = useCluster();
  const [copied, setCopied] = useState(false);

  if (!program) return null;

  const programId = program.programNode.publicKey ?? "";
  const truncated = programId ? `${programId.slice(0, 4)}...${programId.slice(-4)}` : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(programId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Badge variant="secondary" className="flex items-center gap-3">
      <span className="text-xs text-foreground">
        {program.programNode.name}
      </span>

      {programId && (
        <>
          <div className="h-4 w-px bg-foreground/20" />
          <div className="flex items-center gap-0.5">
            <span className="text-xs font-mono">{truncated}</span>
            <Button
              variant="ghost"
              size="icon-xs"
              className="hover:bg-transparent"
              onClick={() => window.open(getExplorerUrl(programId, "address"), "_blank")}
            >
              <ArrowSquareOutIcon className="size-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              className="hover:bg-transparent"
              onClick={handleCopy}
            >
              {copied ? <CheckIcon className="size-3 text-green-500" /> : <CopyIcon className="size-3" />}
            </Button>
          </div>
        </>
      )}
    </Badge>
  );
};
