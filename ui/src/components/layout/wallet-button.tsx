"use client";

import { useConnector } from "@solana/connector";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import WalletModal from "./wallet-modal";
import WalletDropdownContent from "./wallet-dropdown-content";
import { Wallet, ChevronDown } from "lucide-react";

export const WalletButton = ({ className }: { className?: string }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { connected, connecting, selectedWallet, selectedAccount, wallets } =
    useConnector();

  if (connecting) {
    return (
      <Button size="sm" disabled className={className}>
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      </Button>
    );
  }

  if (connected && selectedAccount && selectedWallet) {
    const shortAddress = `${selectedAccount.slice(
      0,
      4
    )}...${selectedAccount.slice(-4)}`;
    const walletWithIcon = wallets.find(
      (w) => w.wallet.name === selectedWallet.name
    );
    const walletIcon = walletWithIcon?.wallet.icon || selectedWallet.icon;

    return (
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={className}>
            <Avatar className="h-5 w-5">
              {walletIcon && <AvatarImage src={walletIcon} />}
              <AvatarFallback>
                <Wallet className="h-3 w-3" />
              </AvatarFallback>
            </Avatar>
            <span className="text-xs">{shortAddress}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="p-0 rounded-[20px]">
          <WalletDropdownContent
            selectedAccount={selectedAccount}
            walletIcon={walletIcon}
            walletName={selectedWallet.name}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <Button
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className={className}
      >
        Connect Wallet
      </Button>
      <WalletModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
};

export default WalletButton;
