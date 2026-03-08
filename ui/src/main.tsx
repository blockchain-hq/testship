import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConnectorProvider, getDefaultConfig } from "@solana/connector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App.tsx";

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
    <ConnectorProvider config={getDefaultConfig({ appName: "Testship" })}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ConnectorProvider>
  </StrictMode>
);
