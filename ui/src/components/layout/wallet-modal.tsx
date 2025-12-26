"use client";

import { useConnector } from "@solana/connector";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Wallet } from "lucide-react";

interface WalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WalletModal = (props: WalletModalProps) => {
  const { open, onOpenChange } = props;
  const { wallets, select, connecting } = useConnector();

  const handleSelectWallet = async (walletName: string) => {
    try {
      await select(walletName);
      localStorage.setItem("recentlyConnectedWallet", walletName);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  const installedWallets = wallets.filter((w) => w.installed);
  const primaryWallets = installedWallets.slice(0, 3);
  const otherWallets = installedWallets.slice(3);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-lg">
        <DialogHeader>
          <DialogTitle>Connect your wallet</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {primaryWallets.map((wallet) => (
            <Button
              key={wallet.wallet.name}
              variant="outline"
              className="w-full h-12 justify-between p-4 rounded-lg"
              onClick={() => handleSelectWallet(wallet.wallet.name)}
              disabled={connecting}
            >
              <span>{wallet.wallet.name}</span>
              <Avatar>
                <AvatarImage src={wallet.wallet.icon} />
                <AvatarFallback>
                  <Wallet />
                </AvatarFallback>
              </Avatar>
            </Button>
          ))}
          {otherWallets.length > 0 && (
            <Accordion type="single" collapsible>
              <AccordionItem value="more">
                <AccordionTrigger>Other Wallets</AccordionTrigger>
                <AccordionContent>
                  {otherWallets.map((wallet) => (
                    <Button
                      key={wallet.wallet.name}
                      variant="outline"
                      className="w-full mb-2"
                    >
                      {wallet.wallet.name}
                    </Button>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletModal;
