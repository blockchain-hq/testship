import { useIDL } from "@/context/IDLContext";
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import { Badge } from "../ui";
import { InfoIcon } from "lucide-react";

const HeaderProgramInfo = () => {
  const { idl } = useIDL();

  if (!idl) return null;

  return (
    <div className="flex items-center space-x-2 flex-row justify-center">
      <h3 className="font-medium text-md text-foreground dark:text-foreground-dark">
        {idl.metadata.name}
      </h3>
      <div className="flex items-center space-x-2">
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
                  <h4 className="text-base font-semibold ">
                    {idl.metadata.name}
                  </h4>
                  <Badge
                    variant="secondary"
                    className="text-xs font-medium px-2 py-0.5 shrink-0"
                  >
                    v{idl.metadata.version}
                  </Badge>
                </div>

                {idl.metadata.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {idl.metadata.description}
                  </p>
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
