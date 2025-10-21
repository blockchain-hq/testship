"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

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

  useHotkeys("enter", () => {
    // open the search popover
    setOpen(true);
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="bg-level-4-bg">
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="flex-1 justify-between cursor-pointer"
        >
          {selectedInstructionName
            ? instructionNames.find(
                (instructionName) => instructionName === selectedInstructionName
              )
            : "Select instruction..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput
            placeholder="Search or select an instruction..."
            className="h-9"
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
                  className="cursor-pointer"
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
