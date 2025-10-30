import {
  Trash2,
  Filter,
  FolderArchive,
  ArrowUpRight,
  MoveRight,
  Loader2,
} from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
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
import { Empty } from "./ui/empty";
import { EmptyHeader } from "./ui/empty";
import { EmptyMedia } from "./ui/empty";
import { EmptyTitle } from "./ui/empty";
import { EmptyDescription } from "./ui/empty";
import { EmptyContent } from "./ui/empty";
import TransactionHistoryCard from "./TransactionHistoryCard";
import useTransaction from "@/hooks/useTransaction";
import { useInstructions } from "@/context/InstructionsContext";
import { useIDL } from "@/context/IDLContext";
import { toast } from "sonner";
import { useSavedAccounts } from "@/context/SavedAccountsContext";

interface TransactionHistoryProps {
  transactions: TransactionRecord[];
  onClear: () => void;
  onRemove: (signature: string) => void;
  addTransaction: (transaction: TransactionRecord) => void;
}

export function TransactionHistory({
  transactions,
  onClear,
  onRemove,
  addTransaction,
}: TransactionHistoryProps) {
  const [filter, setFilter] = useState<"all" | "success" | "error">("all");
  const { execute, isExecuting } = useTransaction(addTransaction);
  const { activeInstruction, getInstructionState } = useInstructions();
  const { addSavedAccount } = useSavedAccounts();
  const { idl } = useIDL();
  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "all") return true;
    return tx.status === filter;
  });

  const handleRunTransaction = async () => {
    const instruction = idl?.instructions.find(
      (instruction) => instruction.name === activeInstruction
    );
    const instructionState = getInstructionState(activeInstruction ?? "");

    if (!instruction) {
      toast.error("Instruction not found");
      return;
    }

    const result = await execute(
      instruction,
      instructionState.accountsAddresses,
      instructionState.formData,
      instructionState.signersKeypairs
    );

    if (result) {
      // save the saved accounts
      instructionState.accountsAddresses.forEach((address, name) => {
        if (!address) return;
        addSavedAccount({
          accountName: name,
          address,
          instructionName: instruction.name,
          programId: idl?.address ?? "",
          timestamp: Date.now(),
        });
      });
    }
  };

  return (
    <Card
      className="h-full flex flex-col bg-card border border-border/50 rounded-md"
      id="transaction-history"
    >
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
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border/50 rounded-md">
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
              <AlertDialogContent className="bg-card border border-border/50 rounded-md">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground">
                    Clear transaction history?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all {transactions.length} transaction
                    records. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="text-foreground">
                    Cancel
                  </AlertDialogCancel>
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
              {transactions.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <FolderArchive />
                    </EmptyMedia>
                    <EmptyTitle>No Transactions Yet</EmptyTitle>
                    <EmptyDescription>
                      You haven&apos;t run any transactions yet. Get started by
                      running your first transaction.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button variant="default" onClick={handleRunTransaction}>
                      {isExecuting ? (
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                      ) : (
                        <MoveRight className="h-3 w-3 mr-2" />
                      )}{" "}
                      Run Transaction
                    </Button>
                  </EmptyContent>
                  <Button
                    variant="link"
                    asChild
                    className="text-muted-foreground"
                    size="sm"
                  >
                    <a href="https://docs.testship.xyz" target="_blank">
                      Learn More <ArrowUpRight />
                    </a>
                  </Button>
                </Empty>
              ) : (
                `No ${filter} transactions`
              )}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-full px-6">
            <div className="space-y-3 py-4">
              {filteredTransactions.map((tx) => (
                <TransactionHistoryCard
                  key={tx.signature}
                  transaction={tx}
                  onRemove={onRemove}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
