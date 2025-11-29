import { useState } from "react";
import { useCluster, ClusterNetwork } from "@/context/ClusterContext";
import type { ClusterNetworkType } from "@/context/ClusterContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui";
import { Settings, Plus, Trash2, Check, X, Loader2 } from "lucide-react";
import { Connection } from "@solana/web3.js";
import { toast } from "sonner";

export const RPCConfigDialog = () => {
  const {
    clusters,
    addCluster,
    deleteCluster,
    setCluster,
    cluster: activeCluster,
  } = useCluster();
  const [open, setOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isTesting, setIsTesting] = useState<string | null>(null);

  const [newCluster, setNewCluster] = useState<{
    name: string;
    endpoint: string;
    network: ClusterNetworkType;
  }>({
    name: "",
    endpoint: "",
    network: ClusterNetwork.Custom,
  });

  const defaultClusterNames = ["mainnet-beta", "devnet", "testnet", "local"];

  const isDefaultCluster = (clusterName: string) => {
    return defaultClusterNames.includes(clusterName);
  };

  const handleAdd = () => {
    if (!newCluster.name.trim() || !newCluster.endpoint.trim()) {
      toast.error("Please fill in both name and endpoint");
      return;
    }

    // Validate endpoint URL
    try {
      new URL(newCluster.endpoint);
    } catch {
      toast.error("Invalid endpoint URL");
      return;
    }

    // Check if name already exists
    if (clusters.some((c) => c.name === newCluster.name)) {
      toast.error("Cluster name already exists");
      return;
    }

    try {
      const newClusterToAdd = {
        name: newCluster.name,
        endpoint: newCluster.endpoint,
        network: newCluster.network,
      };

      // Add the cluster to the list
      addCluster(newClusterToAdd);

      // Immediately set it as the active cluster
      setCluster(newClusterToAdd);

      toast.success(
        `RPC endpoint "${newCluster.name}" added and set as active`
      );

      // Reset form
      setNewCluster({
        name: "",
        endpoint: "",
        network: ClusterNetwork.Custom,
      });
      setIsAdding(false);
    } catch (error) {
      toast.error("Failed to add RPC endpoint");
      console.error(error);
    }
  };

  const handleDelete = (clusterName: string) => {
    if (isDefaultCluster(clusterName)) {
      toast.error("Cannot delete default clusters");
      return;
    }

    const clusterToDelete = clusters.find((c) => c.name === clusterName);
    if (clusterToDelete) {
      deleteCluster(clusterToDelete);
      toast.success("RPC endpoint removed");
    }
  };

  const testRPC = async (endpoint: string, clusterName: string) => {
    setIsTesting(clusterName);
    try {
      const connection = new Connection(endpoint, "confirmed");
      const slot = await connection.getSlot();
      toast.success(`RPC test successful! Current slot: ${slot}`);
    } catch (error) {
      toast.error(
        `RPC test failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsTesting(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 w-fit flex flex-row font-semibold text-muted-foreground items-center gap-2"
        >
          <Settings className="size-4" />
          Manage RPCs
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto bg-background dark:bg-background-dark bg-card dark:bg-card-dark border border-border dark:border-border-dark">
        <DialogHeader className="bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark">
          <DialogTitle className="flex items-center gap-2 text-foreground dark:text-foreground-dark">
            <Settings className="size-5 text-foreground dark:text-foreground-dark" />
            RPC Configuration
          </DialogTitle>
          <DialogDescription className="text-muted-foreground dark:text-muted-foreground-dark">
            Manage your RPC endpoints. Add custom endpoints or configure
            existing ones.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-foreground dark:text-foreground-dark">
          {/* Add New RPC Section */}
          <div className="space-y-4 p-4 border border-border/50 rounded-md">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground dark:text-foreground-dark">
                Add Custom RPC
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAdding(!isAdding)}
              >
                {isAdding ? (
                  <>
                    <X className="w-4 h-4 mr-2 text-foreground dark:text-foreground-dark`" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2 text-foreground dark:text-foreground-dark" />
                    Add
                  </>
                )}
              </Button>
            </div>

            {isAdding && (
              <div className="space-y-3 pt-2">
                <div>
                  <Label htmlFor="rpc-name">Name</Label>
                  <Input
                    id="rpc-name"
                    placeholder="e.g., Helius Mainnet"
                    value={newCluster.name}
                    onChange={(e) =>
                      setNewCluster({ ...newCluster, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="rpc-endpoint">Endpoint URL</Label>
                  <Input
                    id="rpc-endpoint"
                    placeholder="https://api.mainnet-beta.solana.com"
                    value={newCluster.endpoint}
                    onChange={(e) =>
                      setNewCluster({ ...newCluster, endpoint: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="rpc-network">Network Type</Label>
                  <Select
                    value={newCluster.network}
                    onValueChange={(value: any) =>
                      setNewCluster({ ...newCluster, network: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ClusterNetwork.Mainnet}>
                        Mainnet
                      </SelectItem>
                      <SelectItem value={ClusterNetwork.Devnet}>
                        Devnet
                      </SelectItem>
                      <SelectItem value={ClusterNetwork.Testnet}>
                        Testnet
                      </SelectItem>
                      <SelectItem value={ClusterNetwork.Custom}>
                        Custom
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAdd} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add RPC Endpoint
                </Button>
              </div>
            )}
          </div>

          {/* RPC List */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">RPC Endpoints</h3>
            <div className="border border-border/50 rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Network</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clusters.map((cluster) => (
                    <TableRow
                      key={cluster.name}
                      className={
                        activeCluster.name === cluster.name
                          ? "bg-accent/50 cursor-pointer"
                          : "cursor-pointer hover:bg-muted/50"
                      }
                      onClick={() => {
                        setCluster(cluster);
                        toast.success(`Switched to ${cluster.name}`);
                      }}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {cluster.name}
                          {activeCluster.name === cluster.name && (
                            <Badge variant="default" className="text-xs">
                              Active
                            </Badge>
                          )}
                          {isDefaultCluster(cluster.name) && (
                            <Badge variant="secondary" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        <div className="max-w-[200px] truncate">
                          {cluster.endpoint}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs capitalize">
                          {cluster.network || "custom"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            testRPC(cluster.endpoint, cluster.name);
                          }}
                          disabled={isTesting === cluster.name}
                          className="h-7"
                        >
                          {isTesting === cluster.name ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Testing...
                            </>
                          ) : (
                            <>
                              <Check className="w-3 h-3 mr-1" />
                              Test
                            </>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isDefaultCluster(cluster.name) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(cluster.name);
                              }}
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Quick Add Popular RPCs */}
          <div className="space-y-2 p-4 border border-border/50 rounded-md bg-muted/30">
            <h3 className="text-sm font-semibold">Popular RPC Providers</h3>
            <p className="text-xs text-muted-foreground">
              Click to quickly add these popular RPC endpoints:
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setNewCluster({
                    name: "Helius Mainnet",
                    endpoint:
                      "https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY",
                    network: ClusterNetwork.Mainnet,
                  });
                  setIsAdding(true);
                }}
                className="text-xs"
              >
                Helius Mainnet
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setNewCluster({
                    name: "QuickNode Mainnet",
                    endpoint:
                      "https://YOUR_ENDPOINT.solana-mainnet.quiknode.pro/YOUR_TOKEN/",
                    network: ClusterNetwork.Mainnet,
                  });
                  setIsAdding(true);
                }}
                className="text-xs"
              >
                QuickNode Mainnet
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setNewCluster({
                    name: "Alchemy Mainnet",
                    endpoint:
                      "https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY",
                    network: ClusterNetwork.Mainnet,
                  });
                  setIsAdding(true);
                }}
                className="text-xs"
              >
                Alchemy Mainnet
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
