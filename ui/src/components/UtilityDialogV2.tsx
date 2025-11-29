import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  ScrollArea,
} from "./ui";
import {
  CalendarIcon,
  BinaryIcon,
  ClockIcon,
  CoinsIcon,
  DatabaseIcon,
  KeyIcon,
  WrenchIcon,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ProgramAccountsViewer } from "./utilityTools/ProgramAccountsViewer";
import { SPLTokenManager } from "./utilityTools/SPLTokenManager";
import { KeypairManager } from "./utilityTools/KeypairManager";
import { TimestampConverter } from "./utilityTools/TimestampConverter";
import { StringEncoder } from "./utilityTools/StringEncoder";
import { LamportsConverter } from "./utilityTools/LamportsConverter";
import { DurationPicker } from "./utilityTools/DurationPicker";

export const UtilityDialogV2 = () => {
  const [open, setOpen] = useState(false);

  useHotkeys(
    "ctrl+t",
    () => {
      setOpen(true);
    },
    {
      enableOnFormTags: ["INPUT", "TEXTAREA", "SELECT"],
    }
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          id="utility-dialog-trigger"
          className="h-10 border-border"
        >
          <WrenchIcon className="size-4" />
          Tools
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[900px] max-h-[85vh] flex flex-col border border-border/50 text-foreground bg-card transition-all duration-300 ease-in-out">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <WrenchIcon className="size-5 text-foreground" />
            Utility Tools
          </DialogTitle>
          <DialogDescription>
            Helpful tools for working with Solana programs
          </DialogDescription>
        </DialogHeader>

        <div className="w-full flex-1 min-h-0 overflow-hidden">
          <Tabs
            defaultValue="accounts"
            orientation="vertical"
            className="w-full h-full flex flex-row gap-4"
          >
            <TabsList className="h-auto max-h-full w-[200px] flex-shrink-0 flex flex-col items-stretch justify-start gap-1 p-2 overflow-y-auto">
              <TabsTrigger value="accounts" className="w-full justify-start">
                <DatabaseIcon className="size-4 mr-2" />
                Accounts
              </TabsTrigger>

              <TabsTrigger value="spl-token" className="w-full justify-start">
                <CoinsIcon className="size-4 mr-2" />
                SPL Token
              </TabsTrigger>

              <TabsTrigger value="keypair" className="w-full justify-start">
                <KeyIcon className="size-4 mr-2" />
                Keypair
              </TabsTrigger>

              <TabsTrigger value="timestamp" className="w-full justify-start">
                <CalendarIcon className="size-4 mr-2" />
                Timestamp
              </TabsTrigger>

              <TabsTrigger value="lamports" className="w-full justify-start">
                <CoinsIcon className="size-4 mr-2" />
                Lamports
              </TabsTrigger>

              <TabsTrigger value="string" className="w-full justify-start">
                <BinaryIcon className="size-4 mr-2" />
                String
              </TabsTrigger>

              <TabsTrigger value="duration" className="w-full justify-start">
                <ClockIcon className="size-4 mr-2" />
                Duration
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="accounts"
              className="overflow-y-auto h-[calc(100vh-100px)]"
            >
              <ProgramAccountsViewer />
            </TabsContent>

            <TabsContent
              value="spl-token"
              className="flex-1 m-0 overflow-y-auto pr-2 data-[state=inactive]:hidden"
            >
              <SPLTokenManager />
            </TabsContent>

            <TabsContent
              value="keypair"
              className="flex-1 m-0 overflow-y-auto pr-2 data-[state=inactive]:hidden"
            >
              <KeypairManager />
            </TabsContent>

            <TabsContent
              value="timestamp"
              className="flex-1 m-0 overflow-y-auto pr-2 data-[state=inactive]:hidden"
            >
              <TimestampConverter />
            </TabsContent>

            <TabsContent
              value="lamports"
              className="flex-1 m-0 overflow-y-auto pr-2 data-[state=inactive]:hidden"
            >
              <LamportsConverter />
            </TabsContent>

            <TabsContent
              value="string"
              className="flex-1 m-0 overflow-y-auto pr-2 data-[state=inactive]:hidden"
            >
              <StringEncoder />
            </TabsContent>

            <TabsContent
              value="duration"
              className="flex-1 m-0 overflow-y-auto pr-2 data-[state=inactive]:hidden"
            >
              <DurationPicker />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
