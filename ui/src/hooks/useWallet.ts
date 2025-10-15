import { useState } from 'react';

export const useWallet = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = async () => {
    setIsConnecting(true);
    try {
      // Mock wallet connection - replace with actual wallet integration
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWalletAddress('mock-wallet-address');
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setWalletAddress(null);
  };

  return {
    isConnected,
    walletAddress,
    isConnecting,
    connect,
    disconnect,
  };
};
