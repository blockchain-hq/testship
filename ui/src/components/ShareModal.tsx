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
import { useEffect, useState } from "react";
import BaseUrlInput from "./BaseUrlInput";

const ShareModal = () => {
  const { shareUrl, prepareUrl } = UseShareState();
  const [baseUrl, setBaseUrl] = useState<string>("https://app.testship.xyz");
  const { copied, handleCopy } = UseCopy();

  useEffect(() => {
    prepareUrl(baseUrl);
  }, [baseUrl, prepareUrl]);

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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
