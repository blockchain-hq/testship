"use client";

import * as React from "react";
import { Check, ChevronsUpDown, SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useHotkeys } from "react-hotkeys-hook";
import { Kbd } from "../ui/kbd";

interface SearchProps {
  instructionNames: string[];
  selectedInstructionName: string;
  setSelectedInstructionName: (instructionName: string) => void;
}

const Search = (props: SearchProps) => {
  const {
    instructionNames,
    selectedInstructionName,
    setSelectedInstructionName,
  } = props;
  const [open, setOpen] = React.useState(false);

  const isActiveInstruction = (instructionName: string) => {
    return instructionName === selectedInstructionName;
  };

  useHotkeys(
    "ctrl+k",
    () => {
      setOpen(true);
    },
    {
      enableOnFormTags: ["INPUT", "TEXTAREA", "SELECT"],
    }
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="flex-1 w-full justify-between cursor-pointer border-0 border-b-2 border-border h-10 rounded-none shadow-none"
        >
          <span className="flex items-center gap-2 group">
            <SearchIcon className="size-4" />
            {selectedInstructionName
              ? instructionNames.find(
                  (instructionName) =>
                    instructionName === selectedInstructionName
                )
              : "Select instruction..."}
            <Kbd className="text-xs  group-hover:bg-transparent">CTRL + K</Kbd>
          </span>

          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border border-border">
        <Command>
          <CommandInput
            placeholder="Search or select an instruction..."
            className="!bg-transparent"
          />
          <CommandList>
            <CommandEmpty>No instruction found.</CommandEmpty>
            <CommandGroup>
              {instructionNames.map((instructionName) => (
                <CommandItem
                  key={instructionName}
                  value={instructionName}
                  onSelect={(currentValue) => {
                    setSelectedInstructionName(currentValue);
                    setOpen(false);
                  }}
                  className={cn(
                    "cursor-pointer font-normal",
                    isActiveInstruction(instructionName) ? "font-semibold" : ""
                  )}
                >
                  {instructionName}
                  <Check
                    className={cn(
                      "ml-auto",
                      selectedInstructionName === instructionName
                        ? "opacity-100"
                        : "opacity-0"
                    )}
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

export default Search;
