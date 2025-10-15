import React from 'react';
import { Button } from '../ui/button';
import { WalletConnect } from '../WalletConnect';

export const Header: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Toggle dark mode class on document
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                PULSE <span className="text-yellow-500">⚡</span>
              </h1>
              <span className="hidden sm:block text-sm text-gray-500 dark:text-gray-400">
                Interactive Testing for Anchor Programs
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="flex items-center space-x-2"
            >
              {isDarkMode ? (
                <>
                  <span>☀️</span>
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <span>🌙</span>
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </Button>
            
            <WalletConnect />
          </div>
        </div>
      </div>
    </header>
  );
};
