"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { HoverCard } from "@/components/animations/Wrappers";
import { Headphones } from "lucide-react";

interface ConnectButtonProps {
  className?: string;
  variant?: "navbar" | "hero";
}

export function ConnectButton({ className, variant = "navbar" }: ConnectButtonProps) {
  const handleConnect = () => {
    signIn("spotify", { callbackUrl: "/dashboard" });
  };

  if (variant === "hero") {
    return (
      <HoverCard>
        <Button
          onClick={handleConnect}
          size="lg"
          className={`w-full sm:w-auto h-14 px-8 text-lg rounded-full bg-gradient-to-r from-mood-purple to-mood-cyan hover:opacity-90 shadow-[0_0_30px_rgba(139,92,246,0.3)] text-white border-0 cursor-pointer ${className || ""}`}
        >
          <Headphones className="w-5 h-5 mr-2" aria-hidden="true" />
          Connect Spotify
        </Button>
      </HoverCard>
    );
  }

  return (
    <HoverCard>
      <Button
        onClick={handleConnect}
        className={`bg-white text-black hover:bg-white/90 rounded-full px-6 font-semibold shadow-[0_0_20px_rgba(255,255,255,0.3)] cursor-pointer ${className || ""}`}
      >
        Connect Spotify
      </Button>
    </HoverCard>
  );
}
