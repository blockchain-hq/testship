// Ref: https://github.com/anza-xyz/wallet-adapter/blob/master/APP.md

import type React from "react";
import { useCallback, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { useCluster } from "@/context/ClusterContext";
import { WalletError } from "@solana/wallet-adapter-base";

interface WalletContextProviderProps {
  children: React.ReactNode;
}

const WalletContextProvider = (props: WalletContextProviderProps) => {
  const { children } = props;

  const { cluster } = useCluster();
  const endpoint = useMemo(() => cluster.endpoint, [cluster]);
  const onError = useCallback((error: WalletError) => console.log(error), []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect onError={onError}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletContextProvider;
