import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyIcon, CheckIcon, ArrowRightLeftIcon } from "lucide-react";
import UseCopy from "@/hooks/useCopy";

const SOL_DECIMALS = 9;

export const LamportsConverter = () => {
  const [solAmount, setSolAmount] = useState("");
  const [lamports, setLamports] = useState<string>("");
  const [decimals, setDecimals] = useState(SOL_DECIMALS.toString());
  const { copied, handleCopy } = UseCopy();

  useEffect(() => {
    if (solAmount && decimals) {
      const decimalPlaces = parseInt(decimals, 10);
      if (!isNaN(decimalPlaces)) {
        const multiplier = Math.pow(10, decimalPlaces);
        const lamportValue = Math.floor(parseFloat(solAmount) * multiplier);
        setLamports(lamportValue.toString());
      }
    } else {
      setLamports("");
    }
  }, [solAmount, decimals]);

  const handleReverse = () => {
    if (lamports && decimals) {
      const decimalPlaces = parseInt(decimals, 10);
      if (!isNaN(decimalPlaces)) {
        const divisor = Math.pow(10, decimalPlaces);
        const solValue = parseInt(lamports, 10) / divisor;
        setSolAmount(solValue.toString());
      }
    }
  };

  return (
    <div className="space-y-4 text-foreground">
      <div className="space-y-2">
        <Label htmlFor="decimals">Token Decimals</Label>
        <Input
          id="decimals"
          type="number"
          value={decimals}
          onChange={(e) => setDecimals(e.target.value)}
          placeholder="9"
          min="0"
          max="18"
        />
        <p className="text-xs text-muted-foreground">
          Default is 9 for SOL. Most SPL tokens use 6 or 9.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sol-amount">Token Amount</Label>
        <Input
          id="sol-amount"
          type="number"
          value={solAmount}
          onChange={(e) => setSolAmount(e.target.value)}
          placeholder="1.5"
          step="any"
        />
        <p className="text-xs text-muted-foreground">
          Enter the amount in human-readable format (e.g., 1.5 SOL)
        </p>
      </div>

      <div className="pt-4 border-t space-y-2">
        <Label htmlFor="lamports" className="text-muted-foreground">
          Lamports / Base Units (u64)
        </Label>
        <div className="flex gap-2">
          <Input
            id="lamports"
            value={lamports}
            onChange={(e) => setLamports(e.target.value)}
            placeholder="1500000000"
            className="font-mono bg-muted"
          />
          <Button
            size="icon"
            variant="outline"
            onClick={() => handleCopy(lamports)}
            className="hover:bg-[#00bf63]/10 hover:border-[#00bf63]"
            disabled={!lamports}
          >
            {copied ? (
              <CheckIcon className="size-4 text-[#00bf63]" />
            ) : (
              <CopyIcon className="size-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Use this value for program instructions
        </p>
      </div>

      <Button
        variant="outline"
        onClick={handleReverse}
        className="w-full hover:bg-[#00bf63]/10 hover:border-[#00bf63]/50"
        disabled={!lamports}
      >
        <ArrowRightLeftIcon className="size-4 mr-2" />
        Convert Lamports to Token Amount
      </Button>

      <div className="bg-muted/50 p-3 rounded-md text-xs space-y-1">
        <p className="font-medium">Common Examples:</p>
        <p>• 1 SOL = 1,000,000,000 lamports</p>
        <p>• 0.5 SOL = 500,000,000 lamports</p>
        <p>• 1 USDC (6 decimals) = 1,000,000 base units</p>
      </div>
    </div>
  );
};
