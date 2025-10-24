import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CopyIcon, CheckIcon, ArrowRightLeftIcon } from "lucide-react";
import UseCopy from "@/hooks/useCopy";

export const StringEncoder = () => {
  const [stringValue, setStringValue] = useState("");
  const [bytesValue, setBytesValue] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const { copied: copiedBytes, handleCopy: handleCopyBytes } = UseCopy();
  const { copied: copiedString, handleCopy: handleCopyString } = UseCopy();

  const encodeString = () => {
    try {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(stringValue);
      const byteArray = Array.from(bytes);
      setBytesValue(JSON.stringify(byteArray));
    } catch (error) {
      setBytesValue("Error encoding string");
    }
  };

  const decodeBytes = () => {
    try {
      const byteArray = JSON.parse(bytesValue);
      if (!Array.isArray(byteArray)) {
        setStringValue("Error: Input must be a JSON array");
        return;
      }
      const decoder = new TextDecoder();
      const uint8Array = new Uint8Array(byteArray);
      const decoded = decoder.decode(uint8Array);
      setStringValue(decoded);
    } catch (error) {
      setStringValue("Error decoding bytes");
    }
  };

  const switchMode = () => {
    setMode(mode === "encode" ? "decode" : "encode");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base">
          {mode === "encode" ? "String to Bytes" : "Bytes to String"}
        </Label>
        <Button
          variant="outline"
          size="sm"
          onClick={switchMode}
          className="hover:bg-[#00bf63]/10 hover:border-[#00bf63]/50"
        >
          <ArrowRightLeftIcon className="size-4 mr-2" />
          Switch Mode
        </Button>
      </div>

      {mode === "encode" ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="string-input">String Input</Label>
            <Textarea
              id="string-input"
              value={stringValue}
              onChange={(e) => setStringValue(e.target.value)}
              placeholder='Enter string (e.g., "my-seed")'
              className="font-mono focus-visible:ring-[#00bf63]/50 min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">
              UTF-8 encoded string for PDA seeds
            </p>
          </div>

          <Button
            variant="default"
            onClick={encodeString}
            className="w-full bg-[#00bf63] hover:bg-[#00bf63]/90 text-white"
            disabled={!stringValue}
          >
            Encode to Bytes
          </Button>

          <div className="space-y-2">
            <Label htmlFor="bytes-output" className="text-muted-foreground">
              Byte Array Output
            </Label>
            <div className="flex gap-2">
              <Textarea
                id="bytes-output"
                value={bytesValue}
                readOnly
                className="font-mono bg-muted min-h-[80px]"
                placeholder="[109, 121, 45, 115, 101, 101, 100]"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => handleCopyBytes(bytesValue)}
                className="hover:bg-[#00bf63]/10 hover:border-[#00bf63] self-start"
                disabled={!bytesValue}
              >
                {copiedBytes ? (
                  <CheckIcon className="size-4 text-[#00bf63]" />
                ) : (
                  <CopyIcon className="size-4" />
                )}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="bytes-input">Byte Array Input</Label>
            <Textarea
              id="bytes-input"
              value={bytesValue}
              onChange={(e) => setBytesValue(e.target.value)}
              placeholder="[109, 121, 45, 115, 101, 101, 100]"
              className="font-mono focus-visible:ring-[#00bf63]/50 min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">
              Enter byte array as JSON (e.g., [109, 121, 45, 115, 101, 101,
              100])
            </p>
          </div>

          <Button
            variant="default"
            onClick={decodeBytes}
            className="w-full bg-[#00bf63] hover:bg-[#00bf63]/90 text-white"
            disabled={!bytesValue}
          >
            Decode to String
          </Button>

          <div className="space-y-2">
            <Label htmlFor="string-output" className="text-muted-foreground">
              String Output
            </Label>
            <div className="flex gap-2">
              <Input
                id="string-output"
                value={stringValue}
                readOnly
                className="font-mono bg-muted"
                placeholder="my-seed"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => handleCopyString(stringValue)}
                className="hover:bg-[#00bf63]/10 hover:border-[#00bf63]"
                disabled={!stringValue}
              >
                {copiedString ? (
                  <CheckIcon className="size-4 text-[#00bf63]" />
                ) : (
                  <CopyIcon className="size-4" />
                )}
              </Button>
            </div>
          </div>
        </>
      )}

      <div className="bg-muted/50 p-3 rounded-md text-xs space-y-1">
        <p className="font-medium">PDA Seed Examples:</p>
        <p>• "metadata" → [109, 101, 116, 97, 100, 97, 116, 97]</p>
        <p>• "vault" → [118, 97, 117, 108, 116]</p>
        <p className="text-muted-foreground mt-2">
          Use byte arrays for findProgramAddress seeds
        </p>
      </div>
    </div>
  );
};
