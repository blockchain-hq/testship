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
import {
  WrenchIcon,
  CalendarIcon,
  CoinsIcon,
  BinaryIcon,
  ClockIcon,
} from "lucide-react";
import { TimestampConverter } from "./utilityTools/TimestampConverter";
import { LamportsConverter } from "./utilityTools/LamportsConverter";
import { StringEncoder } from "./utilityTools/StringEncoder";
import { DurationPicker } from "./utilityTools/DurationPicker";

export const UtilityDialog = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <WrenchIcon className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] border border-border/50 text-foreground bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <WrenchIcon className="size-5 text-foreground" />
          </DialogTitle>
          <DialogDescription>
            Helpful tools for working with Solana programs
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="timestamp" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-4">
            <TabsTrigger
              value="timestamp"
              className="data-[state=active]:bg-[#00bf63]/10 data-[state=active]:text-[#00bf63]"
            >
              <CalendarIcon className="size-4 lg:mr-2" />
              <span className="hidden lg:inline">Timestamp</span>
            </TabsTrigger>
            <TabsTrigger
              value="lamports"
              className="data-[state=active]:bg-[#00bf63]/10 data-[state=active]:text-[#00bf63]"
            >
              <CoinsIcon className="size-4 lg:mr-2" />
              <span className="hidden lg:inline">Lamports</span>
            </TabsTrigger>
            <TabsTrigger
              value="string"
              className="data-[state=active]:bg-[#00bf63]/10 data-[state=active]:text-[#00bf63]"
            >
              <BinaryIcon className="size-4 lg:mr-2" />
              <span className="hidden lg:inline">String</span>
            </TabsTrigger>
            <TabsTrigger
              value="duration"
              className="data-[state=active]:bg-[#00bf63]/10 data-[state=active]:text-[#00bf63]"
            >
              <ClockIcon className="size-4 lg:mr-2" />
              <span className="hidden lg:inline">Duration</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timestamp" className="mt-4">
            <TimestampConverter />
          </TabsContent>

          <TabsContent value="lamports" className="mt-4">
            <LamportsConverter />
          </TabsContent>

          <TabsContent value="string" className="mt-4">
            <StringEncoder />
          </TabsContent>

          <TabsContent value="duration" className="mt-4">
            <DurationPicker />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
