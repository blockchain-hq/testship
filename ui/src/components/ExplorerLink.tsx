import { ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

interface ExplorerLinkProps {
  signature: string;
  cluster?: string;
}

export function ExplorerLink({
  signature,
  cluster = "custom",
}: ExplorerLinkProps) {
  const getExplorerUrl = () => {
    const baseUrl = "https://explorer.solana.com/tx";
    if (cluster === "custom") {
      return `${baseUrl}/${signature}?cluster=custom&customUrl=http://localhost:8899`;
    }
    return `${baseUrl}/${signature}?cluster=${cluster}`;
  };

  return (
    <Button
      variant="link"
      size="sm"
      className="p-0 h-auto text-accent-primary hover:text-accent-primary/80"
      onClick={() => window.open(getExplorerUrl(), "_blank")}
    >
      View on Explorer
      <ExternalLink className="ml-1 h-3 w-3" />
    </Button>
  );
}
