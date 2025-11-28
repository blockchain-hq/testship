import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Badge } from "../../ui/badge";
import { Clock } from "lucide-react";
import { formatLamports } from "@/lib/utils/account-state";
import type { GraphNode } from "@/lib/utils/graph-layout";

interface AccountNodeProps {
  data: GraphNode["data"];
  selected?: boolean;
}

export const AccountNode = memo(({ data, selected }: AccountNodeProps) => {
  const { account, accountType, lamports, refCount, isRecent } = data;

  return (
    <div
      className={`relative bg-card border-2 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg min-w-[220px] cursor-pointer ${
        selected
          ? "border-primary ring-2 ring-primary/20 shadow-xl"
          : "border-border hover:border-accent hover:shadow-xl"
      } ${isRecent ? "shadow-green-500/20" : ""}`}
    >
      {/* Colored left border for account type */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg transition-all"
        style={{
          background: accountType
            ? `hsl(${
                (accountType
                  .split("")
                  .reduce((acc, char) => acc + char.charCodeAt(0), 0) %
                  360)
              }, 70%, ${selected ? "60%" : "50%"})`
            : "hsl(var(--border))",
        }}
      />

      <div className="p-3 pl-4">
        {/* Header with type and recent indicator */}
        <div className="flex items-center justify-between mb-2">
          {accountType ? (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
              {accountType}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
              Unknown
            </Badge>
          )}

          {isRecent && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <Clock className="w-3 h-3 text-green-600 dark:text-green-400" />
            </div>
          )}
        </div>

        {/* Address */}
        <div className="mb-2">
          <p className="text-[10px] font-mono truncate text-foreground/90">
            {account.pubkey.slice(0, 8)}...{account.pubkey.slice(-8)}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">
            {formatLamports(lamports)}
          </Badge>
          {refCount > 0 && (
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">
              {refCount} refs
            </Badge>
          )}
        </div>
      </div>

      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-primary"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-primary"
      />
    </div>
  );
});

AccountNode.displayName = "AccountNode";

