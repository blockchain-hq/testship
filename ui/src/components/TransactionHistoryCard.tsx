import type { TransactionRecord } from "@/hooks/useTransactionHistory";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Check, Copy, ExternalLink, X } from "lucide-react";
import UseCopy from "@/hooks/useCopy";
import { useCluster } from "@/context/ClusterContext";

interface TransactionHistoryCardProps {
  transaction: TransactionRecord;
  cluster?: string;
  onRemove: (signature: string) => void;
}

const TransactionHistoryCard = (props: TransactionHistoryCardProps) => {
  const { transaction, onRemove } = props;

  const { copied, handleCopy } = UseCopy();
  const { getExplorerUrl } = useCluster();
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      key={transaction.signature}
      className="bg-card border border-border/50 rounded-md p-3 hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-start justify-between  gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {transaction.status === "success" ? (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <Check className="h-4 w-4" />
                <span className="text-xs font-semibold">Success</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <X className="h-4 w-4" />
                <span className="text-xs font-semibold">Failed</span>
              </div>
            )}
            <Badge
              variant="outline"
              className="text-xs bg-muted text-muted-foreground border-border"
            >
              {transaction.instructionName}
            </Badge>
          </div>

          <div className="flex flex-row items-start gap-2">
            <p className="text-xs text-muted-foreground mt-1">
              {formatTimestamp(transaction.timestamp)}
            </p>

            <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded truncate">
              {transaction.signature.slice(0, 8)}...
              {transaction.signature.slice(-8)}
            </code>

            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() =>
                window.open(
                  getExplorerUrl(transaction.signature, "tx"),
                  "_blank"
                )
              }
            >
              <ExternalLink className="h-3 w-3" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => handleCopy(transaction.signature)}
              disabled={copied}
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>

          {transaction.error && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1 line-clamp-2">
              {transaction.error}
            </p>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 flex-shrink-0"
          onClick={() => onRemove(transaction.signature)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default TransactionHistoryCard;
