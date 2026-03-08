import { useState } from "react";
import { useCluster, isDefaultCluster, type SolanaCluster, type ClusterNetwork } from "@/store/use-cluster";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  GlobeIcon,
  CircleNotchIcon,
  CheckCircleIcon,
  CircleIcon,
  TrashIcon,
  GearSixIcon,
  PlusIcon,
  XIcon,
  CheckIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";

export const ClusterSelect = () => {
  const { clusters, active, setCluster } = useCluster();

  return (
    <Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="capitalize h-8 gap-2 text-xs">
            <GlobeIcon className="size-3.5" weight="bold" />
            {active.name}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[160px]">
          {clusters.map((item) => (
            <DropdownMenuItem
              key={item.name}
              onClick={() => setCluster(item)}
              className="capitalize gap-2"
            >
              {item.name === active.name ? (
                <CheckCircleIcon className="size-3.5 text-green-500" weight="fill" />
              ) : (
                <CircleIcon className="size-3.5" />
              )}
              <span className={item.name === active.name ? "font-semibold" : ""}>
                {item.name}
              </span>
              {!isDefaultCluster(item.name) && (
                <Badge variant="outline" className="ml-auto text-[9px] px-1">
                  custom
                </Badge>
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DialogTrigger asChild>
            <DropdownMenuItem className="gap-2">
              <GearSixIcon className="size-3.5" />
              Manage RPCs
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <RPCConfigContent />
    </Dialog>
  );
};

const RPCConfigContent = () => {
  const { clusters, active, setCluster, addCluster, deleteCluster } = useCluster();
  const [isAdding, setIsAdding] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", endpoint: "", network: "custom" as ClusterNetwork });

  const handleAdd = () => {
    if (!form.name.trim() || !form.endpoint.trim()) {
      toast.error("Fill in both name and endpoint");
      return;
    }
    try {
      new URL(form.endpoint);
    } catch {
      toast.error("Invalid endpoint URL");
      return;
    }
    if (clusters.some((c) => c.name === form.name)) {
      toast.error("Name already exists");
      return;
    }
    const newCluster: SolanaCluster = { name: form.name, endpoint: form.endpoint, network: form.network };
    addCluster(newCluster);
    setCluster(newCluster);
    toast.success(`Added "${form.name}" and set as active`);
    setForm({ name: "", endpoint: "", network: "custom" });
    setIsAdding(false);
  };

  const testRpc = async (cluster: SolanaCluster) => {
    setTesting(cluster.name);
    try {
      const res = await fetch(cluster.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getSlot" }),
      });
      const data = await res.json();
      toast.success(`RPC OK! Slot: ${data.result}`);
    } catch (err: any) {
      toast.error(`RPC failed: ${err.message}`);
    } finally {
      setTesting(null);
    }
  };

  return (
    <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <GearSixIcon className="size-5" />
          RPC Configuration
        </DialogTitle>
        <DialogDescription>
          Manage your RPC endpoints. Add custom endpoints or configure existing ones.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-4 p-4 border rounded-md">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Add Custom RPC</h3>
            <Button variant="outline" size="sm" onClick={() => setIsAdding(!isAdding)}>
              {isAdding ? <><XIcon className="size-3.5" /> Cancel</> : <><PlusIcon className="size-3.5" /> Add</>}
            </Button>
          </div>

          {isAdding && (
            <div className="space-y-3 pt-2">
              <div>
                <Label>Name</Label>
                <Input
                  placeholder="e.g., Helius Mainnet"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Endpoint URL</Label>
                <Input
                  placeholder="https://api.mainnet-beta.solana.com"
                  value={form.endpoint}
                  onChange={(e) => setForm({ ...form, endpoint: e.target.value })}
                />
              </div>
              <div>
                <Label>Network Type</Label>
                <Select value={form.network} onValueChange={(v: ClusterNetwork) => setForm({ ...form, network: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mainnet-beta">Mainnet</SelectItem>
                    <SelectItem value="devnet">Devnet</SelectItem>
                    <SelectItem value="testnet">Testnet</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAdd} className="w-full">
                <PlusIcon className="size-3.5" /> Add RPC Endpoint
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">RPC Endpoints</h3>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clusters.map((cluster) => (
                  <TableRow
                    key={cluster.name}
                    className={active.name === cluster.name ? "bg-accent/50 cursor-pointer" : "cursor-pointer hover:bg-muted/50"}
                    onClick={() => {
                      setCluster(cluster);
                      toast.success(`Switched to ${cluster.name}`);
                    }}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {cluster.name}
                        {active.name === cluster.name && <Badge className="text-xs">Active</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      <div className="max-w-[200px] truncate">{cluster.endpoint}</div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7"
                        onClick={(e) => { e.stopPropagation(); testRpc(cluster); }}
                        disabled={testing === cluster.name}
                      >
                        {testing === cluster.name ? (
                          <><CircleNotchIcon className="size-3 animate-spin" /> Testing...</>
                        ) : (
                          <><CheckIcon className="size-3" /> Test</>
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      {!isDefaultCluster(cluster.name) && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          onClick={(e) => { e.stopPropagation(); deleteCluster(cluster.name); }}
                        >
                          <TrashIcon className="size-3.5" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="space-y-2 p-4 border rounded-md bg-muted/30">
          <h3 className="text-sm font-semibold">Popular RPC Providers</h3>
          <p className="text-xs text-muted-foreground">Click to quickly fill the add form:</p>
          <div className="flex flex-wrap gap-2">
            {[
              { name: "Helius Mainnet", endpoint: "https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY" },
              { name: "QuickNode Mainnet", endpoint: "https://YOUR_ENDPOINT.solana-mainnet.quiknode.pro/YOUR_TOKEN/" },
              { name: "Alchemy Mainnet", endpoint: "https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY" },
            ].map((provider) => (
              <Button
                key={provider.name}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setForm({ name: provider.name, endpoint: provider.endpoint, network: "mainnet-beta" });
                  setIsAdding(true);
                }}
              >
                {provider.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </DialogContent>
  );
};
