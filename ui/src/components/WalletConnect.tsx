import React from 'react';
import { Button } from './ui/button';

export const WalletConnect: React.FC = () => {
  const [isConnected, setIsConnected] = React.useState(false);

  const handleConnect = () => {
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
  };

  return (
    <div className="flex items-center space-x-2">
      {isConnected ? (
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-accent-success rounded-full"></div>
          <span className="text-sm text-foreground dark:text-foreground-dark">Connected</span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDisconnect}
            className="bg-accent-error hover:bg-accent-error/90"
          >
            Disconnect
          </Button>
        </div>
      ) : (
        <Button
          onClick={handleConnect}
          size="sm"
          className="bg-accent-primary hover:bg-accent-primary/90 text-white"
        >
          Connect Wallet
        </Button>
      )}
    </div>
  );
};
