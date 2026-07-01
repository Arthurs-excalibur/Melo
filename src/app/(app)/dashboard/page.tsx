"use client";

import { Sparkles, Activity, Disc3, Mic2, Loader2, Check, Users, LogOut, AlertTriangle, ChevronDown, ChevronUp, Copy, ExternalLink } from "lucide-react";
import { FadeIn } from "@/components/animations/Wrappers";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import GalaxyUniverse from "@/components/visualizations/GalaxyUniverse";
import EmotionalJourney from "@/components/visualizations/EmotionalJourney";
import { ErrorState } from "@/components/ui/ErrorState";
import { ThemeSetter } from "@/components/layout/ThemeSetter";

import { useThemeStore } from "@/store/themeStore";
import { OrganicGradientBackground } from "@/components/animations/OrganicGradientBackground";
import { LiquidButton } from "@/components/ui/reveal-button";

type TimeRange = "short_term" | "medium_term" | "long_term";

export default function DashboardPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressStatus, setProgressStatus] = useState<string>("Initializing secure handshake...");
  const [timeRange, setTimeRange] = useState<TimeRange>("medium_term");
  const { data: session } = useSession();
  const [isAuraRevealed, setIsAuraRevealed] = useState(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("auraRevealed") === "true") return true;
    return false;
  });
  const [showShockwave, setShowShockwave] = useState(false);
  const [shockwaveOrigin, setShockwaveOrigin] = useState<{ x: number; y: number } | null>(null);
  const [showAllTracks, setShowAllTracks] = useState(false);
  const [showAllArtists, setShowAllArtists] = useState(false);
  const revealAura = useThemeStore(s => s.revealAura);

  const handleRevealClick = (e: React.MouseEvent) => {
    setShockwaveOrigin({ x: e.clientX, y: e.clientY });
    setIsAuraRevealed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("auraRevealed", "true");
    }
    setShowShockwave(true);
    revealAura(); // Trigger background color transition
    setTimeout(() => setShowShockwave(false), 3500); // Cleanup shockwave after animation
  };

  useEffect(() => {
    if (isAuraRevealed) revealAura();
  }, [isAuraRevealed, revealAura]);

  const [isExporting, setIsExporting] = useState(false);

  const waveVariants: Variants = {
    hidden: { opacity: 0.1, y: 80, filter: "blur(24px)", scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      scale: 1,
      transition: { type: "spring", stiffness: 50, damping: 15, mass: 1 }
    }
  };
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [needsReauth, setNeedsReauth] = useState(false);
  const [reauthMessage, setReauthMessage] = useState<string>("");

  const startAndPoll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    let active = true;
    let timeoutId: NodeJS.Timeout;

    try {
      // 1. Trigger job
      setProgressStatus(`Enqueuing sonic profiling pipeline (${timeRange})...`);
      const startRes = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeRange })
      });

      if (!startRes.ok) throw new Error("Failed to start analysis");
      const startData = await startRes.json();

      // If analysis is already cached, display it immediately
      if (startData.status === "completed") {
        if (active) {
          setData(startData.data);
          setIsLoading(false);
        }
        return;
      }

      const jobId = startData.jobId;

      // 2. Poll job status
      const poll = async () => {
        if (!active) return;
        try {
          const pollRes = await fetch(`/api/analysis?jobId=${jobId}`);
          if (!pollRes.ok) throw new Error("Failed to poll analysis");
          const pollData = await pollRes.json();

          if (pollData.progress && active) {
            setProgressStatus(pollData.progress);
          }

          if (pollData.status === "completed") {
            if (active) {
              setData(pollData.data);
              setIsLoading(false);
            }
          } else if (pollData.status === "failed") {
            throw new Error(pollData.error || "Analysis failed");
          } else {
            // Poll again in 1.5 seconds
            timeoutId = setTimeout(poll, 1500);
          }
        } catch (err) {
          if (active) {
            setError(err instanceof Error ? err.message : "Failed to load your analysis.");
            setIsLoading(false);
          }
        }
      };

      await poll();
    } catch (err) {
      if (active) {
        setError(err instanceof Error ? err.message : "Failed to start analysis.");
        setIsLoading(false);
      }
    }

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [timeRange]);

  useEffect(() => {
    let cleanupFn: (() => void) | undefined;
    const timeoutId = window.setTimeout(() => {
      void startAndPoll().then(fn => {
        cleanupFn = fn;
      });
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      cleanupFn?.();
    };
  }, [startAndPoll]);

  const handleExportPlaylist = async () => {
    if (!data?.shareId) {
      setExportError("Analysis data not ready. Please refresh the page.");
      return;
    }
    setIsExporting(true);
    setExportError(null);
    try {
      const res = await fetch("/api/export-playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareId: data.shareId })
      });
      const result = await res.json();
      if (res.ok && result.url) {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile && result.playlistId) {
          window.location.href = `spotify:playlist:${result.playlistId}`;
        } else {
          window.open(result.url, '_blank', 'noopener,noreferrer');
        }
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 4000);
        if (result.coverUploaded === false && result.coverUploadSkippedReason) {
          setExportError(`Playlist created, but cover art was skipped. ${result.coverUploadSkippedReason}`);
          setTimeout(() => setExportError(null), 8000);
        }
      } else if (res.status === 403 && result.error === "REAUTH_REQUIRED") {
        setNeedsReauth(true);
        setReauthMessage(result.message || "");
      } else {
        setExportError(result.error || result.message || "Failed to create playlist. Please try again.");
        setTimeout(() => setExportError(null), 6000);
      }
    } catch (e) {
      console.error(e);
      setExportError("Network error. Please check your connection and try again.");
      setTimeout(() => setExportError(null), 6000);
    } finally {
      setIsExporting(false);
    }
  };

  const getShareUrl = () => {
    if (!data?.shareId || typeof window === "undefined") return "";
    return `${window.location.origin}/share/${data.shareId}`;
  };

  const handleCopyShareLink = async () => {
    const shareUrl = getShareUrl();
    if (!shareUrl) {
      setExportError("Share link is not ready yet. Please refresh the page.");
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    } catch {
      setExportError("Could not copy the share link. Open it and copy it from the address bar.");
      setTimeout(() => setExportError(null), 6000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-mood-purple/50 blur-xl rounded-full animate-pulse"></div>
          <Loader2 className="w-12 h-12 text-mood-cyan animate-spin relative z-10" />
        </div>
        <p className="text-white/60 font-serif italic text-lg animate-pulse max-w-md text-center px-4">
          {progressStatus}
        </p>
      </div>
    );
  }

  if (error || !data) {
    return <ErrorState message={error || "Failed to load"} onRetry={startAndPoll} />;
  }

  const { aura, topArtists, topTracks, audioDNA, genreGalaxy, moodGraph } = data;

  return (
    <main className="max-w-7xl w-full mx-auto px-6 mt-12 space-y-12 pb-24">
      <ThemeSetter archetype={aura.name} />

      {/* Global Shockwave Pulse */}
      <AnimatePresence>
        {showShockwave && shockwaveOrigin && (
          <motion.div
            key="global-shockwave"
            className="fixed z-50 pointer-events-none flex items-center justify-center mix-blend-screen"
            style={{ top: shockwaveOrigin.y, left: shockwaveOrigin.x }}
            initial={{ x: "-50%", y: "-50%" }}
          >
            {/* Ripple 1 */}
            <motion.div
              initial={{ width: "100px", height: "100px", opacity: 0.4 }}
              animate={{ width: "250vw", height: "250vw", opacity: 0 }}
              transition={{ duration: 2.2, ease: "easeOut" }}
              className="absolute rounded-full bg-transparent blur-3xl"
              style={{ border: "80px solid rgba(255,255,255,0.6)" }}
            />
            {/* Ripple 2 */}
            <motion.div
              initial={{ width: "100px", height: "100px", opacity: 0.5 }}
              animate={{ width: "250vw", height: "250vw", opacity: 0 }}
              transition={{ duration: 2.5, delay: 0.15, ease: "easeOut" }}
              className="absolute rounded-full bg-transparent blur-2xl"
              style={{ border: "60px solid rgba(255,255,255,0.5)" }}
            />
            {/* Ripple 3 */}
            <motion.div
              initial={{ width: "100px", height: "100px", opacity: 0.6 }}
              animate={{ width: "250vw", height: "250vw", opacity: 0 }}
              transition={{ duration: 2.8, delay: 0.3, ease: "easeOut" }}
              className="absolute rounded-full bg-transparent blur-xl"
              style={{ border: "40px solid rgba(255,255,255,0.4)" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Re-auth banner — shown when session is missing playlist scopes */}
      {needsReauth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-mood-darker border border-red-500/30 rounded-2xl p-8 max-w-lg w-full shadow-[0_0_40px_rgba(239,68,68,0.15)] animate-fade-in-up">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg mb-1">Playlist Creation Failed</h3>

                {reauthMessage ? (
                  <p className="text-white/70 text-sm leading-relaxed mb-4">{reauthMessage}</p>
                ) : (
                  <p className="text-white/70 text-sm leading-relaxed mb-4">
                    Spotify refused to create the playlist. This usually means your app is in
                    <strong className="text-white"> Development Mode</strong> and your account hasn&apos;t been added to the allowlist.
                  </p>
                )}

                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-5 space-y-2 text-xs text-white/60">
                  <p className="font-semibold text-white/80 text-sm">How to fix it:</p>
                  <ol className="list-decimal list-inside space-y-1.5">
                    <li>Go to your <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-[#1DB954] underline">Spotify Developer Dashboard</a></li>
                    <li>Open your Melo app → click <strong className="text-white/80">Settings</strong></li>
                    <li>Scroll to <strong className="text-white/80">User Management</strong></li>
                    <li>Add your Spotify account email address</li>
                    <li>Sign out of Melo, then sign back in</li>
                  </ol>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-spotify-green hover:bg-spotify-green/90 text-black font-bold text-sm transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out & Re-authenticate
                  </button>
                  <button
                    onClick={() => setNeedsReauth(false)}
                    className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-sm transition-all"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <div className="inline-flex flex-wrap items-center justify-center p-1 bg-white/5 rounded-full border border-white/10 gap-y-1">
          <button
            onClick={() => setTimeRange("short_term")}
            className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${timeRange === "short_term" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"}`}
          >
            Last 4 Weeks
          </button>
          <button
            onClick={() => setTimeRange("medium_term")}
            className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${timeRange === "medium_term" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"}`}
          >
            Last 6 Months
          </button>
          <button
            onClick={() => setTimeRange("long_term")}
            className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${timeRange === "long_term" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"}`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Hero Identity Card */}
      <FadeIn delay={0.1}>
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-glass p-8 md:p-12 min-h-[350px]">
          <div className="absolute inset-0 bg-gradient-to-br from-mood-purple/20 via-transparent to-mood-cyan/20 opacity-50"></div>

          {/* ── Reveal Overlay ── */}
          <AnimatePresence>
            {!isAuraRevealed && (
              <motion.div
                key="aura-overlay"
                initial={{ opacity: 1 }}
                exit={{
                  clipPath: ["circle(0% at 50% 50%)", "circle(150% at 50% 50%)"],
                  opacity: 0,
                }}
                transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
                className="absolute inset-0 z-30 flex flex-col items-center justify-center overflow-hidden rounded-3xl"
              >
                <OrganicGradientBackground>
                  {/* Text + button */}
                  <div className="relative z-10 flex flex-col items-center gap-5">
                    <motion.p
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.8 }}
                      className="text-white/50 text-xs font-medium tracking-[0.25em] uppercase"
                    >
                      Your musical energy awaits
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <LiquidButton
                        onClick={handleRevealClick}
                        className="font-bold text-white tracking-wide px-10 py-4"
                      >
                        Reveal My Aura
                      </LiquidButton>
                    </motion.div>
                  </div>
                </OrganicGradientBackground>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Card Content (staggered entrance) ── */}
          <motion.div
            className="relative z-10 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 md:gap-12 items-center md:items-start w-full"
            initial={false}
            animate={isAuraRevealed ? "visible" : "hidden"}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.5 } },
            }}
          >
            <motion.div
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } }}
              className="space-y-6 text-center md:text-left w-full order-1 md:order-none md:col-start-1 md:row-start-1"
            >
              <motion.div
                variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "backOut" } } }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-mood-cyan"
              >
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                Aura: {aura.color}
              </motion.div>
              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } }}
              >
                <h1 className="text-4xl md:text-6xl font-bold font-heading mb-4">
                  {aura.name}
                </h1>
                <p className="text-lg md:text-xl text-white/70 max-w-2xl font-serif italic m-0">
                  &ldquo;{aura.description}&rdquo;
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } } }}
              className="w-48 h-48 md:w-64 md:h-64 rounded-full relative flex-shrink-0 flex items-center justify-center mx-auto order-2 md:order-none md:col-start-2 md:row-start-1 md:row-span-2"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-mood-purple via-mood-blue to-mood-cyan blur-2xl opacity-70 animate-slow-spin will-change-transform"></div>
              <div className="absolute inset-4 rounded-full bg-mood-darkest border border-white/20 z-10"></div>
              <div className="relative z-20 text-center">
                <span className="block text-3xl font-bold">{aura.intensity}</span>
                <span className="text-xs text-white/50 uppercase tracking-widest">{aura.intensityLabel}</span>
              </div>
            </motion.div>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 } } }}
              className="order-3 md:order-none md:col-start-1 md:row-start-2"
            >
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center md:justify-start gap-3 w-full">
                  <button
                    onClick={handleCopyShareLink}
                    disabled={!data?.shareId}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white text-black hover:bg-white/90 font-semibold text-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {shareCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {shareCopied ? "Share Link Copied" : "Copy My Share Link"}
                  </button>
                  <Link
                    href={`/share/${data.shareId}`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-sm transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Share Card
                  </Link>
                  <button
                    onClick={handleExportPlaylist}
                    disabled={isExporting || exportSuccess}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-spotify-green hover:bg-spotify-green/90 text-black font-semibold text-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {exportSuccess ? <Check className="w-4 h-4" /> : isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" /></svg>
                    )}
                    {exportSuccess ? "Opened in Spotify!" : "Export Aura Playlist"}
                  </button>
                  <Link
                    href="/compatibility"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-sm transition-all hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                  >
                    <Users className="w-4 h-4" />
                    Compare with a Friend
                  </Link>
              </div>
              {exportError && (
                <p className="text-red-400 text-xs mt-2 flex items-center justify-center md:justify-start gap-1.5">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  {exportError}
                </p>
              )}
            </motion.div>
          </motion.div>
        </section>
      </FadeIn>

      {/* ── Profile Banner ── */}
      <motion.div
        initial={false}
        animate={isAuraRevealed ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 40, filter: "blur(12px)" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      >
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#121212]">
          <div className="relative h-28 md:h-36 flex overflow-hidden">
            {topArtists.slice(0, 8).map((artist: { name: string; imageUrl?: string }, i: number) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img key={i} src={artist.imageUrl ?? ""} alt={artist.name} className="flex-1 min-w-0 h-full object-cover" style={{ filter: "brightness(0.75)" }} />
            ))}
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#121212] to-transparent" />
          </div>
          <div className="px-6 pb-6 md:px-8 md:pb-8 -mt-10 relative z-10 flex items-end gap-5">
            <div className="relative flex-shrink-0">
              {session?.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.image} alt={session?.user?.name || "User"} className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-[#121212] shadow-lg" />
              ) : (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/10 border-4 border-[#121212] shadow-lg flex items-center justify-center">
                  <span className="text-3xl font-bold text-white/60">{session?.user?.name?.[0]?.toUpperCase() ?? "?"}</span>
                </div>
              )}
            </div>
            <div className="pb-1 min-w-0">
              <h2 className="text-2xl md:text-3xl font-bold font-heading text-white truncate leading-tight">{session?.user?.name ?? "Listener"}</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <svg className="w-3.5 h-3.5 text-spotify-green flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
                <span className="text-sm text-white/50">Member since {new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
              </div>
            </div>
          </div>
          <div className="mx-6 md:mx-8 border-t border-white/10" />
          <div className="h-4" />
        </section>
      </motion.div>

      <motion.div
        initial={false}
        animate={isAuraRevealed ? "visible" : "hidden"}
        variants={{
          hidden: { pointerEvents: "none" },
          visible: { pointerEvents: "auto", transition: { staggerChildren: 0.15, delayChildren: 0.8 } }
        }}
        className="space-y-12"
      >
        {/* Dynamic 3D Music Universe */}
        <motion.div variants={waveVariants}>
          <GalaxyUniverse genreGalaxy={genreGalaxy} topArtists={topArtists} userImage={session?.user?.image ?? null} />
        </motion.div>

        <div className="flex flex-col space-y-12">
          {/* Top Tracks */}
          <motion.div variants={waveVariants}>
            <section className="bg-[#121212] rounded-3xl p-6 md:p-8 border border-white/10">
              <div className="flex items-center justify-between mb-6 cursor-pointer group" onClick={() => setShowAllTracks(!showAllTracks)}>
                <div>
                  <h2 className="text-2xl font-bold font-heading text-white">Top Songs</h2>
                  <p className="text-sm text-white/50 mt-1">{session?.user?.name ?? "Listener"}&apos;s top songs</p>
                </div>
                <button className="text-white/50 group-hover:text-white transition-colors p-2 rounded-full hover:bg-white/5">
                  {showAllTracks ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {(showAllTracks ? topTracks : topTracks?.slice(0, 6)).map((track: { id: string; name: string; artist: string; imageUrl?: string }, i: number) => (
                  <div key={track.id || i} className="group relative rounded-xl bg-white/5 hover:bg-white/10 transition-colors p-3 md:p-4 flex flex-col gap-3 border border-white/5">
                    <div className="w-full aspect-square rounded-md overflow-hidden bg-white/10 relative shadow-md">
                      {track.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={track.imageUrl} alt={track.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <Disc3 className="w-8 h-8 text-white/30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </div>
                    <div className="min-w-0 flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white truncate text-sm">{i + 1}. {track.name}</h4>
                      </div>
                      <svg className="w-4 h-4 text-spotify-muted flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
              {(!topTracks || topTracks.length === 0) && (
                <div className="text-center p-6 text-white/50 text-sm">
                  No track data available.
                </div>
              )}
            </section>
          </motion.div>

          {/* Top Artists */}
          <motion.div variants={waveVariants}>
            <section className="bg-[#121212] rounded-3xl p-6 md:p-8 border border-white/10">
              <div className="flex items-center justify-between mb-6 cursor-pointer group" onClick={() => setShowAllArtists(!showAllArtists)}>
                <div>
                  <h2 className="text-2xl font-bold font-heading text-white">Top Artists</h2>
                  <p className="text-sm text-white/50 mt-1">{session?.user?.name ?? "Listener"}&apos;s top artists</p>
                </div>
                <button className="text-white/50 group-hover:text-white transition-colors p-2 rounded-full hover:bg-white/5">
                  {showAllArtists ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {(showAllArtists ? topArtists : topArtists.slice(0, 6)).map((artist: { name: string; role: string; score: string; imageUrl?: string }, i: number) => (
                  <div key={i} className="group relative rounded-xl bg-white/5 hover:bg-white/10 transition-colors p-3 md:p-4 flex flex-col gap-3 border border-white/5">
                    <div className="w-full aspect-square rounded-md overflow-hidden bg-white/10 relative shadow-md">
                      {artist.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={artist.imageUrl} alt={artist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <Mic2 className="w-8 h-8 text-white/30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </div>
                    <div className="min-w-0 flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white truncate text-sm">{i + 1}. {artist.name}</h4>
                      </div>
                      <svg className="w-4 h-4 text-spotify-muted flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Emotional Journey Graph */}
          <motion.div variants={waveVariants} className="lg:col-span-2">
            <section className="rounded-3xl border border-white/10 bg-glass p-8 relative overflow-hidden h-full flex flex-col min-h-[400px]">
              <h2 className="text-2xl font-bold font-heading flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-mood-pink" aria-hidden="true" />
                Emotional Journey
              </h2>
              <EmotionalJourney moodGraph={moodGraph} />
            </section>
          </motion.div>

          {/* Audio DNA */}
          <motion.div variants={waveVariants}>
            <section className="rounded-3xl bg-glass p-8 h-full flex flex-col spotify-glow border border-white/10">
              <h2 className="text-2xl font-bold font-heading mb-6 flex items-center gap-2">
                <Disc3 className="w-5 h-5 text-spotify-green" aria-hidden="true" />
                Audio DNA
              </h2>
              <div className="flex-1 flex flex-col justify-center space-y-5">
                {audioDNA?.dimensions?.map((dim: { label: string; value: number; description: string }, idx: number) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-medium text-white/80">{dim.label}</span>
                      <span className="text-sm font-bold text-spotify-green">{dim.value}%</span>
                    </div>
                    <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${dim.value}%`,
                          background: `linear-gradient(90deg, #1DB954 0%, #159c42 100%)`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-spotify-muted">{dim.description}</p>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        </div>

      </motion.div>
    </main>
  );
}
