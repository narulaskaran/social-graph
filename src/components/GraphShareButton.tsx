"use client";

import { useGraph } from "./GraphProvider";
import { Button } from "@/components/ui/button";
import { Copy, Share, Check } from "lucide-react";
import { useState, useEffect } from "react";

export function GraphShareButton() {
  const { currentGraphId } = useGraph();
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    // Only set the share URL on the client side to avoid SSR issues
    if (typeof window !== "undefined" && currentGraphId) {
      setShareUrl(`${window.location.origin}/graph/${currentGraphId}`);
    }
  }, [currentGraphId]);

  if (!currentGraphId || !shareUrl) {
    return null;
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Social Graph",
          text: "Check out this social network graph!",
          url: shareUrl,
        });
      } catch (error) {
        console.error("Failed to share:", error);
        // Fallback to copy
        handleCopyLink();
      }
    } else {
      // Fallback to copy if Web Share API is not supported
      handleCopyLink();
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
        className="flex items-center gap-2"
      >
        {copied ? (
          <>
            <Check size={16} />
            Copied!
          </>
        ) : (
          <>
            <Copy size={16} />
            Copy Link
          </>
        )}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        className="flex items-center gap-2"
      >
        <Share size={16} />
        Share
      </Button>
    </div>
  );
}
