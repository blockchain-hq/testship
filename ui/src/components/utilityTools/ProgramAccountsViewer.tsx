import { useState, useEffect } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { BorshAccountsCoder } from "@coral-xyz/anchor";
import { useIDL } from "@/context/IDLContext";
import { useCluster, getClusterUrlParam } from "@/context/ClusterContext";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui";
import { Loader2, RefreshCw, ExternalLink, Database } from "lucide-react";

interface ProgramAccount {
  pubkey: string;
  account: {
    lamports: number;
    data: Uint8Array | string;
    owner: string;
    executable: boolean;
    rentEpoch?: number;
  };
  decoded?: any;
  accountType?: string;
}

export const ProgramAccountsViewer = () => {
  const { idl } = useIDL();
  const { connection } = useConnection();
  const { cluster } = useCluster();

  const getAccountExplorerUrl = (address: string) => {
    const baseUrl = `https://explorer.solana.com/address/${address}`;
    return `${baseUrl}${getClusterUrlParam(cluster)}`;
  };
  const [accounts, setAccounts] = useState<ProgramAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProgramAccounts = async () => {
    if (!idl || !idl.address) {
      setError("No program loaded");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const programId = new PublicKey(idl.address);
      
      // Fetch all accounts owned by the program
      const accountsData = await connection.getProgramAccounts(programId, {
        encoding: "base64",
        commitment: "confirmed",
      });

      const decodedAccounts: ProgramAccount[] = [];

      // Try to decode accounts if account types are defined in IDL
      const accountsCoder = idl.accounts
        ? new BorshAccountsCoder(idl)
        : null;

      for (const { pubkey, account } of accountsData) {
        const accountData: ProgramAccount = {
          pubkey: pubkey.toBase58(),
          account: {
            lamports: account.lamports,
            data: account.data as Uint8Array,
            owner: account.owner.toBase58(),
            executable: account.executable,
            rentEpoch: account.rentEpoch,
          },
        };

        // Try to decode account data
        if (accountsCoder && idl.accounts && account.data) {
          try {
            // Try each account type to find a match
            for (const accountType of idl.accounts) {
              try {
                const decoded = accountsCoder.decode(
                  accountType.name,
                  account.data as Buffer<ArrayBufferLike>
                );
                accountData.decoded = decoded;
                accountData.accountType = accountType.name;
                break;
              } catch {
                // Try next account type
                continue;
              }
            }
          } catch (decodeError) {
            // If decoding fails, we'll just show raw data
            console.warn("Failed to decode account:", decodeError);
          }
        }

        decodedAccounts.push(accountData);
      }

      setAccounts(decodedAccounts);
    } catch (err) {
      console.error("Error fetching program accounts:", err);
      
      let errorMessage = "Failed to fetch program accounts";
      
      // Check for specific error types
      if (err instanceof Error) {
        const errorStr = err.message.toLowerCase();
        if (errorStr.includes("403") || errorStr.includes("forbidden")) {
          errorMessage = "RPC endpoint blocked request (403 Forbidden). The default Solana RPC endpoint has CORS restrictions. Please add a custom RPC endpoint (e.g., Helius, QuickNode, or Alchemy) in the cluster settings.";
        } else if (errorStr.includes("429") || errorStr.includes("rate limit")) {
          errorMessage = "Rate limit exceeded. Please try again later or use a custom RPC endpoint.";
        } else if (errorStr.includes("network") || errorStr.includes("fetch")) {
          errorMessage = "Network error. Please check your connection and RPC endpoint.";
        } else {
          errorMessage = err.message;
        }
      } else if (typeof err === "object" && err !== null) {
        // Handle JSON-RPC error format
        const rpcError = err as { error?: { code?: number; message?: string } };
        if (rpcError.error?.code === 403) {
          errorMessage = "RPC endpoint blocked request (403 Forbidden). The default Solana RPC endpoint has CORS restrictions. Please add a custom RPC endpoint (e.g., Helius, QuickNode, or Alchemy) in the cluster settings.";
        } else if (rpcError.error?.message) {
          errorMessage = rpcError.error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-fetch when IDL is loaded or cluster changes
    if (idl && idl.address) {
      fetchProgramAccounts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idl?.address, cluster.endpoint]);

  const formatBytes = (bytes: Uint8Array): string => {
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(" ");
  };

  const formatLamports = (lamports: number): string => {
    return (lamports / 1e9).toFixed(9) + " SOL";
  };

  const formatDecodedData = (data: any, indent = 0): string => {
    if (data === null || data === undefined) return "null";
    if (typeof data === "string") return `"${data}"`;
    if (typeof data === "number" || typeof data === "boolean") {
      return String(data);
    }
    if (data instanceof PublicKey) {
      return data.toBase58();
    }
    if (Array.isArray(data)) {
      return `[\n${data
        .map((item) => "  ".repeat(indent + 1) + formatDecodedData(item, indent + 1))
        .join(",\n")}\n${"  ".repeat(indent)}]`;
    }
    if (typeof data === "object") {
      const entries = Object.entries(data);
      if (entries.length === 0) return "{}";
      return `{\n${entries
        .map(
          ([key, value]) =>
            "  ".repeat(indent + 1) + `${key}: ${formatDecodedData(value, indent + 1)}`
        )
        .join(",\n")}\n${"  ".repeat(indent)}}`;
    }
    return String(data);
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
          onClick={fetchProgramAccounts}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          {loading ? (
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
                  <li>Popular options: Helius, QuickNode, Alchemy, or your own RPC</li>
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {loading && accounts.length === 0 ? (
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
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {accounts.map((account) => (
            <Card key={account.pubkey} className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-mono break-all mb-2">
                      {account.pubkey}
                    </CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      {account.accountType && (
                        <Badge variant="secondary" className="text-xs">
                          {account.accountType}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {formatLamports(account.account.lamports)}
                      </Badge>
                      {account.account.executable && (
                        <Badge variant="destructive" className="text-xs">
                          Executable
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-accent-primary hover:text-accent-primary/80"
                    onClick={() => window.open(getAccountExplorerUrl(account.pubkey), "_blank")}
                  >
                    View on Explorer
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Owner:</span>
                    <span className="font-mono">{account.account.owner}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Data Size:</span>
                    <span>
                      {Array.isArray(account.account.data)
                        ? account.account.data.length
                        : 0}{" "}
                      bytes
                    </span>
                  </div>
                  {account.account.rentEpoch !== undefined && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Rent Epoch:</span>
                      <span>{account.account.rentEpoch}</span>
                    </div>
                  )}
                </div>

                {account.decoded ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Decoded Data:
                    </p>
                    <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto font-mono">
                      {formatDecodedData(account.decoded)}
                    </pre>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Raw Data (hex):
                    </p>
                    <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto font-mono">
                      {Array.isArray(account.account.data)
                        ? formatBytes(account.account.data as Uint8Array<ArrayBufferLike>)
                        : "Unable to display data"}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
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

