import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import UseCopy from "@/hooks/useCopy";
import UseShareState from "@/hooks/useShareState";
import type { IdlInstruction } from "@/lib/types";
import type { Idl } from "@coral-xyz/anchor";
import { Check, Copy, Share } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "./ui";
import { toCamelCase } from "@/lib/utils";

interface ShareModalProps {
  idl: Idl;
  accountMap: Map<string, string | null>;
  instructions: IdlInstruction[];
  formData: Record<string, string | number>;
}

const ShareModal = (props: ShareModalProps) => {
  const { idl, accountMap, instructions, formData } = props;
  const { shareUrl, prepareUrl } = UseShareState();
  const { copied, handleCopy } = UseCopy();

  useState(() => {
    prepareUrl(idl, accountMap, instructions, formData);
  });

  const truncatedUrl = shareUrl
    ? `${shareUrl.slice(0, 30)}...${shareUrl.slice(-12)}`
    : "";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Share />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share</DialogTitle>
          <DialogDescription>
            Share this instruction with anyone
          </DialogDescription>
        </DialogHeader>

        <ScrollArea>
          <div className="flex flex-col">
            <div>
              {instructions.map((instruction) => (
                <div className="flex flex-col justify-center items-start gap-1 border">
                  <p>
                    <span className="text-muted-foreground">
                      Instruction Name:{" "}
                    </span>
                    {instruction.name}
                  </p>

                  {instruction.args.length > 0 && (
                    <div className="flex flex-col justify-center items-start gap-1">
                      <h4>Arguments</h4>
                      {instruction.args.map((arg) => (
                        <p>
                          <span className="text-muted-foreground">
                            {arg.name}:{" "}
                          </span>
                          {formData[arg.name]}
                        </p>
                      ))}
                    </div>
                  )}

                  {instruction.accounts.length > 0 && (
                    <div className="flex flex-col justify-center items-start gap-1">
                      <h4>Accounts</h4>
                      {instruction.accounts.map((acc) => (
                        <p>
                          <span className="text-muted-foreground">
                            {acc.name}:{" "}
                          </span>
                          {accountMap.get(acc.name) ||
                            accountMap.get(toCamelCase(acc.name))}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {shareUrl && (
              <div className="flex items-center gap-2 mt-8">
                <p className="text-xs bg-muted-foreground/20 px-2 py-1 rounded flex-1 overflow-hidden text-ellipsis">
                  {truncatedUrl}
                </p>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 flex-shrink-0"
                  onClick={() => handleCopy(shareUrl)}
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
