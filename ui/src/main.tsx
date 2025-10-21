import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import WalletContextProvider from "./providers/WalletProvider.tsx";
import { Buffer } from "buffer";
import { TooltipProvider } from "./components/ui/tooltip.tsx";

window.Buffer = Buffer;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WalletContextProvider>
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </WalletContextProvider>
  </StrictMode>
);
