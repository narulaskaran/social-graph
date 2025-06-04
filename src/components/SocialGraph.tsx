"use client";

import { ProfileModal } from "./ProfileModal";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useEffect, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

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

interface GraphData {
  nodes: { id: string; label: string }[];
  links: { source: string; target: string }[];
}

interface ApiProfile {
  linkedin_username: string;
  first_name: string;
  last_name: string;
}

export function SocialGraph() {
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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
    const nodes = (data.profiles as ApiProfile[]).map((p) => ({
      id: p.linkedin_username,
      label: `${p.first_name} ${p.last_name}`,
    }));
    const links = (data.connections as Connection[]).map((c) => ({
      source: c.profile_a,
      target: c.profile_b,
    }));
    return { nodes, links };
  }, [data]);

  // Responsive sizing
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  useEffect(() => {
    function handleResize() {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const isDark =
    typeof window !== "undefined" &&
    document.documentElement.classList.contains("dark");

  const handleNodeClick = (node: { id: string }) => {
    const profile = data?.profiles.find(
      (p: ApiProfile) => p.linkedin_username === node.id
    );
    if (profile) {
      setSelectedProfile({
        id: profile.linkedin_username,
        firstName: profile.first_name,
        lastName: profile.last_name,
        linkedinUrl: `https://www.linkedin.com/in/${profile.linkedin_username}`,
      });
      setModalOpen(true);
    }
  };

  return (
    <div className="w-full h-full">
      <ForceGraph2D
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel={(node: { id: string; label: string }) => node.label}
        nodeAutoColorBy="id"
        linkColor={() => (isDark ? "#aaa" : "#444")}
        backgroundColor={isDark ? "#18181b" : "#fff"}
        nodeCanvasObjectMode={() => "after"}
        nodeCanvasObject={(
          node: { id: string; label: string; x?: number; y?: number },
          ctx: CanvasRenderingContext2D,
          globalScale: number
        ) => {
          const label = node.label as string;
          const fontSize = 14 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          // Draw background for label
          const textWidth = ctx.measureText(label).width;
          const padding = 4;
          ctx.fillStyle = isDark
            ? "rgba(24,24,27,0.85)"
            : "rgba(255,255,255,0.85)";
          ctx.fillRect(
            node.x! - textWidth / 2 - padding,
            node.y! + 10 - fontSize / 2 - padding,
            textWidth + 2 * padding,
            fontSize + 2 * padding
          );
          // Draw text
          ctx.fillStyle = isDark ? "#fff" : "#18181b";
          ctx.fillText(label, node.x!, node.y! + 10);
        }}
        onNodeClick={handleNodeClick}
      />
      <ProfileModal
        profile={selectedProfile}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
