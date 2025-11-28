// Import polyfills FIRST - this must run before any other imports
import "./polyfills";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import WalletContextProvider from "./providers/WalletProvider.tsx";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import { InstructionsProvider } from "./context/InstructionsContext.tsx";
import { IDLProvider } from "./context/IDLContext.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import { SavedAccountsProvider } from "./context/SavedAccountsContext.tsx";
import { ClusterProvider } from "./context/ClusterContext.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  </StrictMode>
);
