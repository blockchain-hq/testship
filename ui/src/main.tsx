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

window.Buffer = Buffer;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Toaster />
    <WalletContextProvider>
      <TooltipProvider>
        <IDLProvider>
          <InstructionsProvider>
            <App />
          </InstructionsProvider>
        </IDLProvider>
      </TooltipProvider>
    </WalletContextProvider>
  </StrictMode>
);
