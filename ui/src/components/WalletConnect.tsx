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
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-700 dark:text-gray-300">Connected</span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDisconnect}
          >
            Disconnect
          </Button>
        </div>
      ) : (
        <Button
          onClick={handleConnect}
          size="sm"
        >
          Connect Wallet
        </Button>
      )}
    </div>
  );
};
