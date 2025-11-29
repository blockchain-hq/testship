import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, SettingsIcon, Trash2Icon } from "lucide-react";
import { useClearFormHistory } from "@/hooks/useClearFromHistory";

export function SettingsDropdown() {
  const { clearFormHistory, isClearing } = useClearFormHistory();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="h-10 w-10" size="icon-sm" variant="ghost">
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 border border-border" align="start">
        <DropdownMenuLabel>Settings</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={clearFormHistory}
            disabled={isClearing}
            className="font-normal text-muted-foreground"
          >
            {isClearing ? (
              <Loader2 className="size-4" />
            ) : (
              <Trash2Icon className="size-4" />
            )}
            {isClearing ? "Clearing..." : "Clear Forms"}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
