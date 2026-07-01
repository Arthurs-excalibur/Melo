const fs = require('fs');
const path = require('path');

const content = `"use client";

import { FadeIn, StaggerContainer, StaggerItem, ParallaxLayer } from "@/components/animations/Wrappers";

const STEPS = [
  {
    num: "01",
    label: "Auth",
    meta: "Secure OAuth",
    color: "#1DB954",
    gradient: "radial-gradient(circle at 80% 20%, rgba(29, 185, 84, 0.65) 0%, transparent 55%), radial-gradient(circle at 40% 35%, rgba(168, 255, 120, 0.35) 0%, transparent 60%), radial-gradient(circle at 70% 10%, rgba(255, 255, 255, 0.25) 0%, transparent 30%), #080808",
    title: "Connect Spotify",
    desc: "One click. Secure OAuth — we never see your password.",
  },
  {
    num: "02",
    label: "Scan",
    meta: "Full History",
    color: "#06B6D4",
    gradient: "radial-gradient(circle at 80% 20%, rgba(6, 182, 212, 0.65) 0%, transparent 55%), radial-gradient(circle at 40% 35%, rgba(132, 250, 176, 0.35) 0%, transparent 60%), radial-gradient(circle at 70% 10%, rgba(255, 255, 255, 0.25) 0%, transparent 30%), #080808",
    title: "AI Scans Your History",
    desc: "Years of listening history analyzed in seconds — genres, moods, trends.",
  },
  {
    num: "03",
    label: "Aura",
    meta: "5 Archetypes",
    color: "#8B5CF6",
    gradient: "radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.65) 0%, transparent 55%), radial-gradient(circle at 40% 35%, rgba(255, 122, 154, 0.35) 0%, transparent 60%), radial-gradient(circle at 70% 10%, rgba(255, 255, 255, 0.25) 0%, transparent 30%), #080808",
    title: "Your Personality Emerges",
    desc: "AI assembles your unique music identity — from Midnight Explorer to Genre Nomad.",
  },
  {
    num: "04",
    label: "Space",
    meta: "3D Universe",
    color: "#EC4899",
    gradient: "radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.65) 0%, transparent 55%), radial-gradient(circle at 40% 35%, rgba(255, 154, 158, 0.35) 0%, transparent 60%), radial-gradient(circle at 70% 10%, rgba(255, 255, 255, 0.25) 0%, transparent 30%), #080808",
    title: "Explore Your Universe",
    desc: "Drag genre planets, hover artist constellations, and deep-dive into your audio DNA.",
  },
  {
    num: "05",
    label: "Share",
    meta: "PNG Export",
    color: "#F59E0B",
    gradient: "radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.65) 0%, transparent 55%), radial-gradient(circle at 40% 35%, rgba(253, 160, 133, 0.35) 0%, transparent 60%), radial-gradient(circle at 70% 10%, rgba(255, 255, 255, 0.25) 0%, transparent 30%), #080808",
    title: "Share Your Aura",
    desc: "Generate your music identity card. Export it. Challenge friends to compare.",
  },
];

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-24">
      <ParallaxLayer offset={30}>
        <FadeIn>
          <div className="text-center mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs font-semibold tracking-widest uppercase">
              How It Works
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-heading">
              From Spotify to insights <span className="text-gradient">in 30 seconds</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">No setup. No forms. Just connect and discover what years of music reveals about you.</p>
          </div>
        </FadeIn>

        <StaggerContainer className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-3">
            {STEPS.map((step, i) => {
              return (
                <StaggerItem key={i}>
                  <div
                    className="relative w-full rounded-[2rem] overflow-hidden group hover:-translate-y-2 transition-all duration-500 shadow-2xl border border-white/[0.06]"
                    style={{ background: "#0a0a0a" }}
                  >
                    {/* Top gradient zone */}
                    <div
                      className="relative w-full"
                      style={{ paddingTop: "80%", background: step.gradient }}
                    >
                      {/* Noise texture */}
                      <div
                        className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
                        style={{
                          backgroundImage: \`url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")\`,
                        }}
                      />

                      {/* App label top-right */}
                      <div className="absolute top-4 right-4 text-right">
                        <p className="text-white text-[11px] font-bold tracking-tight opacity-90 leading-tight">Moodify App</p>
                        <p className="text-white/60 text-[10px] font-medium leading-tight mt-0.5">Step {step.num}</p>
                      </div>

                      {/* Big ghost number bottom-left of gradient area */}
                      <div className="absolute bottom-4 left-5">
                        <span
                          className="font-extrabold leading-none tracking-tighter select-none"
                          style={{
                            fontSize: "clamp(3rem, 5vw, 4rem)",
                            color: "rgba(255,255,255,0.12)",
                          }}
                        >
                          {step.num}
                        </span>
                      </div>
                    </div>

                    {/* Bottom content zone */}
                    <div className="px-5 pt-4 pb-5">
                      {/* Label + meta row */}
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-md"
                          style={{
                            color: step.color,
                            background: step.color + "18",
                            border: "1px solid " + step.color + "30",
                          }}
                        >
                          {step.label}
                        </span>
                        <span className="text-white/35 text-[10px] font-semibold tracking-wide">{step.meta}</span>
                      </div>

                      {/* Title */}
                      <h3 className="text-white text-[15px] font-extrabold tracking-tight leading-snug mb-2">
                        {step.title}
                      </h3>

                      {/* Description */}
                      <p className="text-white/50 text-[12px] font-medium leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </div>
        </StaggerContainer>
      </ParallaxLayer>
    </section>
  );
}
`;

const target = path.join(__dirname, '..', 'src', 'components', 'landing', 'LandingHowItWorks.tsx');
fs.writeFileSync(target, content, 'utf8');
console.log('Written successfully:', target);
console.log('Lines:', content.split('\n').length);
