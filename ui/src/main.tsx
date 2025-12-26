import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConnectorProvider, type ConnectorConfig } from "@solana/connector";
import "./index.css";
import App from "./App.tsx";

const connectorConfig: ConnectorConfig = {
  autoConnect: true,
  debug: false,
  cluster: {
    clusters: [
      {
        id: "solana:mainnet",
        label: "Mainnet",
        url: "https://api.mainnet-beta.solana.com",
      },
      {
        id: "solana:devnet",
        label: "Devnet",
        url: "https://api.devnet.solana.com",
      },
      {
        id: "solana:localhost",
        label: "Localhost",
        url: "http://localhost:8899",
      },
    ],
  },
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConnectorProvider config={connectorConfig}>
      <App />
    </ConnectorProvider>
  </StrictMode>
);
