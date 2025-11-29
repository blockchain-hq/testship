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
import { Kbd } from "../ui/kbd";
import { useHotkeys } from "react-hotkeys-hook";
import { useState } from "react";

export function SettingsDropdown() {
  const { clearFormHistory, isClearing } = useClearFormHistory();
  const [open, setOpen] = useState(false);

  useHotkeys(
    "ctrl+d",
    () => {
      clearFormHistory();
    },
    {
      enableOnFormTags: ["INPUT", "TEXTAREA", "SELECT"],
    }
  );

  useHotkeys(
    "ctrl+s",
    () => {
      setOpen(!open);
    },
    {
      enableOnFormTags: ["INPUT", "TEXTAREA", "SELECT"],
    }
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button className="h-10 w-10" size="icon-sm" variant="ghost">
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 border border-border" align="start">
        <DropdownMenuLabel className="flex items-center justify-between gap-2">
          Settings <Kbd className="text-xs bg-primary/10">CTRL + S</Kbd>
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={clearFormHistory}
            disabled={isClearing}
            className="font-normal text-muted-foreground flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              {isClearing ? (
                <Loader2 className="size-4" />
              ) : (
                <Trash2Icon className="size-4" />
              )}
              {isClearing ? "Clearing..." : "Clear Forms"}
            </div>

            <Kbd className="text-xs bg-primary/10">CTRL + D</Kbd>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
