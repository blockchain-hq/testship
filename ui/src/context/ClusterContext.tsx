"use client";

import { clusterApiUrl, Connection } from "@solana/web3.js";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { createContext, useContext } from "react";

export const ClusterNetwork = {
  Mainnet: "mainnet-beta",
  Devnet: "devnet",
  Testnet: "testnet",
  Custom: "custom",
} as const;

export type ClusterNetworkType =
  (typeof ClusterNetwork)[keyof typeof ClusterNetwork];

export interface SolanaCluster {
  name: string;
  endpoint: string;
  network?: ClusterNetworkType;
  active?: boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
export const defaultClusters: SolanaCluster[] = [
  {
    name: "mainnet-beta",
    endpoint: "https://api.mainnet-beta.solana.com",
    network: ClusterNetwork.Mainnet,
  },
  {
    name: "devnet",
    endpoint: clusterApiUrl(ClusterNetwork.Devnet),
    network: ClusterNetwork.Devnet,
  },
  {
    name: "testnet",
    endpoint: clusterApiUrl(ClusterNetwork.Testnet),
    network: ClusterNetwork.Testnet,
  },
  {
    name: "local",
    endpoint: "http://localhost:8899",
    network: ClusterNetwork.Custom,
  },
];

const clusterAtom = atomWithStorage<SolanaCluster>(
  "solana-cluster",
  defaultClusters[0]
);
const clustersAtom = atomWithStorage<SolanaCluster[]>(
  "solana-clusters",
  defaultClusters
);

const activeClustersAtom = atom<SolanaCluster[]>((get) => {
  const clusters = get(clustersAtom);
  const cluster = get(clusterAtom);
  return clusters.map((item) => ({
    ...item,
    active: item.name === cluster.name,
  }));
});

const activeClusterAtom = atom<SolanaCluster>((get) => {
  const clusters = get(activeClustersAtom);
  return clusters.find((item) => item.active) || clusters[0];
});

export interface ClusterProviderContext {
  cluster: SolanaCluster;
  clusters: SolanaCluster[];
  addCluster: (cluster: SolanaCluster) => void;
  deleteCluster: (cluster: SolanaCluster) => void;
  setCluster: (cluster: SolanaCluster) => void;

  getExplorerUrl: (path: string) => string;
}

const getClusterUrlParam = (cluster: SolanaCluster): string => {
  let suffix = "";
  switch (cluster.network) {
    case ClusterNetwork.Devnet:
      suffix = "devnet";
      break;
    case ClusterNetwork.Mainnet:
      suffix = "";
      break;
    case ClusterNetwork.Testnet:
      suffix = "testnet";
      break;
    default:
      suffix = `custom&customUrl=${encodeURIComponent(cluster.endpoint)}`;
      break;
  }

  return suffix.length ? `?cluster=${suffix}` : "";
};

const Context = createContext<ClusterProviderContext>(
  {} as ClusterProviderContext
);

export const ClusterProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const cluster = useAtomValue(activeClusterAtom);
  const clusters = useAtomValue(clustersAtom);
  const setCluster = useSetAtom(clusterAtom);
  const setClusters = useSetAtom(clustersAtom);

  const value: ClusterProviderContext = {
    cluster,
    clusters: clusters.sort((a, b) => (a.name > b.name ? 1 : -1)),
    addCluster: (cluster: SolanaCluster) => {
      try {
        new Connection(cluster.endpoint);
        setClusters([...clusters, cluster]);
      } catch (error) {
        console.error("Error adding cluster", error);
      }
    },
    deleteCluster: (cluster: SolanaCluster) => {
      setClusters(clusters.filter((item) => item.name !== cluster.name));
    },
    setCluster: (cluster: SolanaCluster) => {
      setCluster(cluster);
    },
    getExplorerUrl: (path: string) =>
      `https://explorer.solana.com/${path}${getClusterUrlParam(cluster)}`,
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCluster = () => {
  return useContext(Context);
};
