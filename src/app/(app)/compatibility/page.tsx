"use client";

import { useState, useCallback, useEffect } from "react";
import { FadeIn } from "@/components/animations/Wrappers";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Loader2,
  Sparkles,
  ArrowRight,
  Share2,
  Heart,
  Music,
  Zap,
  Copy,
  Check,
  Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";

interface CompatibilityData {
  score: number;
  label: string;
  breakdown: {
    genreSimilarity: number;
    emotionalAlignment: number;
    artistOverlap: number;
    energyMatch: number;
  };
  insight: string;
  shareMessage: string;
}

const breakdownMeta = [
  {
    key: "genreSimilarity" as const,
    label: "Genre DNA",
    icon: Music,
    gradient: "from-mood-purple to-mood-pink",
    description: "How closely your genre galaxies overlap",
  },
  {
    key: "emotionalAlignment" as const,
    label: "Emotional Sync",
    icon: Heart,
    gradient: "from-mood-pink to-rose-400",
    description: "The alignment of your emotional frequency",
  },
  {
    key: "artistOverlap" as const,
    label: "Artist Overlap",
    icon: Users,
    gradient: "from-mood-cyan to-mood-blue",
    description: "How many core artists you share",
  },
  {
    key: "energyMatch" as const,
    label: "Energy Match",
    icon: Zap,
    gradient: "from-yellow-400 to-orange-500",
    description: "How similar your sonic energy levels are",
  },
];

function AnimatedScore({ score }: { score: number }) {
  const [displayed, setDisplayed] = useState(0);

  // Animate the number counting up
  useEffect(() => {
    let current = 0;
    const step = Math.ceil(score / 40);
    const interval = setInterval(() => {
      current += step;
      if (current >= score) {
        current = score;
        clearInterval(interval);
      }
      setDisplayed(current);
    }, 30);
    return () => clearInterval(interval);
  }, [score]);

  const scoreColor =
    score >= 85
      ? "text-emerald-400"
      : score >= 70
        ? "text-mood-cyan"
        : score >= 55
          ? "text-mood-purple"
          : score >= 40
            ? "text-yellow-400"
            : "text-orange-400";

  return (
    <div className="relative flex items-center justify-center">
      {/* Glow rings */}
      <div className="absolute w-56 h-56 rounded-full bg-gradient-to-tr from-mood-purple/30 via-mood-cyan/20 to-mood-pink/30 blur-3xl animate-pulse" />
      <div className="absolute w-44 h-44 rounded-full border border-white/10" />
      <div className="absolute w-52 h-52 rounded-full border border-white/5 animate-slow-spin" />

      <div className="relative z-10 w-48 h-48 rounded-full bg-mood-darkest/80 border-2 border-white/10 flex flex-col items-center justify-center backdrop-blur-sm">
        <span className={`text-6xl font-bold font-heading ${scoreColor}`}>
          {displayed}
        </span>
        <span className="text-xs text-white/50 uppercase tracking-[0.3em]">
          percent
        </span>
      </div>
    </div>
  );
}

export default function CompatibilityPage() {
  const [shareInput, setShareInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState("Initializing...");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompatibilityData | null>(null);
  const [copied, setCopied] = useState(false);

  const extractShareId = (input: string): string => {
    // Handle full URLs like /share/abc123
    const urlMatch = input.match(/share\/([a-zA-Z0-9_-]+)/);
    if (urlMatch) return urlMatch[1];
    // Otherwise treat the whole input as a share ID
    return input.trim();
  };

  const handleCompare = useCallback(async () => {
    const shareId = extractShareId(shareInput);
    if (!shareId) {
      setError("Please enter a valid share link or ID.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setProgress("Connecting to the sonic comparison engine...");

    try {
      // 1. Start the compatibility job
      const startRes = await fetch("/api/compatibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareId }),
      });

      if (!startRes.ok) {
        const errData = await startRes.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to start compatibility check.");
      }

      const startData = await startRes.json();
      if (startData.status === "completed") {
        setResult(startData.data as CompatibilityData);
        return;
      }

      const { jobId } = startData;
      if (!jobId) {
        throw new Error("Compatibility check did not return a job.");
      }
      setProgress("Analyzing your music DNA side-by-side...");

      // 2. Poll for results
      let attempts = 0;
      const maxAttempts = 60;

      const poll = async (): Promise<CompatibilityData> => {
        if (attempts >= maxAttempts) {
          throw new Error("Compatibility check timed out. Please try again.");
        }
        attempts++;

        const pollRes = await fetch(`/api/compatibility?jobId=${jobId}`);
        if (!pollRes.ok) throw new Error("Failed to poll compatibility result.");

        const pollData = await pollRes.json();

        if (pollData.status === "completed") {
          return pollData.data as CompatibilityData;
        } else if (pollData.status === "failed") {
          throw new Error(pollData.error || "Compatibility check failed.");
        } else {
          if (attempts > 5) setProgress("Crunching the numbers on your shared vibes...");
          if (attempts > 15) setProgress("Consulting the AI music oracle...");
          await new Promise((r) => setTimeout(r, 2000));
          return poll();
        }
      };

      const data = await poll();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }, [shareInput]);

  const handleCopyMessage = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.shareMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="max-w-3xl w-full mx-auto px-6 mt-12 space-y-8 pb-24">
      {/* Header */}
      <FadeIn delay={0.1}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-mood-purple to-mood-pink flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-heading">Music Compatibility</h1>
            <p className="text-white/60">
              Compare your sonic DNA with a friend&apos;s.
            </p>
          </div>
        </div>
      </FadeIn>

      {/* Input Section */}
      <FadeIn delay={0.2}>
        <section className="bg-glass rounded-3xl p-8 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <LinkIcon className="w-4 h-4 text-mood-cyan" />
            <h2 className="text-lg font-semibold">Enter Share Link</h2>
          </div>
          <p className="text-sm text-white/50 mb-6">
            Paste your friend&apos;s Melo share link or share ID to see how
            your music tastes compare.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={shareInput}
              onChange={(e) => setShareInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isLoading && handleCompare()}
              placeholder="e.g., https://melo.app/share/abc123 or abc123"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-mood-purple/50 focus:border-mood-purple/50 transition-all"
              disabled={isLoading}
            />
            <button
              onClick={handleCompare}
              disabled={isLoading || !shareInput.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-mood-purple to-mood-pink text-white font-semibold text-sm transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              Compare
            </button>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}
        </section>
      </FadeIn>

      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center py-16 space-y-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-mood-purple/50 blur-xl rounded-full animate-pulse" />
              <Loader2 className="w-12 h-12 text-mood-cyan animate-spin relative z-10" />
            </div>
            <p className="text-white/60 font-serif italic text-lg animate-pulse text-center">
              {progress}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 80 }}
            className="space-y-8"
          >
            {/* Score Hero */}
            <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-glass p-8 md:p-12">
              <div className="absolute inset-0 bg-gradient-to-br from-mood-purple/20 via-transparent to-mood-pink/20 opacity-50" />
              <div className="relative z-10 flex flex-col items-center gap-6 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-mood-cyan">
                  <Sparkles className="w-3.5 h-3.5" />
                  Compatibility Result
                </div>

                <AnimatedScore score={result.score} />

                <div className="space-y-2 mt-2">
                  <h2 className="text-3xl md:text-4xl font-bold font-heading">
                    {result.label}
                  </h2>
                  <p className="text-white/70 max-w-lg font-serif italic text-lg">
                    &ldquo;{result.insight}&rdquo;
                  </p>
                </div>

                {/* Share Message */}
                <button
                  onClick={handleCopyMessage}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-sm text-white/70 hover:text-white transition-all mt-2"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied ? "Copied!" : "Share Result"}
                </button>
              </div>
            </section>

            {/* Breakdown */}
            <section className="space-y-4">
              <h3 className="text-xl font-bold font-heading flex items-center gap-2">
                <Share2 className="w-5 h-5 text-mood-cyan" />
                Compatibility Breakdown
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {breakdownMeta.map((dim, idx) => {
                  const Icon = dim.icon;
                  const value =
                    result.breakdown[dim.key];
                  return (
                    <motion.div
                      key={dim.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * idx, type: "spring", stiffness: 100 }}
                      className="bg-glass rounded-2xl border border-white/10 p-6 space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${dim.gradient} flex items-center justify-center`}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-white">
                            {dim.label}
                          </h4>
                          <p className="text-xs text-white/40">{dim.description}</p>
                        </div>
                        <span className="text-xl font-bold font-heading text-white">
                          {value}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${value}%` }}
                          transition={{
                            duration: 1,
                            delay: 0.2 + 0.1 * idx,
                            ease: "easeOut",
                          }}
                          className={`h-full rounded-full bg-gradient-to-r ${dim.gradient}`}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* CTA */}
            <div className="flex justify-center pt-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-white font-medium text-sm transition-all"
              >
                Back to Dashboard
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state - show when no result and not loading */}
      {!result && !isLoading && !error && (
        <FadeIn delay={0.3}>
          <div className="text-center py-12 space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Users className="w-10 h-10 text-white/20" />
            </div>
            <p className="text-white/40 text-sm max-w-md mx-auto">
              Ask a friend to share their Melo analysis link, then paste it
              above to see how your music tastes compare.
            </p>
          </div>
        </FadeIn>
      )}
    </main>
  );
}
