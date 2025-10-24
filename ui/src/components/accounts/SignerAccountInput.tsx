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
  signerAccountAddress: string | null;
  signerAccountKeypair: Keypair | null;
  onChange: (address: string | null, keypair: Keypair | null) => void;
}

const SignerAccountInput = (props: SignerAccountInputProps) => {
  const { account, onChange, signerAccountAddress, signerAccountKeypair } =
    props;
  const { publicKey } = useWallet();
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
      onChange(publicKey?.toBase58() ?? null, null);
    } else if (selectedMode === "Generate New") {
      const newKeyPair = Keypair.generate();
      onChange(newKeyPair.publicKey.toBase58(), newKeyPair);
    }
    // using onChange as dependency causes infinite re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      <div className="flex flex-row items-center gap-2 bg-transparent border border-input rounded-md px-3 h-9 focus-within:outline-none focus-within:ring-1 focus-within:ring-ring transition-colors">
        {selectedMode === "Manual Input" ? (
          <Tooltip delayDuration={100}>
            <TooltipTrigger>
              <TriangleAlert color="yellow" className="w-4 h-4 flex-shrink-0" />
            </TooltipTrigger>
            <TooltipContent className="bg-accent w-64">
              <span className="text-yellow-500 text-xs ">
                Since private key is required for signing transaction, just
                pubkey doesn't work.
              </span>
            </TooltipContent>
          </Tooltip>
        ) : selectedMode === "Connected Wallet" && signerAccountAddress ? (
          <CheckCircle2 color="green" className="w-4 h-4 flex-shrink-0" />
        ) : selectedMode === "Generate New" && signerAccountKeypair ? (
          <CheckCircle2 color="green" className="w-4 h-4 flex-shrink-0" />
        ) : null}

        <Input
          id="signerAccount"
          type="text"
          placeholder="Enter value for signer account"
          className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-auto"
          value={signerAccountAddress ?? ""}
          onChange={(e) => onChange(e.target.value, null)}
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

export default SignerAccountInput;
