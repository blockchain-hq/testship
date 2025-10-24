import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyIcon, CheckIcon } from "lucide-react";
import UseCopy from "@/hooks/useCopy";

export const DurationPicker = () => {
  const [days, setDays] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [totalSeconds, setTotalSeconds] = useState<string>("");
  const { copied, handleCopy } = UseCopy();

  useEffect(() => {
    const d = parseInt(days || "0", 10);
    const h = parseInt(hours || "0", 10);
    const m = parseInt(minutes || "0", 10);
    const s = parseInt(seconds || "0", 10);

    const total = d * 86400 + h * 3600 + m * 60 + s;
    setTotalSeconds(total.toString());
  }, [days, hours, minutes, seconds]);

  const handleSetCommonDuration = (value: {
    d?: number;
    h?: number;
    m?: number;
    s?: number;
  }) => {
    setDays(value.d?.toString() || "0");
    setHours(value.h?.toString() || "0");
    setMinutes(value.m?.toString() || "0");
    setSeconds(value.s?.toString() || "0");
  };

  const handleClear = () => {
    setDays("");
    setHours("");
    setMinutes("");
    setSeconds("");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="days">Days</Label>
          <Input
            id="days"
            type="number"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            placeholder="0"
            min="0"
            className="focus-visible:ring-[#00bf63]/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hours">Hours</Label>
          <Input
            id="hours"
            type="number"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="0"
            min="0"
            max="23"
            className="focus-visible:ring-[#00bf63]/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minutes">Minutes</Label>
          <Input
            id="minutes"
            type="number"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            placeholder="0"
            min="0"
            max="59"
            className="focus-visible:ring-[#00bf63]/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seconds-input">Seconds</Label>
          <Input
            id="seconds-input"
            type="number"
            value={seconds}
            onChange={(e) => setSeconds(e.target.value)}
            placeholder="0"
            min="0"
            max="59"
            className="focus-visible:ring-[#00bf63]/50"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="flex-1 hover:bg-[#00bf63]/10 hover:border-[#00bf63]/50"
        >
          Clear
        </Button>
      </div>

      <div className="pt-4 border-t space-y-2">
        <Label htmlFor="total-seconds" className="text-muted-foreground">
          Total Duration (seconds) - i64
        </Label>
        <div className="flex gap-2">
          <Input
            id="total-seconds"
            value={totalSeconds}
            readOnly
            className="font-mono bg-muted"
          />
          <Button
            size="icon"
            variant="outline"
            onClick={() => handleCopy(totalSeconds)}
            className="hover:bg-[#00bf63]/10 hover:border-[#00bf63]"
          >
            {copied ? (
              <CheckIcon className="size-4 text-[#00bf63]" />
            ) : (
              <CopyIcon className="size-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Use this for time-based program arguments (locks, vesting, etc.)
        </p>
      </div>

      <div className="bg-muted/50 p-3 rounded-md space-y-2">
        <p className="text-xs font-medium">Quick Presets:</p>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSetCommonDuration({ h: 1 })}
            className="text-xs hover:bg-[#00bf63]/10"
          >
            1 Hour
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSetCommonDuration({ d: 1 })}
            className="text-xs hover:bg-[#00bf63]/10"
          >
            1 Day
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSetCommonDuration({ d: 7 })}
            className="text-xs hover:bg-[#00bf63]/10"
          >
            1 Week
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSetCommonDuration({ d: 30 })}
            className="text-xs hover:bg-[#00bf63]/10"
          >
            30 Days
          </Button>
        </div>
      </div>

      <div className="bg-muted/50 p-3 rounded-md text-xs space-y-1">
        <p className="font-medium">Common Conversions:</p>
        <p>• 1 minute = 60 seconds</p>
        <p>• 1 hour = 3,600 seconds</p>
        <p>• 1 day = 86,400 seconds</p>
        <p>• 1 week = 604,800 seconds</p>
      </div>
    </div>
  );
};
