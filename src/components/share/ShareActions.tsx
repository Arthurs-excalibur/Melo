"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HoverCard } from "@/components/animations/Wrappers";

interface ShareActionsProps {
  title: string;
  text: string;
}

export function ShareActions({ title, text }: ShareActionsProps) {
  const [copied, setCopied] = useState(false);

  const getCurrentUrl = () => window.location.href;

  const handleShare = async () => {
    const url = getCurrentUrl();

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;

      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <>
      <HoverCard className="flex-1">
        <Button
          type="button"
          size="lg"
          variant="outline"
          onClick={handleShare}
          className="w-full rounded-full border-white/20 bg-transparent hover:bg-white/5 h-14"
        >
          {copied ? (
            <Check className="w-5 h-5 mr-2" aria-hidden="true" />
          ) : (
            <Share2 className="w-5 h-5 mr-2" aria-hidden="true" />
          )}
          {copied ? "Link Copied" : "Share Direct"}
        </Button>
      </HoverCard>
    </>
  );
}
