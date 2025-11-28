import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui";
import { ChevronRight, ChevronDown, ExternalLink, Loader2 } from "lucide-react";
import { useLazyLoadChildren } from "@/hooks/useProgramAccounts";
import { useConnection } from "@solana/wallet-adapter-react";
import { useIDL } from "@/context/IDLContext";
import { useCluster } from "@/context/ClusterContext";
import { formatLamports, countPublicKeyRefs } from "@/lib/utils/account-state";
import { AccountDecodedData } from "./AccountDecodedData";
import type { DecodedAccount } from "@/hooks/useProgramAccounts";

interface AccountTreeNodeProps {
  account: DecodedAccount;
  depth: number;
  getAccountExplorerUrl: (address: string) => string;
}

export const AccountTreeNode = (props: AccountTreeNodeProps) => {
  const { account: initialAccount, depth, getAccountExplorerUrl } = props;
  const { connection } = useConnection();
  const { idl } = useIDL();
  const { cluster } = useCluster();

  const [isExpanded, setIsExpanded] = useState(false);
  const [account, setAccount] = useState(initialAccount);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);

  const lazyLoadChildren = useLazyLoadChildren(connection, idl, cluster);

  // Update local account state when initial account changes
  useEffect(() => {
    setAccount(initialAccount);
  }, [initialAccount]);

  const hasChildren = useMemo(
    () => account.children && account.children.size > 0,
    [account.children]
  );

  const hasDecodedData = useMemo(() => !!account.decoded, [account.decoded]);

  // Count potential refs from decoded data
  const potentialRefCount = useMemo(() => {
    if (!hasDecodedData) return 0;
    return countPublicKeyRefs(account.decoded);
  }, [account.decoded, hasDecodedData]);

  const handleToggleExpand = useCallback(async () => {
    // Load children if expanding and no children loaded yet
    if (
      !isExpanded &&
      !hasChildren &&
      hasDecodedData &&
      potentialRefCount > 0
    ) {
      setIsLoadingChildren(true);
      try {
        const result = await lazyLoadChildren.mutateAsync({
          pubkey: account.pubkey,
          maxDepth: 2,
        });

        // Update only if we got valid data for this specific account
        if (result && result.pubkey === account.pubkey) {
          setAccount(result);
        }
      } catch (error) {
        console.error("Error loading children:", error);
      } finally {
        setIsLoadingChildren(false);
      }
    }
    setIsExpanded(!isExpanded);
  }, [
    isExpanded,
    hasChildren,
    hasDecodedData,
    potentialRefCount,
    lazyLoadChildren,
    account.pubkey,
  ]);

  const handleExplorerClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      window.open(getAccountExplorerUrl(account.pubkey), "_blank");
    },
    [getAccountExplorerUrl, account.pubkey]
  );

  const paddingLeft = depth * 16;
  const shouldShowExpandButton =
    hasChildren || (hasDecodedData && potentialRefCount > 0);

  return (
    <div className="border-l border-border/20">
      {/* Account Header */}
      <div
        className="py-1.5 px-2 hover:bg-muted/30 transition-colors"
        style={{ paddingLeft: `${paddingLeft + 8}px` }}
      >
        <div className="flex items-center gap-2">
          {/* Expand/Collapse button */}
          {shouldShowExpandButton ? (
            <button
              onClick={handleToggleExpand}
              className="hover:bg-muted rounded p-0.5 transition-colors flex-shrink-0"
              disabled={isLoadingChildren}
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isLoadingChildren ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          ) : (
            <div className="w-4 h-4 flex-shrink-0" />
          )}

          {/* Account type badge */}
          {account.accountType && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 h-4 flex-shrink-0"
            >
              {account.accountType}
            </Badge>
          )}

          {/* Account address */}
          <p className="text-[11px] font-mono truncate flex-1 min-w-0">
            {account.pubkey}
          </p>

          {/* Badges and actions container */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
              {formatLamports(account.account.lamports)}
            </Badge>

            {potentialRefCount > 0 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                {hasChildren ? account.children!.size : potentialRefCount} refs
              </Badge>
            )}

            {/* Explorer link */}
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0"
              onClick={handleExplorerClick}
              aria-label="View in Explorer"
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Decoded data preview - only when expanded */}
        {isExpanded && hasDecodedData && (
          <AccountDecodedData decoded={account.decoded} />
        )}
      </div>

      {/* Render children */}
      {isExpanded && hasChildren && (
        <div>
          {Array.from(account.children!.entries()).map(([pubkey, child]) => (
            <AccountTreeNode
              key={pubkey}
              account={child}
              depth={depth + 1}
              getAccountExplorerUrl={getAccountExplorerUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
};
