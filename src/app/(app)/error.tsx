"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold font-heading">Something went wrong!</h2>
        <p className="text-white/60">We lost connection to the aura stream.</p>
      </div>
      <Button onClick={() => reset()} className="bg-white text-black hover:bg-white/90 rounded-full px-6">
        Try Again
      </Button>
    </div>
  );
}
