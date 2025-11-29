import { useCluster } from "@/context/ClusterContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Circle, CircleCheck, NetworkIcon, Trash2 } from "lucide-react";
import { ClusterNetwork } from "@/context/ClusterContext";
import type { SolanaCluster } from "@/context/ClusterContext";
import { RPCConfigDialog } from "./RPCConfigDialog";

const ClusterSelect = () => {
  const { clusters, setCluster, cluster, addCluster, deleteCluster } =
    useCluster();
  const [open, setOpen] = useState(false);
  const [clusterName, setClusterName] = useState("");
  const [clusterEndpoint, setClusterEndpoint] = useState("");

  const handleAddCluster = () => {
    if (!clusterName.trim() || !clusterEndpoint.trim()) {
      return;
    }

    const newCluster: SolanaCluster = {
      name: clusterName.trim(),
      endpoint: clusterEndpoint.trim(),
      network: ClusterNetwork.Custom,
    };

    addCluster(newCluster);
    setClusterName("");
    setClusterEndpoint("");
    setOpen(false);
  };

  const handleDeleteCluster = (
    clusterToDelete: SolanaCluster,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    deleteCluster(clusterToDelete);
  };

  const isCustomCluster = (item: SolanaCluster) => {
    return item.network === ClusterNetwork.Custom && item.name !== "local";
  };

  const isActiveCluster = (item: SolanaCluster) => {
    return item.name === cluster.name;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="capitalize h-10 bg-gray-200 dark:bg-gray-800 border-none"
          >
            <NetworkIcon className="h-3.5" />
            {cluster.name || "Select Cluster"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="border border-border">
          {clusters.map((item) => (
            <DropdownMenuItem
              key={item.name}
              onClick={() => setCluster(item)}
              className="capitalize flex justify-start items-center gap-2"
            >
              {isActiveCluster(item) ? (
                <CircleCheck className="h-3.5 text-brand" />
              ) : (
                <Circle className="h-3.5" />
              )}
              <span
                className={`text-sm  ${
                  isActiveCluster(item) ? "font-semibold" : "font-normal"
                }`}
              >
                {item.name}
              </span>

              {isCustomCluster(item) && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-6 w-6 p-0 ml-2"
                  onClick={(e) => handleDeleteCluster(item, e)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          <RPCConfigDialog />
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Custom Cluster</DialogTitle>
          <DialogDescription>
            Add a custom RPC endpoint to connect to a Solana cluster.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Cluster Name</Label>
            <Input
              id="name"
              placeholder="e.g., My Custom RPC"
              value={clusterName}
              onChange={(e) => setClusterName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCluster()}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="endpoint">RPC Endpoint</Label>
            <Input
              id="endpoint"
              placeholder="e.g., https://api.mainnet-beta.solana.com"
              value={clusterEndpoint}
              onChange={(e) => setClusterEndpoint(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCluster()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              setClusterName("");
              setClusterEndpoint("");
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddCluster}
            disabled={!clusterName.trim() || !clusterEndpoint.trim()}
          >
            Add Cluster
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClusterSelect;
