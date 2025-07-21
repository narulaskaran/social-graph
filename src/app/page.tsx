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
            Create interactive social network visualizations. Map connections
            between people, explore relationships, and share your networks with
            others through unique URLs.
          </p>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50 mb-16">
            <h2 className="text-2xl font-semibold mb-4">
              Ready to start mapping connections?
            </h2>
            <p className="text-muted-foreground mb-6">
              Each graph is completely isolated with its own shareable URL.
              Perfect for different projects, teams, or social circles.
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

          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/30 dark:border-gray-700/30">
              <div className="text-blue-600 dark:text-blue-400 text-2xl mb-3">
                🔗
              </div>
              <h3 className="font-semibold mb-2">Easy Connections</h3>
              <p className="text-sm text-muted-foreground">
                Simply add names and define relationships. No complex setup
                required.
              </p>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/30 dark:border-gray-700/30">
              <div className="text-purple-600 dark:text-purple-400 text-2xl mb-3">
                🎯
              </div>
              <h3 className="font-semibold mb-2">Interactive Visualization</h3>
              <p className="text-sm text-muted-foreground">
                Drag nodes, zoom, and explore your network in an intuitive
                interface.
              </p>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/30 dark:border-gray-700/30">
              <div className="text-green-600 dark:text-green-400 text-2xl mb-3">
                📤
              </div>
              <h3 className="font-semibold mb-2">Shareable Links</h3>
              <p className="text-sm text-muted-foreground">
                Every graph gets a unique URL that you can share with anyone.
              </p>
            </div>
          </div>
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
