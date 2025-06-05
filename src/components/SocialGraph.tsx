"use client";

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
}

interface GraphData {
  nodes: GraphNode[];
  links: { source: string; target: string }[];
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
    }));
    const links = (queryData.connections as Connection[]).map((c) => ({
      source: c.profile_a,
      target: c.profile_b,
    }));
    return { nodes, links };
  }, [queryData]);

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
      <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-primary/90 text-primary-foreground px-4 py-2 rounded shadow z-10">
        Click one node, then another to create a connection
      </div>
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeLabel={(node: NodeObject<GraphNode>) => (node as GraphNode).label}
        nodeColor={(node: NodeObject<GraphNode>) => {
          const n = node as GraphNode;
          if (n.id === selectedNodeId) return "#0ea5e9"; // sky-500
          if (n.id === hoveredNodeId) return "#38bdf8"; // sky-400
          return "#7dd3fc"; // sky-300
        }}
        linkColor={() => "#64748b"} // slate-500
        nodeRelSize={6}
        linkWidth={1}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = (node as GraphNode).label;
          const fontSize = 16 / globalScale;
          // Draw node (circle)
          ctx.beginPath();
          ctx.arc(node.x!, node.y!, 8, 0, 2 * Math.PI, false);
          ctx.fillStyle = "#7dd3fc"; // or use your nodeColor logic
          ctx.fill();
          ctx.strokeStyle = "#222";
          ctx.lineWidth = 1;
          ctx.stroke();
          // Draw label above node
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          ctx.fillStyle = "#fff";
          ctx.fillText(label, node.x!, node.y! - 12);
        }}
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
    </div>
  );
}
