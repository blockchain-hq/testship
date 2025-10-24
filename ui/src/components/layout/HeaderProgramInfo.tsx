import { useIDL } from "@/context/IDLContext";
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import { Badge } from "../ui";
import { InfoIcon } from "lucide-react";

const HeaderProgramInfo = () => {
  const { idl } = useIDL();

  if (!idl) return null;

  return (
    <div className="flex items-center space-x-2 flex-row justify-center">
      <h2 className="font-medium text-xl text-foreground dark:text-foreground-dark">
        {idl.metadata.name}
      </h2>
      <div className="flex items-center space-x-2">
        <Tooltip delayDuration={100}>
          <TooltipTrigger>
            <InfoIcon className="w-4 h-4" />
          </TooltipTrigger>
          <TooltipContent className="">
            <div className="flex flex-col items-center gap-2">
              <div className="w-full text-muted">
                <p>Program Details</p>
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-semibold flex items-center space-x-2 gap-2">
                  {idl.metadata.name}
                  <Badge variant="outline" className="text-primary-foreground">
                    v {idl.metadata.version}
                  </Badge>
                </p>
                <p className="text-sm text-muted/50">
                  {idl.metadata.description}
                </p>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default HeaderProgramInfo;
