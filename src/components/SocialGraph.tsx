"use client";

import { DeleteConnectionDialog } from "./DeleteConnectionDialog";
import { NodeSearch } from "./NodeSearch";
import { ProfileModal } from "./ProfileModal";
import { useQuery } from "@tanstack/react-query";
import React, {
  useMemo,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import ForceGraph2D from "react-force-graph-2d";
import type {
  NodeObject,
  ForceGraphMethods,
  LinkObject,
} from "react-force-graph-2d";

interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  linkedinUrl: string;
}

interface Connection {
  profile_a: string;
  profile_b: string;
}

interface ApiProfile {
  linkedin_username: string;
  first_name: string;
  last_name: string;
}

interface GraphNode {
  id: string;
  label: string;
  x?: number;
  y?: number;
  tier?: number; // 0: selected, 1: direct connection, 2: indirect connection, 3: other
}

interface GraphLink {
  source: string;
  target: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export function SocialGraph() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [edgeCreation, setEdgeCreation] = useState<{
    fromNode: { id: string; x: number; y: number } | null;
    toPosition: { x: number; y: number } | null;
  }>({ fromNode: null, toPosition: null });
  const [selectedProfile] = useState<Profile | null>(null);
  const fgRef = useRef<
    | ForceGraphMethods<
        NodeObject<GraphNode>,
        LinkObject<GraphNode, { source: string; target: string }>
      >
    | undefined
  >(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<{
    source: string;
    target: string;
    sourceName: string;
    targetName: string;
  } | null>(null);

  // Responsive sizing effect
  useEffect(() => {
    function handleResize() {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const {
    data: queryData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["graph"],
    queryFn: async () => {
      const res = await fetch("/api/graph");
      if (!res.ok) throw new Error("Failed to fetch graph");
      return res.json();
    },
  });

  const graphData: GraphData = useMemo(() => {
    if (!queryData) return { nodes: [], links: [] };
    const nodes = (queryData.profiles as ApiProfile[]).map((p) => ({
      id: p.linkedin_username,
      label: `${p.first_name} ${p.last_name}`,
      tier: 3, // Default tier
    }));
    const links = (queryData.connections as Connection[]).map((c) => ({
      source: c.profile_a,
      target: c.profile_b,
    }));

    // Update node tiers based on selected node
    if (selectedNodeId) {
      console.log("Selected node:", selectedNodeId);
      // Find direct connections (T1)
      const directConnections = new Set<string>();
      links.forEach((link) => {
        if (link.source === selectedNodeId) {
          directConnections.add(link.target);
        } else if (link.target === selectedNodeId) {
          directConnections.add(link.source);
        }
      });
      console.log("Direct connections:", Array.from(directConnections));

      // Find indirect connections (T2)
      const indirectConnections = new Set<string>();
      links.forEach((link) => {
        if (
          directConnections.has(link.source) &&
          !directConnections.has(link.target) &&
          link.target !== selectedNodeId
        ) {
          indirectConnections.add(link.target);
        }
        if (
          directConnections.has(link.target) &&
          !directConnections.has(link.source) &&
          link.source !== selectedNodeId
        ) {
          indirectConnections.add(link.source);
        }
      });
      console.log("Indirect connections:", Array.from(indirectConnections));

      // Update node tiers
      nodes.forEach((node) => {
        if (node.id === selectedNodeId) {
          node.tier = 0;
        } else if (directConnections.has(node.id)) {
          node.tier = 1;
        } else if (indirectConnections.has(node.id)) {
          node.tier = 2;
        } else {
          node.tier = 3;
        }
      });
      console.log(
        "Updated node tiers:",
        nodes.map((n) => ({ id: n.id, tier: n.tier }))
      );
    }

    return { nodes, links };
  }, [queryData, selectedNodeId]);

  const handleConnectionCreate = useCallback(
    async (fromNode: { id: string }, toNode: { id: string }) => {
      try {
        const res = await fetch("/api/connections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source: fromNode.id,
            target: toNode.id,
          }),
        });
        if (!res.ok) throw new Error("Failed to create connection");
        await refetch();
      } catch (err) {
        console.error("Error creating connection:", err);
      }
    },
    [refetch]
  );

  // Mouse move for edge creation effect
  useEffect(() => {
    if (!edgeCreation.fromNode) return;
    const handleMove = (event: MouseEvent) => {
      if (!fgRef.current) return;
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      const fg = fgRef.current;
      const graphCoords = fg.screen2GraphCoords(mouseX, mouseY);
      setEdgeCreation((ec) =>
        ec.fromNode
          ? {
              ...ec,
              toPosition: {
                x: graphCoords.x,
                y: graphCoords.y,
              },
            }
          : ec
      );
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setEdgeCreation({ fromNode: null, toPosition: null });
      }
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [edgeCreation.fromNode]);

  // Node click logic for edge creation
  const handleNodeClick = (node: NodeObject<GraphNode>) => {
    const n = node as GraphNode;
    if (!edgeCreation.fromNode) {
      // Start edge creation
      if (typeof n.x === "number" && typeof n.y === "number") {
        setEdgeCreation({
          fromNode: { id: n.id, x: n.x, y: n.y },
          toPosition: null,
        });
      }
      setSelectedNodeId(n.id);
      // Pan to the selected node
      if (fgRef.current && typeof n.x === "number" && typeof n.y === "number") {
        fgRef.current.centerAt(n.x, n.y, 1000);
        fgRef.current.zoom(2, 1000);
      }
    } else if (edgeCreation.fromNode && n.id !== edgeCreation.fromNode.id) {
      // Complete edge creation
      handleConnectionCreate(edgeCreation.fromNode, n);
      setEdgeCreation({ fromNode: null, toPosition: null });
      setSelectedNodeId(null);
    } else {
      // Clicked same node, cancel
      setEdgeCreation({ fromNode: null, toPosition: null });
      setSelectedNodeId(null);
    }
  };

  // Node hover logic
  const handleNodeHover = (node: NodeObject<GraphNode> | null) => {
    setHoveredNodeId(node ? (node as GraphNode).id : null);
  };

  // Add this useEffect after the ForceGraph2D component (but inside the SocialGraph function)
  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force("charge")?.strength(-50);
      fgRef.current.d3Force("link")?.distance(50);
    }
  }, [graphData]);

  const handleEdgeClick = useCallback(
    (edge: LinkObject<GraphNode, { source: string; target: string }>) => {
      const sourceId =
        typeof edge.source === "object"
          ? (edge.source as GraphNode).id
          : edge.source;
      const targetId =
        typeof edge.target === "object"
          ? (edge.target as GraphNode).id
          : edge.target;
      const sourceNode = graphData.nodes.find((n) => n.id === sourceId);
      const targetNode = graphData.nodes.find((n) => n.id === targetId);

      if (sourceNode && targetNode) {
        setSelectedEdge({
          source: sourceId,
          target: targetId,
          sourceName: sourceNode.label,
          targetName: targetNode.label,
        });

        setDeleteDialogOpen(true);
      }
    },
    [graphData.nodes]
  );

  const handleDeleteConnection = useCallback(async () => {
    if (!selectedEdge) return;

    try {
      const res = await fetch("/api/connections", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: selectedEdge.source,
          target: selectedEdge.target,
        }),
      });

      if (!res.ok) throw new Error("Failed to delete connection");
      await refetch();
      setDeleteDialogOpen(false);
      setSelectedEdge(null);
    } catch (err) {
      console.error("Error deleting connection:", err);
    }
  }, [selectedEdge, refetch]);

  const handleNodeSelect = useCallback(
    (node: { id: string; label: string }) => {
      setSelectedNodeId(node.id);
      if (fgRef.current) {
        const graphNode = graphData.nodes.find((n) => n.id === node.id);
        if (
          graphNode &&
          typeof graphNode.x === "number" &&
          typeof graphNode.y === "number"
        ) {
          // First zoom out slightly to show context
          fgRef.current.zoom(0.5, 500);
          // Then pan to the node and zoom in
          setTimeout(() => {
            if (fgRef.current) {
              fgRef.current.centerAt(graphNode.x, graphNode.y, 1000);
              fgRef.current.zoom(2, 1000);
            }
          }, 500);
        }
      }
    },
    [graphData.nodes]
  );

  if (isLoading)
    return (
      <div className="w-full h-full flex items-center justify-center">
        Loading graph...
      </div>
    );
  if (error)
    return (
      <div className="w-full h-full flex items-center justify-center text-red-500">
        Error loading graph
      </div>
    );

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      data-testid="social-graph"
    >
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-10 flex gap-4 items-center">
        <NodeSearch nodes={graphData.nodes} onSelect={handleNodeSelect} />
        <div className="bg-primary/90 text-primary-foreground px-4 py-2 rounded shadow">
          Click one node, then another to create a connection. Click an edge to
          delete it.
        </div>
      </div>
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeLabel={(node: NodeObject<GraphNode>) => (node as GraphNode).label}
        nodeColor={(node: NodeObject<GraphNode>) => {
          const n = node as GraphNode;
          if (n.id === selectedNodeId) return "#22c55e"; // green-500
          if (n.id === hoveredNodeId) return "#38bdf8"; // sky-400
          if (n.tier === 1) return "#eab308"; // yellow-500
          if (n.tier === 2) return "#ef4444"; // red-500
          return "#7dd3fc"; // sky-300
        }}
        linkColor={() => "#94a3b8"} // slate-400
        nodeRelSize={6}
        linkWidth={2}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        onLinkClick={handleEdgeClick}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const n = node as GraphNode;
          const label = n.label;
          const fontSize = 16 / globalScale;

          // Draw label above node
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          ctx.fillStyle = "#fff";
          ctx.fillText(label, node.x!, node.y! - 12);
        }}
        nodeCanvasObjectMode={() => "after"}
      />
      {/* Draw temporary edge if dragging */}
      {edgeCreation.fromNode && edgeCreation.toPosition && (
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 1000,
          }}
          width={dimensions.width}
          height={dimensions.height}
        >
          <line
            data-testid="connection-line"
            x1={
              fgRef.current?.graph2ScreenCoords(
                edgeCreation.fromNode.x!,
                edgeCreation.fromNode.y!
              )?.x ?? 0
            }
            y1={
              fgRef.current?.graph2ScreenCoords(
                edgeCreation.fromNode.x!,
                edgeCreation.fromNode.y!
              )?.y ?? 0
            }
            x2={
              fgRef.current?.graph2ScreenCoords(
                edgeCreation.toPosition.x,
                edgeCreation.toPosition.y
              )?.x ?? 0
            }
            y2={
              fgRef.current?.graph2ScreenCoords(
                edgeCreation.toPosition.x,
                edgeCreation.toPosition.y
              )?.y ?? 0
            }
            stroke="#0ea5e9" // sky-500
            strokeWidth={2}
          />
        </svg>
      )}
      {selectedProfile && (
        <ProfileModal
          profile={selectedProfile}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      )}
      {selectedEdge && (
        <DeleteConnectionDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConnection}
          sourceName={selectedEdge.sourceName}
          targetName={selectedEdge.targetName}
        />
      )}
    </div>
  );
}
