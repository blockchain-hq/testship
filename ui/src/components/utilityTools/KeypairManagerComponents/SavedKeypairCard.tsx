import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { EyeOff, Eye, Trash2 } from "lucide-react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { type SavedKeypair } from "@/lib/types";
import UseCopy from "@/hooks/useCopy";
import { useState } from "react";
import { useCluster } from "@/context/ClusterContext";

interface SavedKeypairCardProps {
  savedKeypair: SavedKeypair;
  onDelete: (publicKey: string) => void;
  showSecrets: Set<string>;
  onToggleSecret: (publicKey: string) => void;
  exportAsJSON: (secretKey: string) => string;
}

const SavedKeypairCard = (props: SavedKeypairCardProps) => {
  const { savedKeypair, onDelete, showSecrets, onToggleSecret, exportAsJSON } =
    props;
  const { handleCopy } = UseCopy();
  const { getExplorerUrl } = useCluster();
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const handleCopyWithReset = (text: string, itemId: string) => {
    handleCopy(text);
    setCopiedItem(itemId);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  return (
    <Card key={savedKeypair.publicKey} className="relative">
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{savedKeypair.label}</Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(savedKeypair.timestamp).toLocaleDateString()}
              </span>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Public Key:
              </Label>
              <div className="flex gap-2">
                <Input
                  value={savedKeypair.publicKey}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() =>
                    handleCopyWithReset(
                      savedKeypair.publicKey,
                      `${savedKeypair.publicKey}-publicKey`
                    )
                  }
                >
                  {copiedItem === `${savedKeypair.publicKey}-publicKey` ? (
                    <CheckIcon className="size-4 text-[#00bf63]" />
                  ) : (
                    <CopyIcon className="size-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2 mt-3">
              <Label className="text-xs text-muted-foreground">
                Secret Key:
              </Label>
              <div className="flex gap-2">
                <Input
                  value={savedKeypair.secretKey}
                  readOnly
                  className="font-mono text-xs"
                  type={
                    showSecrets.has(savedKeypair.publicKey)
                      ? "text"
                      : "password"
                  }
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => onToggleSecret(savedKeypair.publicKey)}
                >
                  {showSecrets.has(savedKeypair.publicKey) ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() =>
                    handleCopyWithReset(
                      savedKeypair.secretKey,
                      `${savedKeypair.publicKey}-secretKeyBase64`
                    )
                  }
                >
                  {copiedItem ===
                  `${savedKeypair.publicKey}-secretKeyBase64` ? (
                    <CheckIcon className="size-4 text-[#00bf63]" />
                  ) : (
                    <CopyIcon className="size-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  handleCopyWithReset(
                    exportAsJSON(savedKeypair.secretKey),
                    `${savedKeypair.publicKey}-secretKeyJson`
                  )
                }
              >
                {copiedItem === `${savedKeypair.publicKey}-secretKeyJson` ? (
                  <CheckIcon className="w-3 h-3 mr-1 text-[#00bf63]" />
                ) : (
                  <CopyIcon className="w-3 h-3 mr-1" />
                )}
                Copy as JSON
              </Button>
              <Button
                size="sm"
                variant="link"
                onClick={() =>
                  window.open(
                    getExplorerUrl(savedKeypair.publicKey, "address"),
                    "_blank"
                  )
                }
              >
                View on Explorer →
              </Button>
            </div>
          </div>

          <Button
            size="icon"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(savedKeypair.publicKey)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SavedKeypairCard;
