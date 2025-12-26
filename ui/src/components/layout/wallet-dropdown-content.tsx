"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  BalanceElement,
  ClusterElement,
  DisconnectElement,
} from "@solana/connector/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, Copy, Globe, Check, RefreshCw, LogOut } from "lucide-react";
import { useState } from "react";

const WalletDropdownContent = ({
  selectedAccount,
  walletIcon,
  walletName,
}: {
  selectedAccount: string;
  walletIcon: string;
  walletName: string;
}) => {
  const [copied, setCopied] = useState(false);
  const shortAddress = `${selectedAccount.slice(
    0,
    4
  )}...${selectedAccount.slice(-4)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedAccount);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-[360px] p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={walletIcon} />
            <AvatarFallback>
              <Wallet />
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{shortAddress}</div>
            <div className="text-xs text-muted-foreground">{walletName}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleCopy}>
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <ClusterElement
            render={({ cluster, clusters, setCluster }) => {
              if (!clusters || clusters.length === 0) {
                return (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled
                  >
                    <Globe />
                  </Button>
                );
              }

              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Globe />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    alignOffset={-10}
                    side="left"
                    className="z-50"
                  >
                    {clusters.map((c) => (
                      <DropdownMenuItem
                        key={c.id}
                        onClick={() => setCluster(c.id)}
                        className={cluster?.id === c.id ? "bg-accent" : ""}
                      >
                        {c.label}
                        {cluster?.id === c.id && (
                          <Check className="ml-auto h-4 w-4" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }}
          />
        </div>
      </div>

      {/* Balance */}
      <BalanceElement
        render={({ solBalance, isLoading, refetch }) => (
          <div className="rounded-[12px] border p-4">
            <div className="flex justify-between">
              <span>Balance</span>
              <button onClick={refetch}>
                <RefreshCw className={isLoading ? "animate-spin" : ""} />
              </button>
            </div>
            <div className="text-2xl font-bold">
              {solBalance?.toFixed(4)} SOL
            </div>
          </div>
        )}
      />

      {/* Disconnect */}
      <DisconnectElement
        render={({ disconnect, disconnecting }) => (
          <Button
            variant="destructive"
            className="w-full"
            onClick={disconnect}
            disabled={disconnecting}
          >
            <LogOut /> {disconnecting ? "Disconnecting..." : "Disconnect"}
          </Button>
        )}
      />
    </div>
  );
};

export default WalletDropdownContent;
