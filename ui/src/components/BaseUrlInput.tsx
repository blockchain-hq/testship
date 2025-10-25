import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Check,
  ChevronDown,
  ComputerIcon,
  GlobeIcon,
  PencilIcon,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type OptionType = "Local" | "Testship" | "Custom";
const options: OptionType[] = ["Local", "Testship", "Custom"];

interface BaseUrlInputProps {
  baseUrl: string;
  onChange: (baseUrl: string) => void;
}

const BaseUrlInput = (props: BaseUrlInputProps) => {
  const { baseUrl, onChange } = props;
  const [selectedMode, setSelectedMode] = useState<OptionType>(
    baseUrl ? "Custom" : "Testship"
  );
  const [open, setOpen] = useState(false);

  const getIconForMode = (mode: OptionType) => {
    switch (mode) {
      case "Testship": {
        return (
          <>
            <TooltipTrigger>
              <GlobeIcon />
            </TooltipTrigger>
            <TooltipContent>
              <p className="w-64">Get URL for opening in Testship's app.</p>
            </TooltipContent>
          </>
        );
      }
      case "Local": {
        return (
          <>
            <TooltipTrigger>
              <ComputerIcon />
            </TooltipTrigger>
            <TooltipContent>
              <p className="w-64">
                Use local development environment as the base URL.
              </p>
            </TooltipContent>
          </>
        );
      }
      case "Custom": {
        return (
          <>
            <TooltipTrigger>
              <PencilIcon />
            </TooltipTrigger>
            <TooltipContent>
              <p className="w-64">
                Enter the custom base URL. Useful for self-hosted instances of
                Testship.
              </p>
            </TooltipContent>
          </>
        );
      }
      default: {
        return null;
      }
    }
  };

  useEffect(() => {
    if (selectedMode === "Testship") {
      onChange("https://app.testship.xyz");
    } else if (selectedMode === "Local") {
      onChange("http://localhost:3000");
    }
    // using onChange as dependency causes infinite re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMode]);

  return (
    <div className="grid w-full items-center gap-3">
      <div className="flex flex-row items-center gap-2 w-full">
        <Label
          htmlFor="baseUrl"
          className="text-sm font-medium text-foreground text-left"
        >
          Base URL (Use Custom if you're hosting your own instance of Testship)
        </Label>
      </div>

      <div className="flex flex-row items-center gap-2 bg-transparent border border-input rounded-md px-3 h-9 focus-within:outline-none focus-within:ring-1 focus-within:ring-ring transition-colors">
        <Input
          id="baseUrl"
          type="text"
          placeholder="Enter value for base URL"
          className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-auto"
          value={baseUrl ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              role="combobox"
              aria-expanded={open}
              className="w-[200px] justify-between border-none bg-transparent hover:bg-transparent"
            >
              {selectedMode
                ? options.find((mode) => mode === selectedMode)
                : "Select mode..."}
              <ChevronDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0 border border-border/50 rounded-md">
            <Command className="bg-card ">
              <CommandInput placeholder="Search mode..." className="h-9" />
              <CommandList>
                <CommandEmpty>No mode found.</CommandEmpty>
                <CommandGroup>
                  {options.map((mode) => (
                    <CommandItem
                      key={mode}
                      value={mode}
                      onSelect={(currentValue) => {
                        setSelectedMode(currentValue as OptionType);
                        setOpen(false);
                      }}
                    >
                      <Tooltip delayDuration={100}>
                        {getIconForMode(mode)}
                      </Tooltip>

                      {mode}
                      <Check
                        className={cn(
                          "ml-auto",
                          selectedMode === mode ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default BaseUrlInput;
