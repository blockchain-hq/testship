import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  WrenchIcon,
  CalendarIcon,
  CoinsIcon,
  BinaryIcon,
  ClockIcon,
  DatabaseIcon,
  KeyIcon,
  Blocks,
  Calculator,
  Network,
} from "lucide-react";
import { TimestampConverter } from "./utilityTools/TimestampConverter";
import { LamportsConverter } from "./utilityTools/LamportsConverter";
import { StringEncoder } from "./utilityTools/StringEncoder";
import { DurationPicker } from "./utilityTools/DurationPicker";
import { ProgramAccountsViewer } from "./utilityTools/ProgramAccountsViewer";
import { SPLTokenManager } from "./utilityTools/SPLTokenManager";
import { KeypairManager } from "./utilityTools/KeypairManager";
import { AccountRelationshipGraph } from "./utilityTools/AccountRelationshipGraph";

export const UtilityDialog = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" id="utility-dialog-trigger">
          <WrenchIcon className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col border border-border/50 text-foreground bg-card">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <WrenchIcon className="size-5 text-foreground" />
            Utility Tools
          </DialogTitle>
          <DialogDescription>
            Helpful tools for working with Solana programs
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="blockchain"
          className="w-full flex-1 overflow-hidden flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4 flex-shrink-0">
            <TabsTrigger
              value="blockchain"
              className="data-[state=active]:bg-[#00bf63]/10 data-[state=active]:text-[#00bf63]"
            >
              <Blocks className="size-4 mr-2" />
              Blockchain Tools
            </TabsTrigger>
            <TabsTrigger
              value="converters"
              className="data-[state=active]:bg-[#00bf63]/10 data-[state=active]:text-[#00bf63]"
            >
              <Calculator className="size-4 mr-2" />
              Data Converters
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="blockchain"
            className="mt-0 flex-1 overflow-hidden flex flex-col"
          >
            <Tabs
              defaultValue="accounts"
              className="w-full flex-1 overflow-hidden flex flex-col"
            >
              <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
                <TabsTrigger value="accounts">
                  <DatabaseIcon className="size-4 mr-2" />
                  Accounts
                </TabsTrigger>
                <TabsTrigger value="graph" className="relative">
                  <Network className="size-4 mr-2" />
                  Graph
                  <Badge
                    variant="secondary"
                    className="absolute -top-1 -right-1 px-1.5 py-0 text-[10px] h-4 bg-[#00bf63] text-white border-none"
                  >
                    BETA
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="spl-token">
                  <CoinsIcon className="size-4 mr-2" />
                  SPL Token
                </TabsTrigger>
                <TabsTrigger value="keypair">
                  <KeyIcon className="size-4 mr-2" />
                  Keypair
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="accounts"
                className="mt-4 flex-1 overflow-auto"
              >
                <ProgramAccountsViewer />
              </TabsContent>

              <TabsContent value="graph" className="mt-4 flex-1 overflow-auto">
                <AccountRelationshipGraph />
              </TabsContent>

              <TabsContent
                value="spl-token"
                className="mt-4 flex-1 overflow-auto"
              >
                <SPLTokenManager />
              </TabsContent>

              <TabsContent
                value="keypair"
                className="mt-4 flex-1 overflow-auto"
              >
                <KeypairManager />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Converters */}
          <TabsContent
            value="converters"
            className="mt-0 flex-1 overflow-hidden flex flex-col"
          >
            <Tabs
              defaultValue="timestamp"
              className="w-full flex-1 overflow-hidden flex flex-col"
            >
              <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
                <TabsTrigger value="timestamp">
                  <CalendarIcon className="size-4 mr-2" />
                  Timestamp
                </TabsTrigger>
                <TabsTrigger value="lamports">
                  <CoinsIcon className="size-4 mr-2" />
                  Lamports
                </TabsTrigger>
                <TabsTrigger value="string">
                  <BinaryIcon className="size-4 mr-2" />
                  String
                </TabsTrigger>
                <TabsTrigger value="duration">
                  <ClockIcon className="size-4 mr-2" />
                  Duration
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="timestamp"
                className="mt-4 flex-1 overflow-auto"
              >
                <TimestampConverter />
              </TabsContent>

              <TabsContent
                value="lamports"
                className="mt-4 flex-1 overflow-auto"
              >
                <LamportsConverter />
              </TabsContent>

              <TabsContent value="string" className="mt-4 flex-1 overflow-auto">
                <StringEncoder />
              </TabsContent>

              <TabsContent
                value="duration"
                className="mt-4 flex-1 overflow-auto"
              >
                <DurationPicker />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
