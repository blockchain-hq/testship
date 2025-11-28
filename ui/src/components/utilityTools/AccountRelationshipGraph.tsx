import { useCallback, useMemo } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useIDL } from "@/context/IDLContext";
import { useCluster } from "@/context/ClusterContext";
import { useProgramAccounts } from "@/hooks/useProgramAccounts";
import { useTransactionHistory } from "@/hooks/useTransactionHistory";
import { useAccountGraph } from "@/hooks/useAccountGraph";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Card, CardContent } from "../ui/card";
import { Database } from "lucide-react";
import { AccountNode } from "./graph/AccountNode";
import { AccountEdge } from "./graph/AccountEdge";
import { GraphControls } from "./graph/GraphControls";
import { MobileGraphControls } from "./graph/MobileGraphControls";
import { NodeDetailsPanel } from "./graph/NodeDetailsPanel";
import { GraphSkeleton } from "./graph/GraphSkeleton";

const nodeTypes = {
  accountNode: AccountNode,
} as const;

const edgeTypes = {
  accountEdge: AccountEdge,
} as const;

const GraphContent = () => {
  const { idl } = useIDL();
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const { transactions } = useTransactionHistory();
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  const { accounts, isLoading, error } = useProgramAccounts(
    connection,
    idl,
    cluster
  );

  // Build map of recently changed accounts
  const recentChanges = useMemo(() => {
    const changesMap = new Map<
      string,
      { timestamp: number; txSignature: string; instructionName: string }
    >();

    for (const tx of transactions) {
      if (tx.status === "success" && tx.accountSnapshots) {
        for (const accountName of Object.keys(tx.accountSnapshots)) {
          const address = tx.accounts?.[accountName];
          if (address && !changesMap.has(address)) {
            changesMap.set(address, {
              timestamp: tx.timestamp,
              txSignature: tx.signature,
              instructionName: tx.instructionName,
            });
          }
        }
      }
    }

    return changesMap;
  }, [transactions]);

  const {
    nodes,
    edges,
    accountTypes,
    selectedTypes,
    minRefs,
    layoutAlgorithm,
    selectedAccount,
    selectedRecentChange,
    showEdgeLabels,
    handleNodeClick,
    handleCloseDetails,
    handleLayoutChange,
    handleTypeToggle,
    handleMinRefsChange,
    handleToggleEdgeLabels,
  } = useAccountGraph({
    accounts,
    recentChanges,
  });

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: { id: string }) => {
      handleNodeClick(node.id);
    },
    [handleNodeClick]
  );

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.2, duration: 800 });
  }, [fitView]);

  const handleZoomIn = useCallback(() => {
    zoomIn({ duration: 300 });
  }, [zoomIn]);

  const handleZoomOut = useCallback(() => {
    zoomOut({ duration: 300 });
  }, [zoomOut]);

  const handleExportPNG = useCallback(() => {
    // For now, use the browser's print functionality
    // In a production app, you'd use a library like html2canvas
    window.print();
  }, []);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "f" || event.key === "F") {
        event.preventDefault();
        handleFitView();
      } else if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        handleZoomIn();
      } else if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        handleZoomOut();
      } else if (event.key === "Escape") {
        handleCloseDetails();
      }
    },
    [handleFitView, handleZoomIn, handleZoomOut, handleCloseDetails]
  );

  // Setup keyboard shortcuts
  useMemo(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!idl || !idl.address) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No program loaded. Load a program IDL to view the graph.</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6 space-y-2">
          <p className="text-sm text-destructive font-medium">{error}</p>
          {error.includes("CORS") || error.includes("403") ? (
            <div className="mt-3 text-xs text-muted-foreground space-y-1">
              <p className="font-medium">To fix this:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Use the cluster dropdown in the header</li>
                <li>Add a custom RPC endpoint that supports CORS</li>
              </ul>
            </div>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  if (isLoading && accounts.length === 0) {
    return <GraphSkeleton />;
  }

  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No accounts found for this program.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (nodes.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No accounts match the current filters. Try adjusting your filter
            settings.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Filter edges based on showEdgeLabels setting
  const displayEdges = edges.map((edge) => ({
    ...edge,
    data: {
      ...edge.data,
      fieldName: showEdgeLabels ? edge.data?.fieldName : undefined,
    },
  }));

  return (
    <div className="relative w-full h-[600px] md:h-[700px] lg:h-[800px] border border-border rounded-lg overflow-hidden bg-background">
      <ReactFlow
        nodes={nodes}
        edges={displayEdges}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: "accountEdge",
          animated: false,
        }}
        className="touch-none"
      >
        <Background color="hsl(var(--border))" gap={16} size={1} />
        <Controls
          className="bg-background/95 backdrop-blur-sm border border-border rounded-md shadow-sm"
          showInteractive={false}
        />
        <MiniMap
          className="bg-background/95 backdrop-blur-sm border border-border rounded-md shadow-sm hidden md:block"
          nodeColor={(node) => {
            const accountType = (node.data as { accountType?: string })
              ?.accountType;
            if (!accountType) return "hsl(var(--muted))";
            const hash = accountType
              .split("")
              .reduce((acc, char) => acc + char.charCodeAt(0), 0);
            return `hsl(${hash % 360}, 70%, 50%)`;
          }}
          maskColor="hsl(var(--background) / 0.8)"
        />
      </ReactFlow>

      <div className="hidden lg:block">
        <GraphControls
          layoutAlgorithm={layoutAlgorithm}
          onLayoutChange={handleLayoutChange}
          accountTypes={accountTypes}
          selectedTypes={selectedTypes}
          onTypeToggle={handleTypeToggle}
          showEdgeLabels={showEdgeLabels}
          onToggleEdgeLabels={handleToggleEdgeLabels}
          onFitView={handleFitView}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onExportPNG={handleExportPNG}
          minRefs={minRefs}
          onMinRefsChange={handleMinRefsChange}
        />
      </div>

      <MobileGraphControls
        layoutAlgorithm={layoutAlgorithm}
        onLayoutChange={handleLayoutChange}
        onFitView={handleFitView}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />

      <NodeDetailsPanel
        account={selectedAccount}
        isOpen={!!selectedAccount}
        onClose={handleCloseDetails}
        recentChange={selectedRecentChange}
      />

      {/* Stats Badge */}
      <div className="absolute bottom-4 left-4 z-10 bg-background/95 backdrop-blur-sm border border-border rounded-md px-3 py-1.5 shadow-sm">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{nodes.length}</span>{" "}
          nodes,{" "}
          <span className="font-semibold text-foreground">{edges.length}</span>{" "}
          edges
        </p>
      </div>
    </div>
  );
};

export const AccountRelationshipGraph = () => {
  return (
    <ReactFlowProvider>
      <GraphContent />
    </ReactFlowProvider>
  );
};
