import { useCluster } from "@/context/ClusterContext";
import UseCopy from "@/hooks/useCopy";
import { useSPLToken } from "@/hooks/useSPLToken";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "../ui";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Plus,
  Coins,
  Send,
  RefreshCw,
  Loader2,
  ExternalLink,
  CheckIcon,
  CopyIcon,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { TransactionToast } from "../TransactionToast";

interface TokenInfo {
  mint: string;
  decimals: number;
  tokenAccount?: string;
  balance?: string;
}

export const SPLTokenManager = () => {
  const { getExplorerUrl } = useCluster();
  const { copied, handleCopy } = UseCopy();
  const { publicKey } = useWallet();

  const { createToken, mintTokens, transferTokens, getTokenInfo, loading } =
    useSPLToken();

  const [decimals, setDecimals] = useState("9");
  const [createdMint, setCreatedMint] = useState<string | null>(null);

  const [mintAddress, setMintAddress] = useState<string>("");
  const [mintAmount, setMintAmount] = useState("");
  const [mintToAddress, setMintToAddress] = useState("");

  const [transferMint, setTransferMint] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferToAddress, setTransferToAddress] = useState("");

  const [infoMint, setInfoMint] = useState<string>("");
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);

  const handleCreateToken = async () => {
    try {
      const decimalsNum = parseInt(decimals, 10);
      const mint = await createToken(decimalsNum);

      setCreatedMint(mint);
      setMintAddress(mint);
      setTransferMint(mint);
      setInfoMint(mint);

      toast.success("Token mint created successfully!");
    } catch (error) {
      console.error("Failed to create token:", error);
      toast.error("Failed to create token. Please try again.");
    }
  };

  const handleMintTokens = async () => {
    try {
      const signature = await mintTokens(
        mintAddress,
        mintToAddress,
        parseFloat(mintAmount)
      );

      toast.success(
        <TransactionToast
          signature={signature}
          status="success"
          message={`Successfully minted ${mintAmount} tokens!`}
        />
      );
      setMintAmount("");
    } catch (err) {
      console.error("Mint tokens error:", err);
      toast.error(
        "Failed to mint tokens. Please check the console for details."
      );
    }
  };

  const handleTransferTokens = async () => {
    try {
      const signature = await transferTokens(
        transferMint,
        transferToAddress,
        parseFloat(transferAmount)
      );

      toast.success(
        <TransactionToast
          signature={signature}
          status="success"
          message={`Successfully transferred ${transferAmount} tokens!`}
        />
      );
      setTransferAmount("");
    } catch (err) {
      console.error("Transfer tokens error:", err);
      toast.error(
        "Failed to transfer tokens. Please check the console for details."
      );
    }
  };

  const handleGetTokenInfo = async () => {
    try {
      const info = await getTokenInfo(infoMint);
      setTokenInfo(info);
      toast.success("Token information retrieved successfully!");
    } catch (err) {
      console.error("Get token info error:", err);
      toast.error(
        "Failed to get token information. Please check the mint address."
      );
    }
  };

  if (!publicKey) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Please connect your wallet to manage SPL tokens</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="create">
            <Plus className="w-4 h-4 mr-2" />
            Create
          </TabsTrigger>
          <TabsTrigger value="mint">
            <Coins className="w-4 h-4 mr-2" />
            Mint
          </TabsTrigger>
          <TabsTrigger value="transfer">
            <Send className="w-4 h-4 mr-2" />
            Transfer
          </TabsTrigger>
          <TabsTrigger value="info">
            <RefreshCw className="w-4 h-4 mr-2" />
            Info
          </TabsTrigger>
        </TabsList>

        {/* CREATE TAB */}
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Create New SPL Token</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="decimals">Decimals</Label>
                <Input
                  id="decimals"
                  type="number"
                  value={decimals}
                  onChange={(e) => setDecimals(e.target.value)}
                  placeholder="9"
                  min="0"
                  max="9"
                />
              </div>

              <Button
                onClick={handleCreateToken}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Token...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Token Mint
                  </>
                )}
              </Button>

              {createdMint && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">Token Created</Badge>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto"
                        onClick={() =>
                          window.open(
                            getExplorerUrl(createdMint, "address"),
                            "_blank"
                          )
                        }
                      >
                        View on Explorer
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Mint Address:
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          value={createdMint}
                          readOnly
                          className="font-mono text-xs"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleCopy(createdMint)}
                        >
                          {copied ? (
                            <CheckIcon className="size-4 text-[#00bf63]" />
                          ) : (
                            <CopyIcon className="size-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* MINT TAB */}
        <TabsContent value="mint" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Mint Tokens to Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mint-address">Token Mint Address</Label>
                <Input
                  id="mint-address"
                  value={mintAddress}
                  onChange={(e) => setMintAddress(e.target.value)}
                  placeholder="Token mint address"
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mint-to">Recipient Address</Label>
                <div className="flex gap-2">
                  <Input
                    id="mint-to"
                    value={mintToAddress}
                    onChange={(e) => setMintToAddress(e.target.value)}
                    placeholder="Recipient address"
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      publicKey && setMintToAddress(publicKey.toBase58())
                    }
                  >
                    My Wallet
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mint-amount">Amount</Label>
                <Input
                  id="mint-amount"
                  type="number"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  placeholder="100"
                />
              </div>

              <Button
                onClick={handleMintTokens}
                disabled={
                  loading || !mintAddress || !mintToAddress || !mintAmount
                }
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Minting...
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4 mr-2" />
                    Mint Tokens
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TRANSFER TAB */}
        <TabsContent value="transfer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Transfer Tokens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transfer-mint">Token Mint Address</Label>
                <Input
                  id="transfer-mint"
                  value={transferMint}
                  onChange={(e) => setTransferMint(e.target.value)}
                  placeholder="Token mint address"
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transfer-to">Recipient Address</Label>
                <Input
                  id="transfer-to"
                  value={transferToAddress}
                  onChange={(e) => setTransferToAddress(e.target.value)}
                  placeholder="Recipient address"
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transfer-amount">Amount</Label>
                <Input
                  id="transfer-amount"
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="10"
                />
              </div>

              <Button
                onClick={handleTransferTokens}
                disabled={
                  loading ||
                  !transferMint ||
                  !transferToAddress ||
                  !transferAmount
                }
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Transferring...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Transfer Tokens
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* INFO TAB */}
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Token Info & Balance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="info-mint">Token Mint Address</Label>
                <Input
                  id="info-mint"
                  value={infoMint}
                  onChange={(e) => setInfoMint(e.target.value)}
                  placeholder="Token mint address"
                  className="font-mono text-sm"
                />
              </div>

              <Button
                onClick={handleGetTokenInfo}
                disabled={loading || !infoMint}
                className="w-full"
                variant="outline"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Get Token Info
                  </>
                )}
              </Button>

              {tokenInfo && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Decimals:
                        </Label>
                        <p className="text-lg font-semibold">
                          {tokenInfo.decimals}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Balance:
                        </Label>
                        <p className="text-lg font-semibold text-[#00bf63]">
                          {tokenInfo.balance || "0"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
