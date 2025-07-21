"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface Graph {
  id: string;
  created_at: Date;
  updated_at: Date;
}

interface GraphContextType {
  currentGraphId: string | null;
  setCurrentGraphId: (graphId: string | null) => void;
  currentGraph: Graph | null;
  setCurrentGraph: (graph: Graph | null) => void;
  isCreatingGraph: boolean;
  setIsCreatingGraph: (isCreating: boolean) => void;
}

const GraphContext = createContext<GraphContextType | undefined>(undefined);

interface GraphProviderProps {
  children: ReactNode;
  initialGraphId?: string;
}

export function GraphProvider({
  children,
  initialGraphId,
}: GraphProviderProps) {
  const [currentGraphId, setCurrentGraphId] = useState<string | null>(
    initialGraphId || null
  );
  const [currentGraph, setCurrentGraph] = useState<Graph | null>(null);
  const [isCreatingGraph, setIsCreatingGraph] = useState(false);

  const value: GraphContextType = {
    currentGraphId,
    setCurrentGraphId,
    currentGraph,
    setCurrentGraph,
    isCreatingGraph,
    setIsCreatingGraph,
  };

  return (
    <GraphContext.Provider value={value}>{children}</GraphContext.Provider>
  );
}

export function useGraph() {
  const context = useContext(GraphContext);
  if (context === undefined) {
    throw new Error("useGraph must be used within a GraphProvider");
  }
  return context;
}

// Hook for creating a new graph
export function useCreateGraph() {
  const { setIsCreatingGraph, setCurrentGraphId, setCurrentGraph } = useGraph();

  const createGraph = async () => {
    setIsCreatingGraph(true);
    try {
      const response = await fetch("/api/graphs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to create graph");
      }

      const data = await response.json();
      setCurrentGraph(data.graph);
      setCurrentGraphId(data.graph.id);

      return {
        graph: data.graph,
        shareUrl: data.shareUrl,
      };
    } catch (error) {
      console.error("Error creating graph:", error);
      throw error;
    } finally {
      setIsCreatingGraph(false);
    }
  };

  return { createGraph };
}
