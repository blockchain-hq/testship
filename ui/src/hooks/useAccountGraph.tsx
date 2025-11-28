import { useState, useMemo, useCallback } from "react";
import type { DecodedAccount } from "./useProgramAccounts";
import {
  buildGraphFromAccounts,
  applyDagreLayout,
  applyForceLayout,
  applyRadialLayout,
  type GraphNode,
} from "@/lib/utils/graph-layout";
import type { LayoutAlgorithm } from "@/components/utilityTools/graph/GraphControls";

interface UseAccountGraphProps {
  accounts: DecodedAccount[];
  recentChanges?: Map<
    string,
    { timestamp: number; txSignature: string; instructionName: string }
  >;
}

export const useAccountGraph = ({
  accounts,
  recentChanges,
}: UseAccountGraphProps) => {
  const [layoutAlgorithm, setLayoutAlgorithm] =
    useState<LayoutAlgorithm>("hierarchical");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [minRefs, setMinRefs] = useState(0);
  const [showEdgeLabels, setShowEdgeLabels] = useState(true);

  // Extract all unique account types
  const accountTypes = useMemo(() => {
    const types = new Set<string>();
    accounts.forEach((account) => {
      if (account.accountType) {
        types.add(account.accountType);
      }
    });
    return Array.from(types).sort();
  }, [accounts]);

  // Initialize selectedTypes with all types whenever accountTypes changes
  useMemo(() => {
    if (accountTypes.length > 0 && selectedTypes.size === 0) {
      setSelectedTypes(new Set(accountTypes));
    }
  }, [accountTypes]);

  // Filter accounts based on selected types and min refs
  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      // Filter by account type
      if (account.accountType && !selectedTypes.has(account.accountType)) {
        return false;
      }

      // Filter by minimum references
      const refCount = account.children?.size || 0;
      if (refCount < minRefs) {
        return false;
      }

      return true;
    });
  }, [accounts, selectedTypes, minRefs]);

  // Build graph from filtered accounts
  const { nodes: baseNodes, edges: baseEdges } = useMemo(() => {
    return buildGraphFromAccounts(filteredAccounts, recentChanges);
  }, [filteredAccounts, recentChanges]);

  // Apply layout algorithm to nodes
  const nodes = useMemo(() => {
    let layoutedNodes: GraphNode[] = [];

    switch (layoutAlgorithm) {
      case "hierarchical":
        layoutedNodes = applyDagreLayout(baseNodes, baseEdges, {
          rankDir: "TB",
        });
        break;
      case "force":
        layoutedNodes = applyForceLayout(baseNodes, baseEdges, {
          iterations: 300,
          strength: 0.1,
        });
        break;
      case "radial":
        layoutedNodes = applyRadialLayout(baseNodes, baseEdges, {
          radius: 400,
        });
        break;
      default:
        layoutedNodes = baseNodes;
    }

    return layoutedNodes;
  }, [baseNodes, baseEdges, layoutAlgorithm]);

  // Filter edges based on whether their connected nodes are visible
  const edges = useMemo(() => {
    const visibleNodeIds = new Set(nodes.map((node) => node.id));
    return baseEdges.filter(
      (edge) =>
        visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );
  }, [baseEdges, nodes]);

  // Get selected account details
  const selectedAccount = useMemo(() => {
    if (!selectedNodeId) return null;
    return accounts.find((acc) => acc.pubkey === selectedNodeId) || null;
  }, [selectedNodeId, accounts]);

  const selectedRecentChange = useMemo(() => {
    if (!selectedNodeId) return undefined;
    return recentChanges?.get(selectedNodeId);
  }, [selectedNodeId, recentChanges]);

  // Handlers
  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const handleLayoutChange = useCallback((layout: LayoutAlgorithm) => {
    setLayoutAlgorithm(layout);
  }, []);

  const handleTypeToggle = useCallback((type: string) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  const handleMinRefsChange = useCallback((value: number) => {
    setMinRefs(value);
  }, []);

  const handleToggleEdgeLabels = useCallback(() => {
    setShowEdgeLabels((prev) => !prev);
  }, []);

  return {
    // Graph data
    nodes,
    edges,

    // Filters
    accountTypes,
    selectedTypes,
    minRefs,

    // Layout
    layoutAlgorithm,

    // Selection
    selectedNodeId,
    selectedAccount,
    selectedRecentChange,

    // UI state
    showEdgeLabels,

    // Handlers
    handleNodeClick,
    handleCloseDetails,
    handleLayoutChange,
    handleTypeToggle,
    handleMinRefsChange,
    handleToggleEdgeLabels,
  };
};
