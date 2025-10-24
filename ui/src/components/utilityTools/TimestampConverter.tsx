import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyIcon, CheckIcon } from "lucide-react";
import UseCopy from "@/hooks/useCopy";

export const TimestampConverter = () => {
  const [dateValue, setDateValue] = useState("");
  const [timeValue, setTimeValue] = useState("");
  const [timestampSeconds, setTimestampSeconds] = useState<string>("");
  const [timestampMillis, setTimestampMillis] = useState<string>("");
  const { copied: copiedSeconds, handleCopy: handleCopySeconds } = UseCopy();
  const { copied: copiedMillis, handleCopy: handleCopyMillis } = UseCopy();

  useEffect(() => {
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const timeStr = now.toTimeString().slice(0, 5);
    setDateValue(dateStr);
    setTimeValue(timeStr);
  }, []);

  useEffect(() => {
    if (dateValue && timeValue) {
      const dateTimeStr = `${dateValue}T${timeValue}`;
      const timestamp = new Date(dateTimeStr).getTime();
      setTimestampSeconds(Math.floor(timestamp / 1000).toString());
      setTimestampMillis(timestamp.toString());
    }
  }, [dateValue, timeValue]);

  const handleSetNow = () => {
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const timeStr = now.toTimeString().slice(0, 5);
    setDateValue(dateStr);
    setTimeValue(timeStr);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            className="focus-visible:ring-[#00bf63]/50"
          />
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="time">Time</Label>
          <Input
            id="time"
            type="time"
            value={timeValue}
            onChange={(e) => setTimeValue(e.target.value)}
            className="focus-visible:ring-[#00bf63]/50"
          />
        </div>
      </div>

      <Button
        variant="outline"
        onClick={handleSetNow}
        className="w-full hover:bg-[#00bf63]/10 hover:border-[#00bf63]/50"
      >
        Set to Current Time
      </Button>

      <div className="pt-4 border-t space-y-4">
        <div className="space-y-2">
          <Label htmlFor="seconds" className="text-muted-foreground">
            Unix Timestamp (seconds) - i64
          </Label>
          <div className="flex gap-2">
            <Input
              id="seconds"
              value={timestampSeconds}
              readOnly
              className="font-mono bg-muted"
            />
            <Button
              size="icon"
              variant="outline"
              onClick={() => handleCopySeconds(timestampSeconds)}
              className="hover:bg-[#00bf63]/10 hover:border-[#00bf63]"
            >
              {copiedSeconds ? (
                <CheckIcon className="size-4 text-[#00bf63]" />
              ) : (
                <CopyIcon className="size-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Use this for most Solana program arguments
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="millis" className="text-muted-foreground">
            Unix Timestamp (milliseconds) - i64
          </Label>
          <div className="flex gap-2">
            <Input
              id="millis"
              value={timestampMillis}
              readOnly
              className="font-mono bg-muted"
            />
            <Button
              size="icon"
              variant="outline"
              onClick={() => handleCopyMillis(timestampMillis)}
              className="hover:bg-[#00bf63]/10 hover:border-[#00bf63]"
            >
              {copiedMillis ? (
                <CheckIcon className="size-4 text-[#00bf63]" />
              ) : (
                <CopyIcon className="size-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            JavaScript/TypeScript standard format
          </p>
        </div>
      </div>
    </div>
  );
};
