import { useState } from "react";
import { Button } from "../ui/button";
import { formatDecodedValue } from "@/lib/utils/account-state";

interface AccountDecodedDataProps {
  decoded: unknown;
}

export const AccountDecodedData = (props: AccountDecodedDataProps) => {
  const { decoded } = props;
  const [showRawData, setShowRawData] = useState(false);

  return (
    <div className="mt-2 ml-5 space-y-1">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-semibold text-muted-foreground">
          Fields:
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="h-4 px-1.5 text-[10px]"
          onClick={() => setShowRawData(!showRawData)}
        >
          {showRawData ? "Formatted" : "Raw"}
        </Button>
      </div>

      {showRawData ? (
        <pre className="text-[10px] bg-muted p-2 rounded-md overflow-x-auto font-mono">
          {JSON.stringify(decoded, null, 2)}
        </pre>
      ) : (
        <div className="space-y-0.5 text-[10px]">
          {Object.entries(decoded as Record<string, unknown>).map(
            ([key, value]) => (
              <div key={key} className="flex justify-between gap-2 py-0.5">
                <span className="text-muted-foreground font-mono">{key}:</span>
                <span className="font-mono text-right break-all">
                  {formatDecodedValue(value)}
                </span>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};
