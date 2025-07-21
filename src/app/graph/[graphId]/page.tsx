"use client";

import { AddConnectionModal } from "@/components/AddConnectionModal";
import { GraphProvider } from "@/components/GraphProvider";
import { GraphShareButton } from "@/components/GraphShareButton";
import { ReactQueryProvider } from "@/components/ReactQueryProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import dynamic from "next/dynamic";
import * as React from "react";

const SocialGraph = dynamic(
  () => import("@/components/SocialGraph").then((mod) => mod.SocialGraph),
  { ssr: false }
);

interface GraphPageProps {
  params: Promise<{ graphId: string }>;
}

export default function GraphPage({ params }: GraphPageProps) {
  // Unwrap the params promise using React.use()
  const { graphId } = React.use(params);

  return (
    <ReactQueryProvider>
      <GraphProvider initialGraphId={graphId}>
        <div className="min-h-screen bg-background">
          <div className="fixed top-4 right-4 z-20 flex gap-2">
            <GraphShareButton />
            <AddConnectionModal
              graphId={graphId}
              trigger={
                <Button variant="outline" size="sm">
                  <PlusIcon size={16} className="mr-2" />
                  Add to Network
                </Button>
              }
            />
            <ThemeToggle />
          </div>
          <SocialGraph graphId={graphId} />
        </div>
      </GraphProvider>
    </ReactQueryProvider>
  );
}
