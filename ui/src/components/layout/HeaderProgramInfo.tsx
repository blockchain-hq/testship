import { useIDL } from "@/context/IDLContext";
import { useCluster } from "@/context/ClusterContext";
import { ExternalLink, Check, Copy } from "lucide-react";
import useCopy from "@/hooks/useCopy";
import { Badge, Button } from "../ui";

const formatProgramId = (id: string) => {
  if (!id) return "";
  return `${id.slice(0, 4)}...${id.slice(-4)}`;
};

const HeaderProgramInfo = () => {
  const { idl } = useIDL();
  const { getExplorerUrl } = useCluster();
  const { copied, handleCopy } = useCopy();

  if (!idl) return null;

  const programId = idl.address;

  return (
    <Badge variant="secondary" className="flex items-center gap-3 flex-row">
      <span className="text-xs text-foreground dark:text-foreground-dark">
        {idl.metadata.name}{" "}
        <span className="text-xs text-muted-foreground dark:text-muted-foreground-dark">
          (v{idl.metadata.version})
        </span>
      </span>

      <div className="h-4 w-[1px] bg-foreground/20 mx-1"></div>

      <div className="flex items-center space-x-1 text-foreground dark:text-foreground-dark">
        <div className="flex items-center space-x-1">
          <p className="text-xs flex items-center font-medium space-x-1 font-mono">
            {formatProgramId(programId)}
          </p>
        </div>

        <div className="flex items-center gap-0">
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-6 text-xs hover:bg-transparent hover:text-brand"
            onClick={() =>
              window.open(getExplorerUrl(programId, "address"), "_blank")
            }
          >
            <ExternalLink className="h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            className="h-6 text-xs hover:bg-transparent hover:text-brand"
            onClick={() => handleCopy(programId)}
          >
            {copied ? (
              <Check className="h-3.5 text-brand" />
            ) : (
              <Copy className="h-3.5" />
            )}
          </Button>
        </div>
      </div>
    </Badge>
  );
};

export default HeaderProgramInfo;
