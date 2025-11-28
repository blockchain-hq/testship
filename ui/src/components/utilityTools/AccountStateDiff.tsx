import { useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Code2, Filter, FilterX } from "lucide-react";
import { SmartFieldValue } from "./SmartFieldValue";
import { DiffFieldValue } from "./DiffFieldValue";
import { compareAccountStates } from "@/lib/utils/account-diff";

interface AccountStateDiffProps {
  accountName: string;
  beforeState: unknown | null;
  afterState: unknown | null;
  accountType?: string;
}

export const AccountStateDiff = ({
  accountName,
  beforeState,
  afterState,
  accountType,
}: AccountStateDiffProps) => {
  const [showOnlyChanged, setShowOnlyChanged] = useState(false);
  const [showRawData, setShowRawData] = useState(false);

  // Detect account creation or closure
  const isCreated = !beforeState && afterState;
  const isClosed = beforeState && !afterState;

  // Calculate diff
  const stateDiff = compareAccountStates(beforeState, afterState);

  // Show creation message
  if (isCreated) {
    return (
      <div className="space-y-2 border border-green-500/50 rounded-md p-3 bg-green-50 dark:bg-green-950/20">
        <div className="flex items-center justify-between pb-2 border-b border-green-500/30">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold font-mono">{accountName}</p>
            {accountType && (
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 h-4"
              >
                {accountType}
              </Badge>
            )}
            <Badge className="text-[10px] px-1.5 py-0 h-4 bg-green-600 dark:bg-green-700">
              ACCOUNT CREATED
            </Badge>
          </div>
        </div>
        {showRawData ? (
          <div className="bg-muted/30 rounded-md overflow-hidden border border-border/50">
            <pre className="text-[10px] p-3 overflow-x-auto font-mono leading-relaxed">
              {JSON.stringify(afterState, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="rounded-md border border-border/50 overflow-hidden bg-background/50 divide-y divide-border/30">
            {Object.entries((afterState as Record<string, unknown>) || {}).map(
              ([fieldKey, value]) => (
                <div
                  key={fieldKey}
                  className="grid grid-cols-[35%_1fr] gap-3 px-3 py-2 hover:bg-muted/20 transition-colors"
                >
                  <div className="text-[11px] font-mono text-muted-foreground font-medium truncate">
                    {fieldKey}
                  </div>
                  <div className="text-[11px] min-w-0">
                    <SmartFieldValue fieldKey={fieldKey} value={value} />
                  </div>
                </div>
              )
            )}
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-[10px] gap-1"
          onClick={() => setShowRawData(!showRawData)}
        >
          <Code2 className="w-3 h-3" />
          {showRawData ? "Smart" : "Raw"}
        </Button>
      </div>
    );
  }

  // Show closure message
  if (isClosed) {
    return (
      <div className="space-y-2 border border-red-500/50 rounded-md p-3 bg-red-50 dark:bg-red-950/20">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold font-mono">{accountName}</p>
          {accountType && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
              {accountType}
            </Badge>
          )}
          <Badge className="text-[10px] px-1.5 py-0 h-4 bg-red-600 dark:bg-red-700">
            ACCOUNT CLOSED
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          This account was closed during the transaction
        </p>
      </div>
    );
  }

  if (!stateDiff.hasChanges) {
    return (
      <div className="text-xs text-muted-foreground italic p-3 bg-muted/20 rounded-md">
        No changes detected for {accountName}
      </div>
    );
  }

  // Get all fields from after state for display
  const afterObj =
    afterState && typeof afterState === "object"
      ? (afterState as Record<string, unknown>)
      : {};

  // Determine which fields to show
  const fieldsToShow = showOnlyChanged
    ? Object.keys(stateDiff.fieldDiffs)
    : Object.keys(afterObj);

  return (
    <div className="space-y-2 border border-border/30 rounded-md p-3 bg-background/50">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/30">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold font-mono">{accountName}</p>
          {accountType && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
              {accountType}
            </Badge>
          )}
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
            {stateDiff.changedFields.length} field
            {stateDiff.changedFields.length !== 1 ? "s" : ""} changed
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          {/* Toggle for showing only changed fields */}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] gap-1"
            onClick={() => setShowOnlyChanged(!showOnlyChanged)}
          >
            {showOnlyChanged ? (
              <>
                <FilterX className="w-3 h-3" />
                Show All
              </>
            ) : (
              <>
                <Filter className="w-3 h-3" />
                Only Changed
              </>
            )}
          </Button>

          {/* Toggle for raw/smart view */}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] gap-1"
            onClick={() => setShowRawData(!showRawData)}
          >
            <Code2 className="w-3 h-3" />
            {showRawData ? "Smart" : "Raw"}
          </Button>
        </div>
      </div>

      {/* Raw JSON view */}
      {showRawData ? (
        <div className="space-y-2">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground mb-1">
              BEFORE:
            </p>
            <div className="bg-muted/30 rounded-md overflow-hidden border border-border/50">
              <pre className="text-[10px] p-3 overflow-x-auto font-mono leading-relaxed">
                {JSON.stringify(beforeState, null, 2)}
              </pre>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground mb-1">
              AFTER:
            </p>
            <div className="bg-muted/30 rounded-md overflow-hidden border border-border/50">
              <pre className="text-[10px] p-3 overflow-x-auto font-mono leading-relaxed">
                {JSON.stringify(afterState, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      ) : (
        /* Smart field view */
        <div className="rounded-md border border-border/50 overflow-hidden bg-background/50 divide-y divide-border/30">
          {fieldsToShow.map((fieldKey) => {
            const isChanged = stateDiff.fieldDiffs[fieldKey];

            if (isChanged) {
              // Show diff for changed field
              return (
                <div key={fieldKey} className="overflow-hidden">
                  <div className="px-3 py-1 bg-muted/10">
                    <p className="text-[11px] font-mono text-muted-foreground font-medium">
                      {fieldKey}
                    </p>
                  </div>
                  <DiffFieldValue diff={isChanged} />
                </div>
              );
            } else {
              // Show unchanged field (only when not filtering)
              return (
                <div
                  key={fieldKey}
                  className="grid grid-cols-[35%_1fr] gap-3 px-3 py-2 hover:bg-muted/20 transition-colors"
                >
                  <div className="text-[11px] font-mono text-muted-foreground font-medium truncate">
                    {fieldKey}
                  </div>
                  <div className="text-[11px] min-w-0 opacity-60">
                    <SmartFieldValue
                      fieldKey={fieldKey}
                      value={afterObj[fieldKey]}
                    />
                  </div>
                </div>
              );
            }
          })}

          {fieldsToShow.length === 0 && (
            <div className="text-xs text-muted-foreground italic p-3 text-center">
              No fields to display
            </div>
          )}
        </div>
      )}
    </div>
  );
};
