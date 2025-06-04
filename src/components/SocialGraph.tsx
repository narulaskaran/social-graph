import { useQuery } from "@tanstack/react-query";
import React, { useMemo } from "react";
import { ForceGraph2D } from "react-force-graph";

interface Profile {
  linkedin_username: string;
  first_name: string;
  last_name: string;
}

interface Connection {
  profile_a: string;
  profile_b: string;
}

interface GraphData {
  nodes: { id: string; label: string }[];
  links: { source: string; target: string }[];
}

export function SocialGraph() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["graph"],
    queryFn: async () => {
      const res = await fetch("/api/graph");
      if (!res.ok) throw new Error("Failed to fetch graph");
      return res.json();
    },
  });

  const graphData: GraphData = useMemo(() => {
    if (!data) return { nodes: [], links: [] };
    const nodes = (data.profiles as Profile[]).map((p) => ({
      id: p.linkedin_username,
      label: `${p.first_name} ${p.last_name}`,
    }));
    const links = (data.connections as Connection[]).map((c) => ({
      source: c.profile_a,
      target: c.profile_b,
    }));
    return { nodes, links };
  }, [data]);

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

  // Responsive sizing
  const [width, height] = [window.innerWidth, window.innerHeight];

  return (
    <div className="w-full h-full">
      <ForceGraph2D
        width={width}
        height={height}
        graphData={graphData}
        nodeLabel={(node: any) => node.label}
        nodeAutoColorBy="id"
        linkColor={() =>
          document.documentElement.classList.contains("dark") ? "#888" : "#222"
        }
        backgroundColor={
          document.documentElement.classList.contains("dark")
            ? "#18181b"
            : "#fff"
        }
        nodeCanvasObjectMode={() => "after"}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.label as string;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = document.documentElement.classList.contains("dark")
            ? "#fff"
            : "#000";
          ctx.fillText(label, node.x!, node.y! + 10);
        }}
      />
    </div>
  );
}
