// Ref: https://github.com/anza-xyz/wallet-adapter/blob/master/APP.md

import type React from "react";
import { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

interface WalletContextProviderProps {
  children: React.ReactNode;
}

const WalletContextProvider = (props: WalletContextProviderProps) => {
  const { children } = props;

  //   const network = WalletAdapterNetwork.Devnet;
  //   const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const wallets = useMemo(() => [], ["localnet"]);

  return (
    <ConnectionProvider endpoint={"http://127.0.0.1:8899"}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletContextProvider;
