"use client";

import { AddConnectionModal } from "../components/AddConnectionModal";
import { useCreateGraph, GraphProvider } from "../components/GraphProvider";
import { ReactQueryProvider } from "../components/ReactQueryProvider";
import { ThemeToggle } from "../components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { PlusIcon, ShareIcon, UsersIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SocialGraph = dynamic(
  () => import("../components/SocialGraph").then((mod) => mod.SocialGraph),
  {
    ssr: false,
  }
);

function HomePage() {
  const { createGraph } = useCreateGraph();
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleCreateGraph = async () => {
    setIsCreating(true);
    try {
      const result = await createGraph();
      // Redirect to the new graph
      router.push(`/graph/${result.graph.id}`);
    } catch (error) {
      console.error("Failed to create graph:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UsersIcon size={24} className="text-primary" />
              <h1 className="text-xl font-semibold">Social Graph</h1>
              <ThemeToggle />
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleCreateGraph}
                disabled={isCreating}
                className="flex items-center gap-2"
              >
                <PlusIcon size={16} />
                {isCreating ? "Creating..." : "Create New Graph"}
              </Button>
            </div>{" "}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">
              Create & Share Social Network Graphs
            </h2>
            <p className="text-lg text-muted-foreground">
              Build interactive social network visualizations and share them
              with unique links. No login required - just create and share!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Button
                size="lg"
                onClick={handleCreateGraph}
                disabled={isCreating}
                className="flex items-center gap-2"
              >
                <PlusIcon size={18} />
                {isCreating ? "Creating..." : "Create Your Graph"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <ReactQueryProvider>
      <GraphProvider>
        <HomePage />
      </GraphProvider>
    </ReactQueryProvider>
  );
}
