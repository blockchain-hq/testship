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
import { Check, Copy, ExternalLink, Share } from "lucide-react";
import React, { useEffect, useState } from "react";
import BaseUrlInput from "./BaseUrlInput";
import type { IdlInstruction } from "@/lib/types";
import type { Idl } from "@coral-xyz/anchor";
interface ShareModalProps {
  idl: Idl;
  accountMap: Map<string, string | null>;
  instructions: IdlInstruction[];
  formData: Record<string, string | number>;
}
const ShareModal = (props: ShareModalProps) => {
  const { idl, accountMap, instructions, formData } = props;
  const { shareUrl, prepareUrl } = UseShareState();
  const [baseUrl, setBaseUrl] = useState<string>("https://app.testship.xyz");
  const { copied, handleCopy } = UseCopy();

  // Create a unique key for share modal data
  const shareModalKey = 'testship_share_modal';

  // Load share modal data from localStorage on component mount
  React.useEffect(() => {
    console.log('ShareModal mounting');
    try {
      const saved = localStorage.getItem(shareModalKey);
      console.log('Loaded share modal data from localStorage:', saved);
      if (saved) {
        const savedData = JSON.parse(saved);
        if (savedData.lastShareUrl) {
          console.log('Restored last share URL:', savedData.lastShareUrl);
        }
      }
    } catch (error) {
      console.error('Error loading share modal data from localStorage:', error);
    }
  }, []);

  // Save share modal data to localStorage whenever shareUrl changes
  React.useEffect(() => {
    if (shareUrl) {
      const shareData = {
        lastShareUrl: shareUrl,
        timestamp: Date.now(),
        instructionCount: instructions.length
      };
      console.log('Saving share modal data:', shareData, 'to key:', shareModalKey);
      try {
        localStorage.setItem(shareModalKey, JSON.stringify(shareData));
        console.log('Share modal data saved successfully');
      } catch (error) {
        console.warn("Failed to save share modal data to localStorage:", error);
      }
    }
  }, [shareUrl, instructions.length]);

  // Function to clear saved share modal data
  const clearShareModalData = () => {
    try {
      localStorage.removeItem(shareModalKey);
      console.log('Cleared share modal data from localStorage');
    } catch (error) {
      console.warn("Failed to clear share modal data from localStorage:", error);
    }
  };

  useEffect(() => {
    prepareUrl(baseUrl);
  }, [baseUrl, prepareUrl, idl, accountMap, instructions, formData]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Share />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share</DialogTitle>
          <DialogDescription>
            Share this instruction with anyone
          </DialogDescription>
        </DialogHeader>

        {/* <ScrollArea className="h-[50vh] rounded-md overflow-hidden">
          <div className="flex flex-col">
            <div className="summary">
              <p className="text-sm text-gray-600">This URL contains:</p>
              <ul className="space-y-1 mt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{instructionsCount} instructions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{uniqueAccountsWithAddressesCount} accounts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{allFormValuesCount} form values</span>
                </li>
              </ul>
            </div>
          </div>
        </ScrollArea> */}

        <BaseUrlInput baseUrl={baseUrl} onChange={setBaseUrl} />

        <div className="flex flex-col items-center gap-2 mt-8 w-full px-2">
          {shareUrl && (
            <div className="flex items-center gap-2 w-full px-2">
              <p className="text-xs bg-muted-foreground/20 px-2 py-1 rounded flex-1 overflow-hidden text-ellipsis">
                {shareUrl
                  ? `${shareUrl.slice(0, 30)}...${shareUrl.slice(-12)}`
                  : ""}
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

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 flex-shrink-0"
              >
                <a
                  href={`${shareUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            type="button" 
            variant="outline" 
            onClick={clearShareModalData}
            className="mr-2"
          >
            Clear History
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
