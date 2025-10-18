import { Check, X, ExternalLink, Trash2, Filter } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import type { TransactionRecord } from "@/hooks/useTransactionHistory";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

interface TransactionHistoryProps {
  transactions: TransactionRecord[];
  onClear: () => void;
  onRemove: (signature: string) => void;
  cluster?: string;
}

export function TransactionHistory({
  transactions,
  onClear,
  onRemove,
  cluster = "custom",
}: TransactionHistoryProps) {
  const [filter, setFilter] = useState<"all" | "success" | "error">("all");

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "all") return true;
    return tx.status === filter;
  });

  const getExplorerUrl = (signature: string) => {
    const baseUrl = "https://explorer.solana.com/tx";
    if (cluster === "custom") {
      return `${baseUrl}/${signature}?cluster=custom&customUrl=http://localhost:8899`;
    }
    return `${baseUrl}/${signature}?cluster=${cluster}`;
  };

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
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Transaction Results</CardTitle>
            <CardDescription>
              {transactions.length} transaction
              {transactions.length !== 1 ? "s" : ""}
            </CardDescription>
          </div>

          <div className="flex gap-2">
            <Select
              value={filter}
              onValueChange={(v: "all" | "success" | "error") => setFilter(v)}
            >
              <SelectTrigger className="w-[120px] h-8">
                <Filter className="h-3 w-3 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Failed</SelectItem>
              </SelectContent>
            </Select>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  disabled={transactions.length === 0}
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Clear
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Clear transaction history?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all {transactions.length} transaction
                    records. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onClear}>
                    Clear All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
            <p className="text-sm">
              {transactions.length === 0
                ? "No transactions yet"
                : `No ${filter} transactions`}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-full px-6">
            <div className="space-y-3 py-4">
              {filteredTransactions.map((tx) => (
                <div
                  key={tx.signature}
                  className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {tx.status === "success" ? (
                          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <Check className="h-4 w-4" />
                            <span className="text-xs font-semibold">
                              Success
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                            <X className="h-4 w-4" />
                            <span className="text-xs font-semibold">
                              Failed
                            </span>
                          </div>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {tx.instructionName}
                        </Badge>

                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimestamp(tx.timestamp)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded truncate">
                          {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() =>
                            window.open(getExplorerUrl(tx.signature), "_blank")
                          }
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>

                      {tx.error && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1 line-clamp-2">
                          {tx.error}
                        </p>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0"
                      onClick={() => onRemove(tx.signature)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
