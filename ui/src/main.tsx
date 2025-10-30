import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import WalletContextProvider from "./providers/WalletProvider.tsx";
import { Buffer } from "buffer";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import { InstructionsProvider } from "./context/InstructionsContext.tsx";
import { IDLProvider } from "./context/IDLContext.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import { SavedAccountsProvider } from "./context/SavedAccountsContext.tsx";
import { ClusterProvider } from "./context/ClusterContext.tsx";

window.Buffer = Buffer;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClusterProvider>
      <Toaster />
      <WalletContextProvider>
        <TooltipProvider>
          <IDLProvider>
            <InstructionsProvider>
              <SavedAccountsProvider>
                <App />
              </SavedAccountsProvider>
            </InstructionsProvider>
          </IDLProvider>
        </TooltipProvider>
      </WalletContextProvider>
    </ClusterProvider>
  </StrictMode>
);
