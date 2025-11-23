import { useState } from "react";
import { Keypair } from "@solana/web3.js";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import UseCopy from "@/hooks/useCopy";
import {
  Key,
  Download,
  Upload,
  Plus,
  CopyIcon,
  CheckIcon,
  FileWarningIcon,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { useCluster } from "@/context/ClusterContext";
import { type SavedKeypair } from "@/lib/types";
import SavedKeypairCard from "./KeypairManagerComponents/SavedKeypairCard";

export const KeypairManager = () => {
  const { handleCopy } = UseCopy();
  const [copiedItem, setCopiedItem] = useState<
    "publicKey" | "secretKeyBase64" | "secretKeyJson" | null
  >(null);
  const { getExplorerUrl } = useCluster();

  const [newKeypair, setNewKeypair] = useState<Keypair | null>(null);
  const [keypairLabel, setKeypairLabel] = useState("");

  const [importSecret, setImportSecret] = useState("");
  const [importedKeypair, setImportedKeypair] = useState<Keypair | null>(null);

  const [savedKeypairs, setSavedKeypairs] = useState<SavedKeypair[]>(() => {
    try {
      const saved = localStorage.getItem("testship_saved_keypairs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showSecrets, setShowSecrets] = useState<Set<string>>(new Set());

  const handleCopyWithReset = (
    text: string,
    itemType: "publicKey" | "secretKeyBase64" | "secretKeyJson"
  ) => {
    handleCopy(text);
    setCopiedItem(itemType);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handleGenerateKeypair = () => {
    const kp = Keypair.generate();
    setNewKeypair(kp);
    setKeypairLabel("");
  };

  const handleSaveKeypair = (keypair: Keypair, label: string) => {
    const savedKp: SavedKeypair = {
      label: label || `Keypair ${savedKeypairs.length + 1}`,
      publicKey: keypair.publicKey.toBase58(),
      secretKey: Buffer.from(keypair.secretKey).toString("base64"),
      timestamp: Date.now(),
    };

    const updated = [...savedKeypairs, savedKp];
    setSavedKeypairs(updated);
    localStorage.setItem("testship_saved_keypairs", JSON.stringify(updated));
    setNewKeypair(null);
    setKeypairLabel("");
  };

  const handleImportKeypair = () => {
    try {
      let secretKey: Uint8Array;

      try {
        const parsed = JSON.parse(importSecret);
        if (Array.isArray(parsed)) {
          secretKey = Uint8Array.from(parsed);
        } else {
          throw new Error("Not an array");
        }
      } catch {
        try {
          secretKey = Uint8Array.from(Buffer.from(importSecret, "base64"));
        } catch {
          throw new Error("Invalid secret key format");
        }
      }

      const kp = Keypair.fromSecretKey(secretKey);
      setImportedKeypair(kp);
    } catch (error) {
      alert(`Failed to import keypair: ${error}`);
    }
  };

  const handleDeleteKeypair = (publicKey: string) => {
    const updated = savedKeypairs.filter((kp) => kp.publicKey !== publicKey);
    setSavedKeypairs(updated);
    localStorage.setItem("testship_saved_keypairs", JSON.stringify(updated));
  };

  const toggleShowSecret = (publicKey: string) => {
    const newSet = new Set(showSecrets);
    if (newSet.has(publicKey)) {
      newSet.delete(publicKey);
    } else {
      newSet.add(publicKey);
    }
    setShowSecrets(newSet);
  };

  const exportAsJSON = (secretKey: string) => {
    const buffer = Buffer.from(secretKey, "base64");
    return JSON.stringify(Array.from(buffer));
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">
            <Plus className="w-4 h-4 mr-2" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="import">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </TabsTrigger>
          <TabsTrigger value="saved">
            <Key className="w-4 h-4 mr-2" />
            Saved ({savedKeypairs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Generate New Keypair</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleGenerateKeypair} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Generate Random Keypair
              </Button>

              {newKeypair && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Public Key:
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          value={newKeypair.publicKey.toBase58()}
                          readOnly
                          className="font-mono text-xs"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() =>
                            handleCopyWithReset(
                              newKeypair.publicKey.toBase58(),
                              "publicKey"
                            )
                          }
                        >
                          {copiedItem === "publicKey" ? (
                            <CheckIcon className="size-4 text-[#00bf63]" />
                          ) : (
                            <CopyIcon className="size-4" />
                          )}
                        </Button>
                      </div>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto text-xs"
                        onClick={() =>
                          window.open(
                            getExplorerUrl(
                              newKeypair.publicKey.toBase58(),
                              "address"
                            ),
                            "_blank"
                          )
                        }
                      >
                        View on Explorer →
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Secret Key (Base64):
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          value={Buffer.from(newKeypair.secretKey).toString(
                            "base64"
                          )}
                          readOnly
                          className="font-mono text-xs"
                          type="password"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() =>
                            handleCopyWithReset(
                              Buffer.from(newKeypair.secretKey).toString(
                                "base64"
                              ),
                              "secretKeyBase64"
                            )
                          }
                        >
                          {copiedItem === "secretKeyBase64" ? (
                            <CheckIcon className="size-4 text-[#00bf63]" />
                          ) : (
                            <CopyIcon className="size-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Secret Key (JSON Array):
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          value={JSON.stringify(
                            Array.from(newKeypair.secretKey)
                          )}
                          readOnly
                          className="font-mono text-xs"
                          type="password"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() =>
                            handleCopyWithReset(
                              JSON.stringify(Array.from(newKeypair.secretKey)),
                              "secretKeyJson"
                            )
                          }
                        >
                          {copiedItem === "secretKeyJson" ? (
                            <CheckIcon className="size-4 text-[#00bf63]" />
                          ) : (
                            <CopyIcon className="size-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="keypair-label">Label (optional):</Label>
                      <Input
                        id="keypair-label"
                        value={keypairLabel}
                        onChange={(e) => setKeypairLabel(e.target.value)}
                        placeholder="e.g., AMM ID, Test Account"
                      />
                    </div>

                    <div
                      className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4"
                      role="alert"
                    >
                      <p className="font-bold mb-2">Warning</p>
                      <div className="flex flex-row items-center">
                        <FileWarningIcon className="size-4 mr-2" />
                        <span>
                          Private keys stored in browser. Only use for testing
                          purposes!
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={() =>
                        handleSaveKeypair(newKeypair, keypairLabel)
                      }
                      variant="secondary"
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Save Keypair
                    </Button>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Import Existing Keypair
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="import-secret">
                  Secret Key (Base64 or JSON Array):
                </Label>
                <Input
                  id="import-secret"
                  value={importSecret}
                  onChange={(e) => setImportSecret(e.target.value)}
                  placeholder="Paste secret key here..."
                  className="font-mono text-sm"
                />
              </div>

              <Button
                onClick={handleImportKeypair}
                disabled={!importSecret}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Keypair
              </Button>

              {importedKeypair && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4 space-y-4">
                    <Badge variant="secondary">Successfully Imported</Badge>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Public Key:
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          value={importedKeypair.publicKey.toBase58()}
                          readOnly
                          className="font-mono text-xs"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() =>
                            handleCopyWithReset(
                              importedKeypair.publicKey.toBase58(),
                              "publicKey"
                            )
                          }
                        >
                          {copiedItem === "publicKey" ? (
                            <CheckIcon className="size-4 text-[#00bf63]" />
                          ) : (
                            <CopyIcon className="size-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="import-label">Label (optional):</Label>
                      <Input
                        id="import-label"
                        value={keypairLabel}
                        onChange={(e) => setKeypairLabel(e.target.value)}
                        placeholder="e.g., Imported Account"
                      />
                    </div>

                    <Button
                      onClick={() =>
                        handleSaveKeypair(importedKeypair, keypairLabel)
                      }
                      variant="secondary"
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Save Keypair
                    </Button>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          {savedKeypairs.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No saved keypairs yet</p>
                <p className="text-xs mt-2">
                  Generate or import a keypair to save it
                </p>
              </CardContent>
            </Card>
          ) : (
            savedKeypairs.map((kp) => (
              <SavedKeypairCard
                key={kp.publicKey}
                savedKeypair={kp}
                onDelete={handleDeleteKeypair}
                showSecrets={showSecrets}
                onToggleSecret={toggleShowSecret}
                exportAsJSON={exportAsJSON}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
