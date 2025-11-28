import { useState } from "react";
import { Button } from "../ui/button";
import { SmartFieldValue } from "./SmartFieldValue";
import { Code2 } from "lucide-react";

interface AccountDecodedDataProps {
  decoded: unknown;
}

export const AccountDecodedData = (props: AccountDecodedDataProps) => {
  const { decoded } = props;
  const [showRawData, setShowRawData] = useState(false);

  return (
    <div className="mt-2 ml-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
          Decoded Fields
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 px-2 text-[10px] gap-1"
          onClick={() => setShowRawData(!showRawData)}
        >
          <Code2 className="w-3 h-3" />
          {showRawData ? "Smart View" : "Raw JSON"}
        </Button>
      </div>

      {showRawData ? (
        <div className="bg-muted/30 rounded-md overflow-hidden border border-border/50">
          <pre className="text-[10px] p-3 overflow-x-auto font-mono leading-relaxed">
            {JSON.stringify(decoded, null, 2)}
          </pre>
        </div>
      ) : (
        <div className="rounded-md border border-border/50 overflow-hidden bg-background/50 divide-y divide-border/30">
          {Object.entries(decoded as Record<string, unknown>).map(
            ([key, value], index) => (
              <div
                key={key}
                className={`
                  grid grid-cols-[35%_1fr] 
                  gap-3 
                  px-3 
                  py-2 
                  hover:bg-muted/20 
                  transition-colors
                  ${index % 2 === 0 ? "bg-muted/5" : "bg-background"}
                `}
              >
                <div className="text-[11px] font-mono text-muted-foreground font-medium truncate">
                  {key}
                </div>
                <div className="text-[11px] min-w-0">
                  <SmartFieldValue fieldKey={key} value={value} />
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};
