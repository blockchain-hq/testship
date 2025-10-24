import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Keypair } from "@solana/web3.js";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  InfoIcon,
  NotebookPenIcon,
  PenLineIcon,
  PlusIcon,
  TriangleAlert,
  WalletIcon,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { cn } from "@/lib/utils";
import type { ModIdlAccount } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Badge } from "../ui";

type OptionType = "Connected Wallet" | "Generate New" | "Manual Input";
const options: OptionType[] = [
  "Connected Wallet",
  "Generate New",
  "Manual Input",
];

interface SignerAccountInputProps {
  account: ModIdlAccount | null;
}

const SignerAccountInput = (props: SignerAccountInputProps) => {
  const { account } = props;
  const { publicKey } = useWallet();
  const [signerAccount, setSignerAccount] = useState<string>("");
  const [selectedMode, setSelectedMode] =
    useState<OptionType>("Connected Wallet");
  const [open, setOpen] = useState(false);

  const getIconForMode = (mode: OptionType) => {
    switch (mode) {
      case "Connected Wallet": {
        return (
          <>
            <TooltipTrigger>
              <WalletIcon />
            </TooltipTrigger>
            <TooltipContent className="bg-accent text-white">
              <p className="w-64">
                Use the connected wallet as the signer account.
              </p>
            </TooltipContent>
          </>
        );
      }
      case "Generate New": {
        return (
          <>
            <TooltipTrigger>
              <PlusIcon />
            </TooltipTrigger>
            <TooltipContent className="bg-accent text-white">
              <p className="w-64">
                Generate a new keypair as the signer account.
              </p>
            </TooltipContent>
          </>
        );
      }
      case "Manual Input": {
        return (
          <>
            <TooltipTrigger>
              <NotebookPenIcon />
            </TooltipTrigger>
            <TooltipContent className="bg-accent text-white">
              <p className="w-64">
                Manually input the public key as the signer account.{" "}
                <span className="text-xs text-yellow-500">
                  Doesn't work since Private Key is needed to sign the
                  transaction.
                </span>
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
    if (selectedMode === "Connected Wallet") {
      setSignerAccount(publicKey?.toString() ?? "");
    } else if (selectedMode === "Generate New") {
      const newKeyPair = Keypair.generate();
      setSignerAccount(newKeyPair.publicKey.toString());
    }
  }, [selectedMode, publicKey]);

  return (
    <div className="grid w-full items-center gap-3">
      <div className="flex flex-row items-center gap-2 w-full">
        <Label
          htmlFor="signerAccount"
          className="text-sm font-medium text-foreground text-left"
        >
          {account?.name}
        </Label>
        <Tooltip delayDuration={100}>
          <TooltipTrigger>
            <InfoIcon className="w-4 h-4" />
          </TooltipTrigger>
          <TooltipContent className="bg-accent text-white">
            <p className="w-64">
              This is a signer account. In most cases, it's the wallet connected
              to the app. You can use the dropdown for more options.
            </p>
          </TooltipContent>
        </Tooltip>

        <Badge
          variant="outline"
          className="self-end ml-auto text-xs gap-2 text-black bg-yellow-300/50 "
        >
          <PenLineIcon className="w-4 h-4" />
          Signer
        </Badge>
      </div>

      <div className="flex flex-row items-center gap-2 bg-card border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:bg-card focus:border-border/50 focus:ring-2 focus:ring-green-500/20 transition-all h-11 rounded-md px-2">
        {selectedMode === "Manual Input" ? (
          <Tooltip delayDuration={100}>
            <TooltipTrigger>
              <TriangleAlert color="yellow" />
            </TooltipTrigger>
            <TooltipContent className="bg-accent w-64">
              <span className="text-yellow-500 text-xs ">
                Since private key is required for signing transaction, just
                pubkey doesn't work.
              </span>
            </TooltipContent>
          </Tooltip>
        ) : selectedMode === "Connected Wallet" && signerAccount ? (
          <CheckCircle2 color="green" className="w-8 h-8" />
        ) : selectedMode === "Generate New" && signerAccount ? (
          <CheckCircle2 color="green" className="w-8 h-8" />
        ) : null}

        <Input
          id="signerAccount"
          type="text"
          placeholder="Enter value for signer account"
          className="border-none"
          value={signerAccount}
          onChange={(e) => setSignerAccount(e.target.value)}
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
          <PopoverContent className="w-[200px] p-0">
            <Command>
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

export default SignerAccountInput;
