import { useState } from "react";
import { useActiveProgram } from "@/store/use-workspace";
import { useInstructionStore } from "@/store/use-instruction";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { MagnifyingGlassIcon, CaretUpDownIcon, CheckIcon } from "@phosphor-icons/react";
import { useHotkeys } from "react-hotkeys-hook";
import { cn } from "@/lib/utils";

export const InstructionSearch = () => {
  const [open, setOpen] = useState(false);
  const program = useActiveProgram();
  const { selected, select } = useInstructionStore();

  const instructions = program?.programNode.instructions ?? [];
  const instructionNames = instructions.map((ix) => ix.name);

  useHotkeys(
    "ctrl+k,meta+k",
    (e) => {
      e.preventDefault();
      setOpen(true);
    },
    { enableOnFormTags: ["INPUT", "TEXTAREA", "SELECT"] }
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between border-0 border-b rounded-none shadow-none h-10"
        >
          <div className="flex items-center gap-2">
            <MagnifyingGlassIcon className="size-4" />
            <span className={selected ? "text-foreground" : "text-muted-foreground"}>
              {selected || "Select instruction..."}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium opacity-100 hidden sm:inline-flex">
              CTRL + K
            </kbd>
            <CaretUpDownIcon className="size-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search instructions..." />
          <CommandList>
            <CommandEmpty>No instruction found.</CommandEmpty>
            <CommandGroup>
              {instructionNames.map((name) => (
                <CommandItem
                  key={name}
                  value={name}
                  onSelect={(v) => {
                    select(v);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <span className={cn("font-mono text-xs", selected === name && "font-semibold")}>
                    {name}
                  </span>
                  <CheckIcon
                    className={cn("ml-auto size-4", selected === name ? "opacity-100" : "opacity-0")}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
