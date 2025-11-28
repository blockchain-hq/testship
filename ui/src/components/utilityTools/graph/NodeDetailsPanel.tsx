import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../../ui/sheet";
import { ExternalLink, Copy, Check, X } from "lucide-react";
import type { DecodedAccount } from "@/hooks/useProgramAccounts";
import { AccountDecodedData } from "../AccountDecodedData";
import { formatLamports, countPublicKeyRefs } from "@/lib/utils/account-state";
import useCopy from "@/hooks/useCopy";
import { useCluster, getClusterUrlParam } from "@/context/ClusterContext";

interface NodeDetailsPanelProps {
  account: DecodedAccount | null;
  isOpen: boolean;
  onClose: () => void;
  recentChange?: {
    timestamp: number;
    txSignature: string;
    instructionName: string;
  };
}

export const NodeDetailsPanel = ({
  account,
  isOpen,
  onClose,
  recentChange,
}: NodeDetailsPanelProps) => {
  const { copied, handleCopy } = useCopy();
  const { cluster } = useCluster();

  if (!account) return null;

  const refCount = account.decoded ? countPublicKeyRefs(account.decoded) : 0;
  const accountOwner = String(account.account.owner);
  const accountTypeName = account.accountType || "Unknown";

  const getExplorerUrl = (address: string) => {
    const baseUrl = `https://explorer.solana.com/address/${address}`;
    return `${baseUrl}${getClusterUrlParam(cluster)}`;
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:w-[450px] md:w-[500px] overflow-y-auto"
      >
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-base">Account Details</SheetTitle>
              <SheetDescription className="text-xs font-mono break-all mt-1">
                {account.pubkey}
              </SheetDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 flex-shrink-0"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => handleCopy(account.pubkey)}
            >
              {copied ? (
                <Check className="w-3 h-3 mr-1" />
              ) : (
                <Copy className="w-3 h-3 mr-1" />
              )}
              Copy Address
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() =>
                window.open(getExplorerUrl(account.pubkey), "_blank")
              }
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Explorer
            </Button>
          </div>

          <div className="space-y-3 rounded-lg border border-border/50 p-3 bg-muted/20">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Type</span>
              <Badge variant="secondary" className="text-xs">
                {accountTypeName}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Balance</span>
              <Badge variant="outline" className="text-xs font-mono">
                {formatLamports(account.account.lamports)}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">References</span>
              <Badge variant="outline" className="text-xs">
                {refCount}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Owner</span>
              <span className="text-xs font-mono">
                {accountOwner.slice(0, 8)}...
                {accountOwner.slice(-8)}
              </span>
            </div>

            {recentChange ? (
              <div className="pt-2 border-t border-border/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-medium">Recently Modified</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5 ml-3.5">
                  <p>by {recentChange.instructionName}</p>
                  <p>{formatTimeAgo(recentChange.timestamp)}</p>
                  <p className="font-mono text-[10px]">
                    {recentChange.txSignature.slice(0, 16)}...
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Decoded Data */}
          {Boolean(account.decoded) && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Decoded Data</h3>
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <AccountDecodedData
                  decoded={account.decoded as Record<string, unknown>}
                />
              </div>
            </div>
          )}

          {/* Raw Account Info */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Raw Account Info</h3>
            <div className="rounded-lg border border-border/50 p-3 bg-muted/20">
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Lamports</span>
                  <span className="font-mono">
                    {account.account.lamports.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Executable</span>
                  <span className="font-mono">
                    {account.account.executable ? "true" : "false"}
                  </span>
                </div>
                {account.account.rentEpoch !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Rent Epoch</span>
                    <span className="font-mono">
                      {String(account.account.rentEpoch)}
                    </span>
                  </div>
                )}
                <div className="flex items-start justify-between gap-2">
                  <span className="text-muted-foreground flex-shrink-0">
                    Data Size
                  </span>
                  <span className="font-mono text-right">
                    {typeof account.account.data === "string"
                      ? account.account.data.length
                      : account.account.data.length}{" "}
                    bytes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
