import { Music, Sparkles } from "lucide-react";
import { FadeIn } from "@/components/animations/Wrappers";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getShareCard } from "@/lib/share/engine";
import { type EmotionalProfile } from "@/lib/analysis/engine";
import { ThemeSetter } from "@/components/layout/ThemeSetter";
import { ShareActions } from "@/components/share/ShareActions";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const card = await getShareCard(id);
  
  if (!card) return { title: "Melo | Share Card Not Found" };

  return {
    title: `${card.moodTitle} | Melo Aura`,
    description: `Check out my Spotify aura: ${card.auraColor}. ${card.auraDescription}`,
    openGraph: {
      title: `${card.moodTitle} | Melo Aura`,
      description: card.auraDescription,
      images: ['/api/og/share'], // Example OG route
    }
  };
}

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = await getShareCard(id);

  if (!card) {
    notFound();
  }

  const emotionalProfile = card.emotionalProfile as unknown as EmotionalProfile;
  const intensity = emotionalProfile.energy > 0.6 ? "Intense" : "Calm";
  const intensityScore = Math.round(emotionalProfile.energy * 100) + "%";

  return (
    <main className="max-w-4xl mx-auto px-6 mt-12 w-full flex flex-col items-center">
      <ThemeSetter archetype={card.moodTitle} />
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">Your Identity Card</h1>
        <p className="text-white/60 text-lg max-w-lg mx-auto">
          Ready to show the world your emotional soundtrack? Pick a format and share it on your socials.
        </p>
      </div>

      {/* Shareable Card Wrapper */}
      <FadeIn delay={0.2} className="w-full max-w-sm">
        <div className="relative w-full aspect-[9/16] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.3)] border border-white/20 bg-black flex flex-col p-8">
          {/* Card Background Effects */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-mood-darkest to-black"></div>
            <div className="absolute top-[-20%] right-[-20%] w-[150%] h-[150%] bg-gradient-to-b from-mood-purple/40 via-mood-cyan/20 to-transparent blur-[80px] rounded-full mix-blend-screen will-change-transform"></div>
            <div className="absolute bottom-0 left-0 w-full h-[50%] bg-gradient-to-t from-black via-black/80 to-transparent z-10"></div>
          </div>

          {/* Card Content */}
          <div className="relative z-20 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-white/70" aria-hidden="true" />
                <span className="font-bold text-sm tracking-widest text-white/90">MELO</span>
              </div>
              <span className="text-xs font-mono text-white/50 border border-white/20 rounded-full px-2 py-0.5">{new Date(card.createdAt).getFullYear()}</span>
            </div>

            <div className="text-center space-y-6 mt-12">
              <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-tr from-mood-purple via-mood-blue to-mood-cyan blur-md animate-slow-spin flex items-center justify-center relative will-change-transform">
                <div className="absolute inset-2 bg-black rounded-full z-10"></div>
                <Sparkles className="w-10 h-10 text-white z-20" aria-hidden="true" />
              </div>
              
              <div>
                <h2 className="text-3xl font-bold font-heading mb-2">{card.moodTitle}</h2>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-medium backdrop-blur-md">
                  <div className="w-2 h-2 rounded-full bg-mood-cyan shadow-[0_0_10px_rgba(6,182,212,1)]"></div>
                  {card.auraColor} Aura
                </div>
              </div>
            </div>

            <div className="space-y-6 mb-4">
              <p className="text-lg font-serif italic text-white/80 text-center line-clamp-3">
                &ldquo;{card.auraDescription}&rdquo;
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/5">
                  <span className="block text-[10px] uppercase text-white/50 mb-1">Top Genre</span>
                  <span className="font-bold text-sm truncate">{card.topGenres[0] || "Unknown"}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/5">
                  <span className="block text-[10px] uppercase text-white/50 mb-1">Vibe Score</span>
                  <span className="font-bold text-sm truncate">{intensityScore} {intensity}</span>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <span className="text-[10px] text-white/30 uppercase tracking-widest">melo.app / @{card.user?.name?.toLowerCase().replace(/\s/g, '')}</span>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Action Buttons */}
      <FadeIn delay={0.4} className="flex flex-col sm:flex-row gap-4 mt-12 w-full max-w-sm">
        <ShareActions
          title={`${card.moodTitle} | Melo Aura`}
          text={`Check out my ${card.auraColor} Melo aura.`}
        />
      </FadeIn>
    </main>
  );
}
