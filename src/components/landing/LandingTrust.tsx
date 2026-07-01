"use client";

import { FadeIn, ParallaxLayer } from "@/components/animations/Wrappers";

/**
 * TRUST CARDS — background images
 * Drop your card background images into:
 *   public/trust/
 *
 * Then set the `bg` field on each card below to the filename, e.g.:
 *   bg: "/trust/card-oauth.webp"
 *
 * Leave bg as null/undefined to fall back to a solid color background.
 */
const CARDS = [
  {
    category: "SECURITY",
    title: "Spotify Secure OAuth",
    bottom: "Industry-standard login",
    accent: "#1DB954",
    bg: "/trust/secureauth.webp",
  },
  {
    category: "PRIVACY",
    title: "Read-Only Access",
    bottom: "Cannot modify your Spotify",
    accent: "#06B6D4",
    bg: "/trust/access.webp",
  },
  {
    category: "DATA",
    title: "No Passwords Stored",
    bottom: "Tokens encrypted at rest",
    accent: "#8B5CF6",
    bg: "/trust/password.webp",
  },
  {
    category: "CONTROL",
    title: "Disconnect Anytime",
    bottom: "One click to revoke access",
    accent: "#EC4899",
    bg: "/trust/discconect.webp",
  },
  {
    category: "ETHICS",
    title: "Privacy-First Design",
    bottom: "Your data is never sold",
    accent: "#F59E0B",
    bg: "/trust/privacy.webp",
  },
];

/** Chevron-V icon used in the bottom-right of each card (matches reference) */
function ChevronIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M5 7l5 5 5-5" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LandingTrust() {
  return (
    <section className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-16">
      <ParallaxLayer offset={25}>
        <FadeIn>
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-white mb-2">
              Built on trust
            </h2>
            <p className="text-white/45 text-sm max-w-md mx-auto">
              Your Spotify data stays yours. Melo only reads listening history to generate insights — nothing more.
            </p>
          </div>

          {/* Cards row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {CARDS.map((card, i) => (
              <div
                key={i}
                className="group relative flex flex-col justify-between rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                style={{ aspectRatio: "3/4", minHeight: "220px" }}
              >
                {/* Background image or fallback solid */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage: card.bg ? `url(${card.bg})` : undefined,
                    backgroundColor: card.bg ? undefined : `${card.accent}22`,
                  }}
                />

                {/* Dark overlay for legibility */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between h-full p-4">
                  {/* Top: category label */}
                  <span
                    className="text-[10px] font-bold tracking-widest uppercase"
                    style={{ color: card.accent }}
                  >
                    {card.category}
                  </span>

                  {/* Middle: large title */}
                  <h3 className="text-white font-extrabold font-heading text-xl md:text-2xl leading-tight mt-2">
                    {card.title}
                  </h3>

                  {/* Bottom row: label + chevron icon */}
                  <div className="flex items-center justify-between mt-auto pt-4">
                    <span className="text-white/60 text-[11px] font-medium">{card.bottom}</span>
                    <ChevronIcon color={card.accent} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </ParallaxLayer>
    </section>
  );
}
