import {
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Maximize2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { formatLogs } from "@/lib/errorParser";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import UseCopy from "@/hooks/useCopy";
import { useCluster } from "@/context/ClusterContext";

interface TransactionToastProps {
  signature?: string;
  status: "success" | "error";
  message?: string;
  suggestion?: string;
  logs?: string[];
  cluster?: string;
}

export function TransactionToast({
  signature,
  // status,
  message,
  suggestion,
  logs,
}: TransactionToastProps) {
  const { copied, handleCopy } = UseCopy();
  const [showLogs, setShowLogs] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { getExplorerUrl } = useCluster();

  const truncatedSig = signature
    ? `${signature.slice(0, 8)}...${signature.slice(-8)}`
    : "";

  return (
    <div className="flex flex-col gap-2 w-full max-w-md">
      {message && <p className="text-sm">{message}</p>}

      {suggestion && (
        <div className="bg-muted/20 p-2 rounded text-xs max-h-32 overflow-y-auto">
          <p className="font-semibold mb-1">💡 Suggestion:</p>
          <p className="whitespace-pre-line">{suggestion}</p>
        </div>
      )}

      {signature && (
        <>
          <div className="flex items-center gap-2">
            <code className="text-xs bg-muted/10 px-2 py-1 rounded flex-1 overflow-hidden text-ellipsis">
              {truncatedSig}
            </code>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 flex-shrink-0"
              onClick={() => handleCopy(signature)}
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>

          <Button
            variant="link"
            size="sm"
            className="p-0 h-auto justify-start text-accent-primary hover:text-accent-primary/80"
            asChild
          >
            <a href={getExplorerUrl(`tx/${signature}`)} target="_blank">
              View on Explorer
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </Button>
        </>
      )}

      {logs && logs.length > 0 && (
        <div className="border-t pt-2 mt-1">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 flex-1 justify-between"
              onClick={() => setShowLogs(!showLogs)}
            >
              <span className="text-xs font-semibold">
                Transaction Logs ({logs.length})
              </span>
              {showLogs ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>

            {logs.length > 5 && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 flex-shrink-0"
                    title="View full logs"
                  >
                    <Maximize2 className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] bg-card border border-border/50 text-foreground">
                  <DialogHeader className="border-b border-border/50">
                    <DialogTitle>Transaction Logs</DialogTitle>
                    <DialogDescription>
                      {signature && (
                        <span className="text-xs">
                          Transaction: {truncatedSig}
                        </span>
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(formatLogs(logs))}
                      >
                        <Copy className="h-3 w-3 mr-2" />
                        Copy Logs
                      </Button>
                    </div>
                    <div className="bg-card border border-border/50 rounded-lg p-4 overflow-auto max-h-[60vh]">
                      <pre className="text-xs whitespace-pre-wrap break-words">
                        {formatLogs(logs)}
                      </pre>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {showLogs && (
            <div className="mt-2 max-h-40 overflow-y-auto overflow-x-auto">
              <pre className="text-xs bg-card border border-border/50 p-2 rounded whitespace-pre-wrap break-words">
                {formatLogs(logs)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
