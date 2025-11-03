import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import { Badge } from "../ui";
import {
  FileIcon,
  InfoIcon,
  CaseUpperIcon,
  FileTextIcon,
  CheckIcon,
  CoinsIcon,
  XIcon,
} from "lucide-react";
import useProgramInfo from "@/hooks/useProgramInfo";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

const HeaderProgramInfo = () => {
  const { programInfo, isLoading, error } = useProgramInfo();

  if (!programInfo || isLoading) return null;

  if (error) {
    return (
      <div className="flex items-center space-x-2">
        <p className="text-sm text-muted-foreground">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 flex-row justify-center">
      <h3 className="font-medium text-md text-foreground dark:text-foreground-dark">
        {isLoading ? "Loading..." : programInfo.name}
      </h3>
      <div className="flex items-center space-x-2">
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <button
              className="inline-flex items-center justify-center rounded-md hover:bg-accent/50 transition-colors p-1"
              disabled={isLoading}
            >
              <InfoIcon className="w-4 h-4 text-muted-foreground" />
            </button>
          </TooltipTrigger>
          <TooltipContent
            className="p-0 w-[320px] border border-border/50 shadow-lg"
            sideOffset={8}
          >
            <div className="flex flex-col">
              <div className="px-4 py-3 border-b border-border/50">
                <p className="text-xs font-medium flex items-center gap-2 uppercase tracking-wide">
                  <FileIcon className="w-4 h-4" />
                  Program Details
                </p>
              </div>

              <div className="px-4 py-3 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-base font-semibold flex items-center gap-2">
                    <CaseUpperIcon className="w-4 h-4" />
                    <span className="text-sm">{programInfo.name}</span>
                  </h4>
                  <Badge
                    variant="secondary"
                    className="text-xs font-medium px-2 py-0.5 shrink-0"
                  >
                    v{programInfo.version}
                  </Badge>
                </div>

                {programInfo.description && (
                  <p className="text-sm leading-relaxed flex items-center gap-2">
                    <FileTextIcon className="w-4 h-4" />
                    <span className="text-sm">{programInfo.description}</span>
                  </p>
                )}

                {programInfo && !isLoading && (
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-base font-semibold flex items-center gap-2">
                      <CheckIcon className="w-4 h-4" />
                      <span className="text-sm">Deployed</span>
                    </h4>
                    <p className="text-sm flex items-center gap-2">
                      {programInfo.deployed ? (
                        <CheckIcon className="w-4 h-4" />
                      ) : (
                        <XIcon className="w-4 h-4" />
                      )}
                      {programInfo.deployed ? "Yes" : "No"}
                    </p>
                  </div>
                )}

                {programInfo.lamports > 0 && (
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-base font-semibold flex items-center gap-2">
                      <CoinsIcon className="w-4 h-4" />
                      <span className="text-sm">SOL Balance</span>
                    </h4>
                    <p className="text-sm flex items-center gap-2">
                      <CoinsIcon className="w-4 h-4" />
                      {programInfo.lamports / LAMPORTS_PER_SOL} {""}
                      SOL
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default HeaderProgramInfo;
