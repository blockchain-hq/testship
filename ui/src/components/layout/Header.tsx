import { useState } from "react";
import { Button } from "../ui/button";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

interface HeaderProps {
  programName: string;
}

export const Header = (props: HeaderProps) => {
  const { programName } = props;
  console.log(programName, "programName");
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
            </div>
          </div>

          {programName && (
            <h2 className="font-medium text-2xl text-foreground dark:text-foreground-dark">
              {programName}
            </h2>
          )}

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
