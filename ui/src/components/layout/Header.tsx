import { useState } from "react";
import { Button } from "../ui/button";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { MoonIcon, SunIcon } from "lucide-react";
import HeaderProgramInfo from "./HeaderProgramInfo";
import ClusterSelect from "../ClusterSelect";

export const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="bg-background dark:bg-background-dark shadow-sm border-b w-full h-16">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img src="/ts.png" alt="Testship Logo" width={50} height={50} />
            </div>
            <HeaderProgramInfo />
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="flex cursor-pointer"
            >
              {isDarkMode ? <SunIcon /> : <MoonIcon />}
            </Button>

            <WalletMultiButton />

            <ClusterSelect />
          </div>
        </div>
      </div>
    </header>
  );
};
