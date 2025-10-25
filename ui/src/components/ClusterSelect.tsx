import { useCluster } from "@/context/ClusterContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

const ClusterSelect = () => {
  const { clusters, setCluster, cluster } = useCluster();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="capitalize">
          {cluster.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="border border-border/50 rounded-md"
      >
        {clusters.map((item) => (
          <DropdownMenuItem
            key={item.name}
            onClick={() => setCluster(item)}
            className="capitalize"
          >
            {item.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ClusterSelect;
