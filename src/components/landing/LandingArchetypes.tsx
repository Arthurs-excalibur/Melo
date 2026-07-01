"use client";

import { FadeIn } from "@/components/animations/Wrappers";

const ARCHETYPES = [
  { name: "Bass Tripper", image: "/archetypes/bass%20tripper%202.webp", glow: "#39FF14" },
  { name: "Chaotic Neutral", image: "/archetypes/chaotic%20neutral.webp", glow: "#FF00FF" },
  { name: "Genre Nomad", image: "/archetypes/genre%20nomad.webp", glow: "#06B6D4" },
  { name: "Golden Hour Dreamer", image: "/archetypes/golden%20hour%20dreamer.webp", glow: "#FFDAB9" },
  { name: "Golden Hour Dreamer 2", image: "/archetypes/golden%20hour%20dreamer%202.webp", glow: "#FFDAB9" },
  { name: "Melody Weaver", image: "/archetypes/melody%20weaver.webp", glow: "#FF69B4" },
  { name: "Midnight Explorer", image: "/archetypes/midnight%20explorer.webp", glow: "#8B5CF6" },
  { name: "Nostalgia Tripper", image: "/archetypes/nostalgia%20tripper.webp", glow: "#FFBF00" },
  { name: "Serotonin Chaser", image: "/archetypes/seratonin%20chaser.webp", glow: "#FFD700" },
  { name: "Sonic Time Traveler", image: "/archetypes/sonic%20time%20travler.webp", glow: "#800020" },
  { name: "The Main Character", image: "/archetypes/the%20main%20character.webp", glow: "#DC143C" },
  { name: "Underground Scholar", image: "/archetypes/underground%20scholar.webp", glow: "#6A5ACD" },
  { name: "Underground Scholar 2", image: "/archetypes/underground%20schoolar%202.webp", glow: "#6A5ACD" },
  { name: "Vibe Curator", image: "/archetypes/vibe%20currator.webp", glow: "#00FA9A" },
];

// Duplicate to fill the entire 360 degree circle seamlessly
const DISPLAY_ARCHETYPES = [...ARCHETYPES, ...ARCHETYPES];

export function LandingArchetypes() {
  return (
    <section className="relative z-10 w-full min-h-[700px] flex flex-col items-center pt-24 max-w-7xl mx-auto">
      {/* Mask wrapper — overflow-visible so cards are never clipped */}
      <div 
        className="absolute top-[-50px] md:top-[-200px] left-1/2 -translate-x-1/2 pointer-events-none flex items-center justify-center"
        style={{ 
          width: 'min(160vw, 1600px)',
          height: 'min(160vw, 1600px)',
          maskImage: 'linear-gradient(to bottom, black 30%, transparent 60%)', 
          WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent 60%)' 
        }}
      >
        {/* The infinitely rotating arc container */}
        <div 
          className="relative rounded-full pointer-events-auto"
          style={{
            width: 'min(130vw, 1300px)',
            height: 'min(130vw, 1300px)',
            animation: "spin 90s linear infinite"
          }}
        >
        {DISPLAY_ARCHETYPES.map((a, i) => {
          const angle = (i * 360) / DISPLAY_ARCHETYPES.length;
          return (
            <div
              key={`${a.name}-${i}`}
              className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center justify-start"
              style={{
                transform: `rotate(${angle}deg)`,
                transformOrigin: '50% min(65vw, 650px)',
              }}
            >
              {/* Card Image Wrapper */}
              <div 
                className="relative w-24 h-24 md:w-32 md:h-32 rounded-[2rem] overflow-hidden border border-white/10"
                style={{
                  boxShadow: `0 0 35px 5px ${a.glow}44, inset 0 0 15px ${a.glow}33`
                }}
              >
                {/* Fallback avatar if the image doesn't exist yet */}
                <img 
                  src={a.image} 
                  alt={a.name} 
                  className="w-full h-full object-cover bg-[#111]" 
                  onError={(e) => { 
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(a.name)}&background=111&color=fff&size=200`;
                  }} 
                />
              </div>
            </div>
          );
        })}
      </div>
      </div>

      {/* Center Content */}
      <div className="relative z-10 text-center mt-[250px] md:mt-[350px] px-6 max-w-2xl mx-auto pointer-events-none">
        <FadeIn>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-6 tracking-tight">
            Which one <br/> <span className="text-gradient">are you?</span>
          </h2>
          <p className="text-lg md:text-xl text-white/60 mb-8 max-w-xl mx-auto leading-relaxed">
            Melo distills your entire listening history into an identity. Hover to explore — then connect Spotify to discover yours.
          </p>
          <div className="pointer-events-auto">
            <button className="px-8 py-3.5 rounded-full bg-white text-black font-bold text-lg hover:scale-105 active:scale-95 transition-transform duration-300 shadow-[0_0_30px_rgba(255,255,255,0.3)]">
              Discover Your Aura
            </button>
          </div>
        </FadeIn>
      </div>

    </section>
  );
}
