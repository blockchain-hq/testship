import { useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui";
import { Copy, Check, ExternalLink, Eye, EyeOff } from "lucide-react";
import {
  analyzeFieldType,
  type FieldTypeInfo,
} from "@/lib/utils/account-state";
import { useCluster, getClusterUrlParam } from "@/context/ClusterContext";
import useCopy from "@/hooks/useCopy";

interface SmartFieldValueProps {
  fieldKey: string;
  value: unknown;
}

export const SmartFieldValue = ({ fieldKey, value }: SmartFieldValueProps) => {
  const { cluster } = useCluster();
  const { copied, handleCopy: handleCopyClipboard } = useCopy();
  const [showRaw, setShowRaw] = useState(false);
  const [showHex, setShowHex] = useState(true);

  const fieldInfo: FieldTypeInfo = analyzeFieldType(fieldKey, value);

  const handleCopy = (text: string) => {
    handleCopyClipboard(text);
  };

  const getExplorerUrl = (address: string) => {
    const baseUrl = `https://explorer.solana.com/address/${address}`;
    return `${baseUrl}${getClusterUrlParam(cluster)}`;
  };

  switch (fieldInfo.type) {
    case "timestamp":
      return (
        <div className="flex items-center gap-1.5">
          {showRaw ? (
            <span className="font-mono">{fieldInfo.displayValue}</span>
          ) : (
            <span className="font-mono">
              {fieldInfo.extraData?.formattedDate}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0"
            onClick={() => setShowRaw(!showRaw)}
          >
            {showRaw ? (
              <Eye className="w-3 h-3" />
            ) : (
              <EyeOff className="w-3 h-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0"
            onClick={() => handleCopy(fieldInfo.displayValue)}
          >
            {copied ? (
              <Check className="w-3 h-3" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
        </div>
      );

    case "lamports":
      return (
        <div className="flex items-center gap-1.5">
          {showRaw ? (
            <span className="font-mono">{fieldInfo.displayValue}</span>
          ) : (
            <>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                {fieldInfo.extraData?.solValue}
              </Badge>
              <span className="font-mono text-muted-foreground">
                ({fieldInfo.displayValue})
              </span>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0"
            onClick={() => setShowRaw(!showRaw)}
          >
            {showRaw ? (
              <Eye className="w-3 h-3" />
            ) : (
              <EyeOff className="w-3 h-3" />
            )}
          </Button>
        </div>
      );

    case "publickey":
      return (
        <div className="flex items-center gap-1.5">
          <span className="font-mono">{fieldInfo.extraData?.truncatedKey}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0"
            onClick={() => handleCopy(fieldInfo.displayValue)}
          >
            {copied ? (
              <Check className="w-3 h-3" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0"
            onClick={() =>
              window.open(getExplorerUrl(fieldInfo.displayValue), "_blank")
            }
          >
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      );

    case "bytes":
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-muted-foreground">
              {fieldInfo.displayValue}
            </span>
            {fieldInfo.extraData?.isUtf8 && (
              <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3">
                UTF-8
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0"
              onClick={() => setShowHex(!showHex)}
            >
              {showHex ? "Hex" : "UTF-8"}
            </Button>
          </div>
          {showHex ? (
            <div className="font-mono text-[9px] text-muted-foreground break-all bg-muted/30 p-1 rounded">
              {fieldInfo.extraData?.hexValue?.slice(0, 100)}
              {fieldInfo.extraData?.hexValue &&
                fieldInfo.extraData.hexValue.length > 100 &&
                "..."}
            </div>
          ) : fieldInfo.extraData?.utf8Value ? (
            <div className="font-mono text-[9px] break-all bg-muted/30 p-1 rounded">
              {fieldInfo.extraData.utf8Value.slice(0, 100)}
              {fieldInfo.extraData.utf8Value.length > 100 && "..."}
            </div>
          ) : null}
        </div>
      );

    case "bignumber":
      return (
        <div className="flex items-center gap-1.5">
          {showRaw ? (
            <span className="font-mono">{fieldInfo.displayValue}</span>
          ) : (
            <span className="font-mono">
              {fieldInfo.extraData?.formattedNumber}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0"
            onClick={() => setShowRaw(!showRaw)}
          >
            {showRaw ? (
              <Eye className="w-3 h-3" />
            ) : (
              <EyeOff className="w-3 h-3" />
            )}
          </Button>
        </div>
      );

    case "enum":
      return (
        <Badge
          variant="secondary"
          className="text-[10px] px-1.5 py-0 h-4 font-mono"
        >
          {fieldInfo.displayValue}
        </Badge>
      );

    case "string":
      if (fieldInfo.displayValue.length > 50) {
        return (
          <div className="flex items-center gap-1.5">
            <span className="font-mono truncate max-w-[200px]">
              {fieldInfo.displayValue}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0"
              onClick={() =>
                handleCopy(fieldInfo.displayValue.replace(/^"|"$/g, ""))
              }
            >
              {copied ? (
                <Check className="w-3 h-3" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </div>
        );
      }
      return <span className="font-mono">{fieldInfo.displayValue}</span>;

    default:
      return <span className="font-mono">{fieldInfo.displayValue}</span>;
  }
};
