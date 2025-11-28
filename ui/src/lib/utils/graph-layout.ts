/**
 * Graph layout utilities for account relationship visualization
 * Provides layout algorithms and graph data transformation
 */

import { type Node, type Edge } from "@xyflow/react";
import type { DecodedAccount } from "@/hooks/useProgramAccounts";
import { extractPublicKeys } from "./account-state";

export interface GraphNode extends Node {
  data: {
    account: DecodedAccount;
    label: string;
    accountType?: string;
    lamports: number;
    refCount: number;
    isRecent?: boolean;
  };
}

export interface GraphEdge extends Edge {
  data: {
    fieldName?: string;
    isRecent?: boolean;
  };
}

/**
 * Build graph nodes and edges from account data
 */
export const buildGraphFromAccounts = (
  accounts: DecodedAccount[],
  recentChanges?: Map<
    string,
    { timestamp: number; txSignature: string; instructionName: string }
  >
): { nodes: GraphNode[]; edges: GraphEdge[] } => {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const accountMap = new Map(accounts.map((acc) => [acc.pubkey, acc]));

  // Create nodes
  accounts.forEach((account) => {
    const refCount = account.decoded
      ? extractPublicKeys(account.decoded).length
      : 0;
    const isRecent = recentChanges?.has(account.pubkey);

    nodes.push({
      id: account.pubkey,
      type: "accountNode",
      position: { x: 0, y: 0 }, // Will be set by layout algorithm
      data: {
        account,
        label: account.pubkey,
        accountType: account.accountType,
        lamports: account.account.lamports,
        refCount,
        isRecent,
      },
    });
  });

  // Create edges based on PublicKey references in decoded data
  accounts.forEach((account) => {
    if (!account.decoded) return;

    const references = extractPublicKeys(account.decoded);
    const fieldNames = extractFieldNamesForPublicKeys(account.decoded);

    references.forEach((targetKey) => {
      // Only create edge if target account exists in our dataset
      if (accountMap.has(targetKey) && targetKey !== account.pubkey) {
        const fieldName = fieldNames.get(targetKey);
        const isRecent = recentChanges?.has(account.pubkey);

        edges.push({
          id: `${account.pubkey}-${targetKey}`,
          source: account.pubkey,
          target: targetKey,
          type: "accountEdge",
          data: {
            fieldName,
            isRecent,
          },
        });
      }
    });
  });

  return { nodes, edges };
};

/**
 * Extract field names that contain PublicKey references
 */
const extractFieldNamesForPublicKeys = (
  data: unknown,
  prefix = ""
): Map<string, string> => {
  const fieldMap = new Map<string, string>();

  const traverse = (obj: unknown, path: string) => {
    if (!obj || typeof obj !== "object") return;

    if (Array.isArray(obj)) {
      obj.forEach((item, index) => traverse(item, `${path}[${index}]`));
      return;
    }

    // Check if this is a PublicKey-like object
    const objRecord = obj as Record<string, unknown>;
    if (
      objRecord.__type === "PublicKey" &&
      typeof objRecord.value === "string"
    ) {
      fieldMap.set(objRecord.value, path);
      return;
    }

    // Try parsing as PublicKey string
    if (typeof obj === "string") {
      try {
        // Solana public keys are 32-44 characters base58
        if (String(obj).length >= 32 && String(obj).length <= 44) {
          fieldMap.set(obj, path);
        }
      } catch {
        // Not a valid public key
      }
    }

    // Traverse object properties
    Object.entries(objRecord).forEach(([key, value]) => {
      const newPath = path ? `${path}.${key}` : key;
      traverse(value, newPath);
    });
  };

  traverse(data, prefix);
  return fieldMap;
};

/**
 * Apply hierarchical (Dagre-like) layout to nodes
 */
export const applyDagreLayout = (
  nodes: GraphNode[],
  edges: GraphEdge[],
  options: {
    rankDir?: "TB" | "LR";
    nodeWidth?: number;
    nodeHeight?: number;
  } = {}
): GraphNode[] => {
  const { rankDir = "TB", nodeWidth = 250, nodeHeight = 100 } = options;

  // Build adjacency list for topological sorting
  const adjacencyList = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  nodes.forEach((node) => {
    adjacencyList.set(node.id, []);
    inDegree.set(node.id, 0);
  });

  edges.forEach((edge) => {
    adjacencyList.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  });

  // Topological sort to determine layers
  const layers: string[][] = [];
  const queue: string[] = [];

  // Start with nodes that have no incoming edges
  nodes.forEach((node) => {
    if (inDegree.get(node.id) === 0) {
      queue.push(node.id);
    }
  });

  while (queue.length > 0) {
    const layerSize = queue.length;
    const currentLayer: string[] = [];

    for (let i = 0; i < layerSize; i++) {
      const nodeId = queue.shift()!;
      currentLayer.push(nodeId);

      adjacencyList.get(nodeId)?.forEach((neighbor) => {
        const newDegree = (inDegree.get(neighbor) || 0) - 1;
        inDegree.set(neighbor, newDegree);
        if (newDegree === 0) {
          queue.push(neighbor);
        }
      });
    }

    layers.push(currentLayer);
  }

  // Handle nodes with cycles (remaining nodes with in-degree > 0)
  const remainingNodes = nodes.filter(
    (node) => (inDegree.get(node.id) || 0) > 0
  );
  if (remainingNodes.length > 0) {
    layers.push(remainingNodes.map((node) => node.id));
  }

  // Position nodes based on layers
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const spacing = { x: nodeWidth + 50, y: nodeHeight + 80 };

  layers.forEach((layer, layerIndex) => {
    layer.forEach((nodeId, nodeIndex) => {
      const node = nodeMap.get(nodeId);
      if (!node) return;

      if (rankDir === "TB") {
        node.position = {
          x: nodeIndex * spacing.x - (layer.length * spacing.x) / 2,
          y: layerIndex * spacing.y,
        };
      } else {
        node.position = {
          x: layerIndex * spacing.x,
          y: nodeIndex * spacing.y - (layer.length * spacing.y) / 2,
        };
      }
    });
  });

  return Array.from(nodeMap.values());
};

/**
 * Apply force-directed layout to nodes
 */
export const applyForceLayout = (
  nodes: GraphNode[],
  edges: GraphEdge[],
  options: { iterations?: number; strength?: number } = {}
): GraphNode[] => {
  const { iterations = 300, strength = 0.1 } = options;

  // Initialize positions randomly if not set
  nodes.forEach((node) => {
    if (!node.position.x && !node.position.y) {
      node.position = {
        x: Math.random() * 1000 - 500,
        y: Math.random() * 1000 - 500,
      };
    }
  });

  // Build edge map for quick lookup
  const edgeMap = new Map<string, string[]>();
  edges.forEach((edge) => {
    if (!edgeMap.has(edge.source)) {
      edgeMap.set(edge.source, []);
    }
    edgeMap.get(edge.source)!.push(edge.target);
  });

  // Simulation parameters
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const repulsionStrength = 50000;
  const attractionStrength = 0.01;
  const centeringStrength = 0.05;

  for (let iter = 0; iter < iterations; iter++) {
    const forces = new Map<string, { x: number; y: number }>();

    // Initialize forces
    nodes.forEach((node) => {
      forces.set(node.id, { x: 0, y: 0 });
    });

    // Repulsion between all nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const nodeA = nodes[i];
        const nodeB = nodes[j];

        const dx = nodeB.position.x - nodeA.position.x;
        const dy = nodeB.position.y - nodeA.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;

        const force = repulsionStrength / (distance * distance);
        const forceX = (dx / distance) * force;
        const forceY = (dy / distance) * force;

        forces.get(nodeA.id)!.x -= forceX;
        forces.get(nodeA.id)!.y -= forceY;
        forces.get(nodeB.id)!.x += forceX;
        forces.get(nodeB.id)!.y += forceY;
      }
    }

    // Attraction along edges
    edges.forEach((edge) => {
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);
      if (!source || !target) return;

      const dx = target.position.x - source.position.x;
      const dy = target.position.y - source.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy) || 1;

      const force = distance * attractionStrength;
      const forceX = (dx / distance) * force;
      const forceY = (dy / distance) * force;

      forces.get(source.id)!.x += forceX;
      forces.get(source.id)!.y += forceY;
      forces.get(target.id)!.x -= forceX;
      forces.get(target.id)!.y -= forceY;
    });

    // Centering force
    nodes.forEach((node) => {
      forces.get(node.id)!.x -= node.position.x * centeringStrength;
      forces.get(node.id)!.y -= node.position.y * centeringStrength;
    });

    // Apply forces
    const damping = 1 - strength;
    nodes.forEach((node) => {
      const force = forces.get(node.id)!;
      node.position.x += force.x * strength;
      node.position.y += force.y * strength;
      node.position.x *= damping;
      node.position.y *= damping;
    });
  }

  return nodes;
};

/**
 * Apply radial/circular layout to nodes
 */
export const applyRadialLayout = (
  nodes: GraphNode[],
  edges: GraphEdge[],
  options: { radius?: number } = {}
): GraphNode[] => {
  const { radius = 400 } = options;

  if (nodes.length === 0) return nodes;
  if (nodes.length === 1) {
    nodes[0].position = { x: 0, y: 0 };
    return nodes;
  }

  // Find root nodes (nodes with no incoming edges)
  const incomingEdges = new Map<string, number>();
  nodes.forEach((node) => incomingEdges.set(node.id, 0));
  edges.forEach((edge) => {
    incomingEdges.set(edge.target, (incomingEdges.get(edge.target) || 0) + 1);
  });

  const rootNodes = nodes.filter((node) => incomingEdges.get(node.id) === 0);
  const leafNodes = nodes.filter((node) => !rootNodes.includes(node));

  // Place root nodes in center
  if (rootNodes.length === 1) {
    rootNodes[0].position = { x: 0, y: 0 };
  } else {
    rootNodes.forEach((node, index) => {
      const angle = (index / rootNodes.length) * 2 * Math.PI;
      node.position = {
        x: Math.cos(angle) * (radius / 3),
        y: Math.sin(angle) * (radius / 3),
      };
    });
  }

  // Place other nodes in a circle
  leafNodes.forEach((node, index) => {
    const angle = (index / leafNodes.length) * 2 * Math.PI;
    node.position = {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  });

  return nodes;
};

/**
 * Detect circular references in the graph
 */
export const detectCycles = (
  nodes: GraphNode[],
  edges: GraphEdge[]
): string[][] => {
  const adjacencyList = new Map<string, string[]>();
  nodes.forEach((node) => adjacencyList.set(node.id, []));
  edges.forEach((edge) => {
    adjacencyList.get(edge.source)?.push(edge.target);
  });

  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const path: string[] = [];

  const dfs = (nodeId: string): boolean => {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    path.push(nodeId);

    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        // Found a cycle
        const cycleStart = path.indexOf(neighbor);
        cycles.push(path.slice(cycleStart));
        return true;
      }
    }

    recursionStack.delete(nodeId);
    path.pop();
    return false;
  };

  nodes.forEach((node) => {
    if (!visited.has(node.id)) {
      dfs(node.id);
    }
  });

  return cycles;
};

/**
 * Calculate dynamic node size based on account data
 */
export const calculateNodeSize = (
  account: DecodedAccount
): {
  width: number;
  height: number;
} => {
  const baseWidth = 220;
  const baseHeight = 80;

  const fieldCount = account.decoded ? Object.keys(account.decoded).length : 0;
  const refCount = account.decoded
    ? extractPublicKeys(account.decoded).length
    : 0;

  // Increase size slightly for accounts with more data
  const widthMultiplier = 1 + Math.min(fieldCount / 20, 0.3);
  const heightMultiplier = 1 + Math.min(refCount / 10, 0.2);

  return {
    width: baseWidth * widthMultiplier,
    height: baseHeight * heightMultiplier,
  };
};
