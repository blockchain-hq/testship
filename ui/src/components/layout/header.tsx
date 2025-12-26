import React, { useState } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "../ui/button";
// import HeaderProgramInfo from "./HeaderProgramInfo";
// import ClusterSelect from "../ClusterSelect";
// import { UtilityDialog } from "../UtilityDialog";
// import { SettingsDropdown } from "./SettingsDropdown";
// import { UtilityDialogV2 } from "../UtilityDialogV2";
import { WalletButton } from "./wallet-button";

export const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="bg-background dark:bg-background-dark shadow-sm border-b-1 border-border dark:border-border-dark w-full h-16">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* logo and program info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img src="/ts.png" alt="Testship Logo" width={50} height={50} />
            </div>
            {/* <HeaderProgramInfo /> */}
          </div>

          {/* utilities, network and wallet */}
          <div className="flex items-center space-x-8">
            {/* utilities */}
            {/* <UtilityDialog /> */}
            {/* <UtilityDialogV2 /> */}

            {/* network and wallet */}
            <div className="flex items-center space-x-1">
              {/* <ClusterSelect /> */}
              <WalletButton className="!h-8" />
            </div>

            {/* settings */}
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleTheme}
                className="flex cursor-pointer h-10 w-10"
              >
                {isDarkMode ? <SunIcon size={24} /> : <MoonIcon size={24} />}
              </Button>

              {/* <SettingsDropdown /> */}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
