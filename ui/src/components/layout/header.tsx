import { useState } from "react";
import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { Button } from "../ui/button";
import { WalletButton } from "./wallet-button";
import { HeaderProgramInfo } from "./header-program-info";
import { ClusterSelect } from "../cluster-select";

export const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="bg-background shadow-sm border-b w-full h-14 shrink-0">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img src="/ts.png" alt="Testship Logo" width={40} height={40} />
            </div>
            <HeaderProgramInfo />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <ClusterSelect />
              <WalletButton className="!h-8" />
            </div>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleTheme}
              className="cursor-pointer"
            >
              {isDarkMode ? <SunIcon size={20} /> : <MoonIcon size={20} />}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
