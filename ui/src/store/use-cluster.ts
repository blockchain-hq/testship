import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ClusterNetwork = "mainnet-beta" | "devnet" | "testnet" | "custom";

export type SolanaCluster = {
  name: string;
  endpoint: string;
  network: ClusterNetwork;
};

const defaultClusters: SolanaCluster[] = [
  {
    name: "mainnet-beta",
    endpoint: "https://api.mainnet-beta.solana.com",
    network: "mainnet-beta",
  },
  {
    name: "devnet",
    endpoint: "https://api.devnet.solana.com",
    network: "devnet",
  },
  {
    name: "testnet",
    endpoint: "https://api.testnet.solana.com",
    network: "testnet",
  },
  {
    name: "local",
    endpoint: "http://localhost:8899",
    network: "custom",
  },
];

type ClusterState = {
  clusters: SolanaCluster[];
  active: SolanaCluster;
  setCluster: (cluster: SolanaCluster) => void;
  addCluster: (cluster: SolanaCluster) => void;
  deleteCluster: (name: string) => void;
  getExplorerUrl: (address: string, type: "address" | "tx") => string;
};

const getClusterParam = (cluster: SolanaCluster): string => {
  switch (cluster.network) {
    case "devnet":
      return "?cluster=devnet";
    case "testnet":
      return "?cluster=testnet";
    case "mainnet-beta":
      return "";
    default:
      return `?cluster=custom&customUrl=${encodeURIComponent(cluster.endpoint)}`;
  }
};

export const useCluster = create<ClusterState>()(
  persist(
    (set, get) => ({
      clusters: defaultClusters,
      active: defaultClusters[3], // default to local

      setCluster: (cluster) => set({ active: cluster }),

      addCluster: (cluster) =>
        set((s) => ({ clusters: [...s.clusters, cluster] })),

      deleteCluster: (name) =>
        set((s) => ({
          clusters: s.clusters.filter((c) => c.name !== name),
        })),

      getExplorerUrl: (address, type) => {
        const cluster = get().active;
        return `https://explorer.solana.com/${type}/${address}${getClusterParam(cluster)}`;
      },
    }),
    {
      name: "testship-cluster",
      partialize: (s) => ({ clusters: s.clusters, active: s.active }),
    }
  )
);

export const isDefaultCluster = (name: string) =>
  ["mainnet-beta", "devnet", "testnet", "local"].includes(name);
