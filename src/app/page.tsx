"use client";

import { GraphProvider, useCreateGraph } from "@/components/GraphProvider";
import { ReactQueryProvider } from "@/components/ReactQueryProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";

function HomePageContent() {
  const { createGraph, isCreating } = useCreateGraph();
  const router = useRouter();

  const handleCreateGraph = async () => {
    const result = await createGraph();
    if (result) {
      router.push(`/graph/${result.graph.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="fixed top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Social Graph Builder
          </h1>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
            Create interactive graph visualizations
          </p>
          <Button
            onClick={handleCreateGraph}
            disabled={isCreating}
            size="lg"
            className="text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <PlusIcon size={20} className="mr-3" />
            {isCreating ? "Creating..." : "Create New Graph"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <ReactQueryProvider>
      <GraphProvider>
        <HomePageContent />
      </GraphProvider>
    </ReactQueryProvider>
  );
}
