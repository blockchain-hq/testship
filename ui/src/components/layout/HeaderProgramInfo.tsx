import { useIDL } from "@/context/IDLContext";
import { useCluster, getClusterUrlParam } from "@/context/ClusterContext";
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import { Badge } from "../ui";
import { InfoIcon, ExternalLink, Code } from "lucide-react";

const HeaderProgramInfo = () => {
  const { idl } = useIDL();
  const { cluster } = useCluster();

  if (!idl) return null;

  const programId = idl.address;
  const instructions = idl.instructions || [];

  // Get explorer URL for program
  const getProgramExplorerUrl = () => {
    const baseUrl = `https://explorer.solana.com/address/${programId}`;
    return `${baseUrl}${getClusterUrlParam(cluster)}`;
  };

  // Get Solana Scan URL based on current network selection
  const getSolanaScanUrl = () => {
    const baseUrl = `https://solscan.io/account/${programId}`;
    return `${baseUrl}${getClusterUrlParam(cluster)}`;
  };

  const formatProgramId = (id: string) => {
    if (!id) return "";
    return `${id.slice(0, 4)}...${id.slice(-4)}`;
  };

  return (
    <div className="flex items-center space-x-3 flex-row">
      <div className="flex items-center space-x-2">
        <h3 className="font-medium text-md text-foreground dark:text-foreground-dark">
          {idl.metadata.name}
        </h3>
        <Badge
          variant="secondary"
          className="text-xs font-medium px-2 py-0.5"
        >
          v{idl.metadata.version}
        </Badge>
      </div>

      {/* Program ID with Explorer Links */}
      <div className="flex items-center space-x-1 px-2 py-1 bg-muted/50 rounded-md border border-border/50">
        <Code className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-mono text-muted-foreground">
          {formatProgramId(programId)}
        </span>
        <div className="flex items-center space-x-1 ml-1"> 
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <button
                onClick={() => window.open(getSolanaScanUrl(), "_blank")}
                className="inline-flex items-center justify-center rounded-md hover:bg-accent/50 transition-colors p-1"
              >
                <ExternalLink className="w-3 h-3 text-muted-foreground hover:text-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View on Solana Scan</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Program Info Tooltip */}
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <button className="inline-flex items-center justify-center rounded-md hover:bg-accent/50 transition-colors p-1">
            <InfoIcon className="w-4 h-4 text-muted-foreground" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          className="p-0 w-[320px] border border-border/50 shadow-lg"
          sideOffset={8}
        >
          <div className="flex flex-col">
            <div className="px-4 py-3 border-b border-border/50">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Program Details
              </p>
            </div>

            <div className="px-4 py-3 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-base font-semibold ">{idl.metadata.name}</h4>
                <Badge
                  variant="secondary"
                  className="text-xs font-medium px-2 py-0.5 shrink-0"
                >
                  v{idl.metadata.version}
                </Badge>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Program ID:</p>
                <p className="text-sm font-mono break-all">{programId}</p>
              </div>

              {idl.metadata.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {idl.metadata.description}
                </p>
              )}

              {instructions.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Functions ({instructions.length}):
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {instructions.map((instruction) => (
                      <Badge
                        key={instruction.name}
                        variant="outline"
                        className="text-xs"
                      >
                        {instruction.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default HeaderProgramInfo;
