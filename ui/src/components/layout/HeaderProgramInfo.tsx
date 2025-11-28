import { useIDL } from "@/context/IDLContext";
import { useCluster } from "@/context/ClusterContext";
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import { Badge } from "../ui";
import { ExternalLink, Code, Check, Copy } from "lucide-react";
import useCopy from "@/hooks/useCopy";

const formatProgramId = (id: string) => {
  if (!id) return "";
  return `${id.slice(0, 4)}...${id.slice(-4)}`;
};

const ProgramIdWithExplorerLink = (props: { programId: string }) => {
  const { programId } = props;
  const { getExplorerUrl } = useCluster();
  const { copied, handleCopy: handleCopyProgramId } = useCopy();

  return (
    <div className="flex items-center space-x-1 px-2 py-1 bg-secondary rounded-md border border-border/50 h-8">
      <Code className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="text-xs font-mono text-muted-foreground">
        {formatProgramId(programId)}
      </span>
      <div className="flex items-center space-x-1 ml-1">
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <button
              onClick={() =>
                window.open(getExplorerUrl(programId, "address"), "_blank")
              }
              className="inline-flex items-center justify-center rounded-md hover:bg-accent/50 transition-colors p-1"
            >
              <ExternalLink className="w-3 h-3 text-muted-foreground hover:text-foreground" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>View on Explorer</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <button
              onClick={() => handleCopyProgramId(programId)}
              className="inline-flex items-center justify-center rounded-md hover:bg-accent/50 transition-colors p-1 cursor-pointer"
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copy Program ID</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

const HeaderProgramInfo = () => {
  const { idl } = useIDL();

  if (!idl) return null;

  const programId = idl.address;

  return (
    <div className="flex items-center space-x-3 flex-row">
      <div className="flex items-center space-x-2">
        <h3 className="font-medium text-md text-foreground dark:text-foreground-dark">
          {idl.metadata.name}
        </h3>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <Badge
              variant="secondary"
              className="text-xs font-medium px-2 py-0.5 h-8"
            >
              v{idl.metadata.version}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Program Version</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <ProgramIdWithExplorerLink programId={programId} />
    </div>
  );
};

export default HeaderProgramInfo;
