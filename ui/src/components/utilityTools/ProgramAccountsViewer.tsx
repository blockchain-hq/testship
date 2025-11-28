import { useMemo } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useIDL } from "@/context/IDLContext";
import { useCluster, getClusterUrlParam } from "@/context/ClusterContext";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Loader2, RefreshCw, Database } from "lucide-react";
import { useProgramAccounts } from "@/hooks/useProgramAccounts";
import { useTransactionHistory } from "@/hooks/useTransactionHistory";
import { AccountTreeNode } from "./AccountTreeView";

export const ProgramAccountsViewer = () => {
  const { idl } = useIDL();
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const { transactions } = useTransactionHistory();

  const { accounts, isLoading, error, refetch } = useProgramAccounts(
    connection,
    idl,
    cluster
  );

  // Build map of recently changed accounts from transaction history
  const recentChanges = useMemo(() => {
    const changesMap = new Map<
      string,
      { timestamp: number; txSignature: string; instructionName: string }
    >();

    // Process transactions (newest first) to find account changes
    for (const tx of transactions) {
      if (tx.status === "success" && tx.accountSnapshots) {
        for (const accountName of Object.keys(tx.accountSnapshots)) {
          // Get the actual address from the accounts field
          const address = tx.accounts?.[accountName];
          if (address) {
            // Only add if not already present (keeping the most recent)
            if (!changesMap.has(address)) {
              changesMap.set(address, {
                timestamp: tx.timestamp,
                txSignature: tx.signature,
                instructionName: tx.instructionName,
              });
            }
          }
        }
      }
    }

    return changesMap;
  }, [transactions]);

  const getAccountExplorerUrl = (address: string) => {
    const baseUrl = `https://explorer.solana.com/address/${address}`;
    return `${baseUrl}${getClusterUrlParam(cluster)}`;
  };

  if (!idl || !idl.address) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No program loaded. Load a program IDL to view accounts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Program Accounts</h3>
          <p className="text-sm text-muted-foreground">
            View all accounts owned by the program on {cluster.name}
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6 space-y-2">
            <p className="text-sm text-destructive font-medium">{error}</p>
            {error.includes("CORS") || error.includes("403") ? (
              <div className="mt-3 text-xs text-muted-foreground space-y-1">
                <p className="font-medium">To fix this:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Use the cluster dropdown in the header</li>
                  <li>Add a custom RPC endpoint that supports CORS</li>
                  <li>
                    Popular options: Helius, QuickNode, Alchemy, or your own RPC
                  </li>
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {isLoading && accounts.length === 0 ? (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Fetching program accounts...
          </p>
        </div>
      ) : accounts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No accounts found for this program.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <Card>
            <CardContent className="p-0">
              {accounts.map((account) => (
                <AccountTreeNode
                  key={account.pubkey}
                  account={account}
                  depth={0}
                  getAccountExplorerUrl={getAccountExplorerUrl}
                  recentChanges={recentChanges}
                />
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {accounts.length > 0 && (
        <div className="text-center text-xs text-muted-foreground pt-2">
          Found {accounts.length} account{accounts.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
};
