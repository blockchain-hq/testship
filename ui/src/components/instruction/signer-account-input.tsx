import { useEffect, useState, useCallback } from "react";
import { useConnector } from "@solana/connector";
import { generateKeyPair, getAddressFromPublicKey } from "@solana/kit";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  WalletIcon,
  PlusIcon,
  PencilSimpleIcon,
  CaretDownIcon,
  CheckIcon,
  CheckCircleIcon,
  WarningIcon,
  InfoIcon,
  PenNibIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { InstructionAccountNode } from "@codama/nodes";

type SignerMode = "wallet" | "generate" | "manual";

const modes: { value: SignerMode; label: string }[] = [
  { value: "wallet", label: "Connected Wallet" },
  { value: "generate", label: "Generate New" },
  { value: "manual", label: "Manual Input" },
];

type Props = {
  account: InstructionAccountNode;
  value: string;
  onChange: (address: string, keypair: CryptoKeyPair | null) => void;
};

export const SignerAccountInput = ({ account, value, onChange }: Props) => {
  const { connected, selectedAccount } = useConnector();
  const [mode, setMode] = useState<SignerMode>("wallet");
  const [open, setOpen] = useState(false);
  const [keypair, setKeypair] = useState<CryptoKeyPair | null>(null);

  const applyMode = useCallback(
    async (m: SignerMode) => {
      if (m === "wallet") {
        onChange(selectedAccount ?? "", null);
        setKeypair(null);
      } else if (m === "generate") {
        const kp = await generateKeyPair();
        const addr = await getAddressFromPublicKey(kp.publicKey);
        setKeypair(kp);
        onChange(addr, kp);
      }
      // manual: do nothing, let user type
    },
    [selectedAccount, onChange]
  );

  // Apply mode on mount and when wallet changes
  useEffect(() => {
    if (mode === "wallet") {
      onChange(selectedAccount ?? "", null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccount, mode]);

  const handleModeChange = (m: SignerMode) => {
    setMode(m);
    setOpen(false);
    if (m === "manual") {
      onChange("", null);
      setKeypair(null);
    } else {
      applyMode(m);
    }
  };

  const getModeIcon = (m: SignerMode) => {
    switch (m) {
      case "wallet":
        return <WalletIcon className="size-4" />;
      case "generate":
        return <PlusIcon className="size-4" />;
      case "manual":
        return <PencilSimpleIcon className="size-4" />;
    }
  };

  const getStatusIcon = () => {
    if (mode === "manual") {
      return (
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <WarningIcon className="size-4 text-yellow-500 shrink-0" />
          </TooltipTrigger>
          <TooltipContent className="max-w-[220px]">
            <p className="text-xs">
              Manual mode requires the private key to sign. This won't work
              unless the address matches a connected wallet.
            </p>
          </TooltipContent>
        </Tooltip>
      );
    }
    if (value) {
      return <CheckCircleIcon className="size-4 text-green-500 shrink-0" />;
    }
    if (mode === "wallet" && !connected) {
      return (
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <InfoIcon className="size-4 text-blue-500 shrink-0" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Connect a wallet to auto-fill</p>
          </TooltipContent>
        </Tooltip>
      );
    }
    return null;
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">{account.name}</Label>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <InfoIcon className="size-3.5 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent className="max-w-[220px]">
            <p className="text-xs">
              Signer account. Use the dropdown to choose between connected
              wallet, generating a new keypair, or manual input.
            </p>
          </TooltipContent>
        </Tooltip>
        <div className="ml-auto flex items-center gap-1.5">
          {account.isWritable && (
            <Badge variant="outline" className="text-[9px] px-1 py-0">
              Writable
            </Badge>
          )}
          <Badge
            variant="outline"
            className="text-[9px] gap-1 bg-yellow-300/50 text-yellow-800 border-yellow-500/30"
          >
            <PenNibIcon className="size-3" />
            Signer
          </Badge>
        </div>
      </div>

      <div
        className={cn(
          "flex items-center gap-0 border rounded-md transition-colors",
          "focus-within:ring-1 focus-within:ring-ring",
          mode === "manual" && "border-yellow-500/50",
          mode !== "manual" && value && "border-green-500/30 bg-green-500/5"
        )}
      >
        {getStatusIcon() && (
          <div className="pl-2.5 shrink-0">{getStatusIcon()}</div>
        )}

        <Input
          type="text"
          value={value}
          onChange={(e) => {
            if (mode === "manual") {
              onChange(e.target.value, null);
            }
          }}
          readOnly={mode !== "manual"}
          placeholder={
            mode === "wallet"
              ? connected
                ? "Loading wallet address..."
                : "Connect wallet first"
              : mode === "generate"
                ? "Generating keypair..."
                : "Enter public key manually"
          }
          className="border-none shadow-none focus-visible:ring-0 font-mono text-xs bg-transparent"
        />

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0 gap-1.5 text-xs text-muted-foreground hover:text-foreground mr-1"
            >
              {getModeIcon(mode)}
              <span className="hidden sm:inline">
                {modes.find((m) => m.value === mode)?.label}
              </span>
              <CaretDownIcon className="size-3 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="end">
            <Command>
              <CommandList>
                <CommandEmpty>No option found.</CommandEmpty>
                <CommandGroup>
                  {modes.map((m) => (
                    <CommandItem
                      key={m.value}
                      value={m.value}
                      onSelect={() => handleModeChange(m.value)}
                      className="gap-2"
                    >
                      {getModeIcon(m.value)}
                      {m.label}
                      <CheckIcon
                        className={cn(
                          "ml-auto size-4",
                          mode === m.value ? "opacity-100" : "opacity-0"
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

      {mode === "generate" && keypair && value && (
        <div className="flex items-center gap-1.5 text-xs">
          <CheckCircleIcon className="size-3 text-green-500" />
          <span className="text-green-600">
            New keypair generated — will auto-sign
          </span>
        </div>
      )}
      {mode === "wallet" && !connected && (
        <div className="flex items-center gap-1.5 text-xs">
          <InfoIcon className="size-3 text-blue-500" />
          <span className="text-blue-600">
            No wallet connected. Connect one to auto-fill.
          </span>
        </div>
      )}
    </div>
  );
};
