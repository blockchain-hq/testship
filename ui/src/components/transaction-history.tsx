import { useState } from "react";
import { useTxHistory, type TxRecord } from "@/store/use-tx-history";
import { useCluster } from "@/store/use-cluster";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/alert-dialog";
import {
  CheckIcon,
  XIcon,
  CopyIcon,
  ArrowSquareOutIcon,
  FunnelIcon,
  TrashIcon,
  FolderOpenIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";

export const TransactionHistory = () => {
  const { transactions, clearHistory, removeTransaction } = useTxHistory();
  const [filter, setFilter] = useState<"all" | "success" | "error">("all");

  const filtered = transactions.filter((tx) => {
    if (filter === "all") return true;
    return tx.status === filter;
  });

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="px-4 py-2 h-10 border-b flex items-center justify-between shrink-0">
        <h2 className="text-sm font-semibold">
          Transaction Results{" "}
          <span className="text-xs text-muted-foreground">
            ({transactions.length} transaction{transactions.length !== 1 ? "s" : ""})
          </span>
        </h2>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={(v: "all" | "success" | "error") => setFilter(v)}>
            <SelectTrigger className="w-[100px] h-7 text-xs">
              <FunnelIcon className="size-3 mr-1" />
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
              <Button variant="outline" size="sm" className="h-7 text-xs" disabled={transactions.length === 0}>
                <TrashIcon className="size-3" /> Clear
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear transaction history?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all {transactions.length} transaction records.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearHistory}>Clear All</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 gap-3">
            <FolderOpenIcon className="size-10 opacity-40" />
            <p className="text-sm font-medium">
              {transactions.length === 0 ? "No Transactions Yet" : `No ${filter} transactions`}
            </p>
            <p className="text-xs text-center max-w-48">
              Run an instruction to see transaction results here.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="space-y-2 p-3">
              {filtered.map((tx) => (
                <TxCard key={tx.signature + tx.timestamp} tx={tx} onRemove={removeTransaction} />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

const TxCard = ({ tx, onRemove }: { tx: TxRecord; onRemove: (sig: string) => void }) => {
  const { getExplorerUrl } = useCluster();

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(diff / 86400000);
    if (days < 7) return `${days}d ago`;
    return new Date(ts).toLocaleDateString();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(tx.signature);
    toast.success("Signature copied");
  };

  return (
    <div className="border rounded-sm p-3 hover:bg-muted/50 transition-colors space-y-2">
      <div className="flex items-center gap-2">
        {tx.status === "success" ? (
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <CheckIcon className="size-3.5" weight="bold" />
            <span className="text-xs font-semibold">Success</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
            <XIcon className="size-3.5" weight="bold" />
            <span className="text-xs font-semibold">Failed</span>
          </div>
        )}
        <Badge variant="outline" className="text-[10px]">
          {tx.instructionName}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[11px] text-muted-foreground">{formatTime(tx.timestamp)}</span>
        {tx.signature && (
          <>
            <code className="text-[11px] font-mono bg-muted px-1.5 py-0.5 rounded truncate">
              {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
            </code>
            <Button variant="ghost" size="icon-xs" onClick={() => window.open(getExplorerUrl(tx.signature, "tx"), "_blank")}>
              <ArrowSquareOutIcon className="size-3" />
            </Button>
            <Button variant="ghost" size="icon-xs" onClick={handleCopy}>
              <CopyIcon className="size-3" />
            </Button>
          </>
        )}
        <Button variant="ghost" size="icon-xs" className="ml-auto text-muted-foreground" onClick={() => onRemove(tx.signature)}>
          <XIcon className="size-3" />
        </Button>
      </div>

      {tx.error && (
        <p className="text-xs text-red-600 dark:text-red-400 line-clamp-2">{tx.error}</p>
      )}

      {tx.logs && tx.logs.length > 0 && (
        <div className="text-[10px] text-muted-foreground space-y-0.5 max-h-32 overflow-y-auto font-mono">
          {tx.logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>
      )}
    </div>
  );
};
