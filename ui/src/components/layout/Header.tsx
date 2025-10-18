import { useState } from "react";
import { Button } from "../ui/button";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="bg-surface dark:bg-surface-dark shadow-sm border-b border-border dark:border-border-dark w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <img src="/ts.png" alt="Testship Logo" width={50} height={50} />
              <h1 className="text-2xl font-bold text-foreground dark:text-foreground-dark">
                Testship
              </h1>
              <span className="hidden sm:block text-sm text-foreground/60 dark:text-foreground-dark/60">
                Interactive Testing for Anchor Programs
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="flex cursor-pointer items-center space-x-2 border-border dark:border-border-dark hover:bg-surface-secondary dark:hover:bg-surface-dark-secondary"
            >
              {isDarkMode ? (
                <>
                  <span>☀️</span>
                </>
              ) : (
                <>
                  <span>🌙</span>
                </>
              )}
            </Button>

            <WalletMultiButton />
          </div>
        </div>
      </div>
    </header>
  );
};
