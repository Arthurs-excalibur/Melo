"use client";

import { useEffect, useState } from "react";
import { FadeIn, ParallaxLayer } from "@/components/animations/Wrappers";

const FAQS = [
  {
    q: "Is my Spotify data safe?",
    a: "Yes. Melo uses Spotify's official OAuth flow — we never see your password. We only request read-only scopes to access your listening history. Your data is not shared or sold to any third party.",
    meta: "Security",
  },
  {
    q: "What data does Melo access?",
    a: "Only your top tracks, top artists, and recently played history — all read-only. We don't access your playlists without permission, and we cannot modify, add, or delete anything from your Spotify account.",
    meta: "Privacy",
  },
  {
    q: "How accurate is the AI analysis?",
    a: "Melo uses your actual Spotify listening data — not quizzes or assumptions. The AI distills patterns across months or years of real listening behavior, so the more you use Spotify, the more detailed your profile becomes.",
    meta: "AI",
  },
  {
    q: "Is Melo free?",
    a: "Yes, Melo is completely free to use. Simply connect your Spotify account and your full music personality profile is generated instantly at no cost.",
    meta: "Pricing",
  },
  {
    q: "Can I delete my data?",
    a: "Absolutely. You can disconnect Spotify from the Settings page at any time. This immediately revokes our access token and removes your cached analysis data from our servers.",
    meta: "Control",
  },
];

const STYLE_ID = "moodify-faq-animations";

function injectStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.innerHTML = `
    @keyframes mfaq-fade-up {
      0%   { transform: translate3d(0, 20px, 0); opacity: 0; filter: blur(6px); }
      60%  { filter: blur(0); }
      100% { transform: translate3d(0, 0, 0); opacity: 1; filter: blur(0); }
    }
    @keyframes mfaq-beam-spin {
      0%   { transform: rotate(0deg) scale(1); }
      100% { transform: rotate(360deg) scale(1); }
    }
    @keyframes mfaq-pulse {
      0%   { transform: scale(0.7); opacity: 0.55; }
      60%  { opacity: 0.1; }
      100% { transform: scale(1.25); opacity: 0; }
    }
    @keyframes mfaq-meter {
      0%,20%    { transform: scaleX(0); transform-origin: left; }
      45%,60%   { transform: scaleX(1); transform-origin: left; }
      80%,100%  { transform: scaleX(0); transform-origin: right; }
    }
    @keyframes mfaq-tick {
      0%,30%  { transform: translateX(-6px); opacity: 0.4; }
      50%     { transform: translateX(2px); opacity: 1; }
      100%    { transform: translateX(20px); opacity: 0; }
    }

    .mfaq-intro {
      position: relative; display: flex; align-items: center; gap: 0.85rem;
      padding: 0.85rem 1.4rem; border-radius: 9999px; overflow: hidden;
      border: 1px solid rgba(255,255,255,0.12); background: rgba(12,12,12,0.42);
      color: rgba(248,250,252,0.92); text-transform: uppercase; letter-spacing: 0.35em;
      font-size: 0.65rem; width: 100%; max-width: 24rem; margin: 0 auto;
      mix-blend-mode: screen; opacity: 0; transform: translate3d(0,12px,0);
      filter: blur(8px); transition: opacity 720ms ease, transform 720ms ease, filter 720ms ease;
      isolation: isolate;
    }
    .mfaq-intro--active { opacity: 1; transform: translate3d(0,0,0); filter: blur(0); }

    .mfaq-intro__beam, .mfaq-intro__pulse { position: absolute; inset: -110%; pointer-events: none; border-radius: 50%; }
    .mfaq-intro__beam {
      background: conic-gradient(from 160deg, rgba(226,232,240,0.25), transparent 32%, rgba(148,163,184,0.22) 58%, transparent 78%, rgba(148,163,184,0.18));
      animation: mfaq-beam-spin 18s linear infinite; opacity: 0.55;
    }
    .mfaq-intro__pulse { border: 1px solid currentColor; opacity: 0.25; animation: mfaq-pulse 3.4s ease-out infinite; }
    .mfaq-intro__label { position: relative; z-index: 1; font-weight: 600; letter-spacing: 0.4em; }
    .mfaq-intro__meter {
      position: relative; z-index: 1; flex: 1 1 auto; height: 1px;
      background: linear-gradient(90deg, transparent, currentColor 35%, transparent 85%);
      transform: scaleX(0); transform-origin: left;
      animation: mfaq-meter 5.8s ease-in-out infinite; opacity: 0.7;
    }
    .mfaq-intro__tick {
      position: relative; z-index: 1; width: 0.55rem; height: 0.55rem;
      border-radius: 9999px; background: currentColor;
      box-shadow: 0 0 0 4px rgba(255,255,255,0.1);
      animation: mfaq-tick 3.2s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
}

function setGlow(e: React.MouseEvent<HTMLLIElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--fx", `${e.clientX - r.left}px`);
  el.style.setProperty("--fy", `${e.clientY - r.top}px`);
}
function clearGlow(e: React.MouseEvent<HTMLLIElement>) {
  e.currentTarget.style.removeProperty("--fx");
  e.currentTarget.style.removeProperty("--fy");
}

export function LandingFAQ() {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [introReady, setIntroReady] = useState(false);

  useEffect(() => {
    injectStyles();
    const frame = requestAnimationFrame(() => setIntroReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const toggle = (i: number) => setActiveIdx((prev) => (prev === i ? -1 : i));

  return (
    <section className="relative z-10 w-full max-w-4xl mx-auto px-6 md:px-12 py-24">
      <ParallaxLayer offset={30}>
        <FadeIn>
          {/* Animated pill badge */}
          <div className={`mfaq-intro mb-12 ${introReady ? "mfaq-intro--active" : ""}`}>
            <span className="mfaq-intro__beam" aria-hidden="true" />
            <span className="mfaq-intro__pulse" aria-hidden="true" />
            <span className="mfaq-intro__label">FAQ</span>
            <span className="mfaq-intro__meter" aria-hidden="true" />
            <span className="mfaq-intro__tick" aria-hidden="true" />
          </div>

          {/* Header */}
          <div className="text-center mb-14 space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold font-heading">
              Questions you&apos;ll probably <span className="text-gradient">ask anyway</span>
            </h2>
            <p className="text-white/40 text-sm max-w-md mx-auto">
              Everything you need to know about Melo, your data, and how it all works.
            </p>
          </div>

          {/* FAQ list */}
          <ul className="space-y-4">
            {FAQS.map((faq, i) => {
              const open = activeIdx === i;
              const panelId = `faq-panel-${i}`;
              const btnId = `faq-btn-${i}`;

              return (
                <li
                  key={i}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_36px_140px_-60px_rgba(10,10,10,0.95)] transition-all duration-500 hover:-translate-y-0.5"
                  onMouseMove={setGlow}
                  onMouseLeave={clearGlow}
                >
                  {/* Mouse-follow radial glow */}
                  <div
                    className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                    style={{ background: "radial-gradient(240px circle at var(--fx, 50%) var(--fy, 50%), rgba(255,255,255,0.07), transparent 70%)" }}
                  />

                  <button
                    type="button"
                    id={btnId}
                    aria-controls={panelId}
                    aria-expanded={open}
                    onClick={() => toggle(i)}
                    className="relative flex w-full items-start gap-4 sm:gap-6 px-4 sm:px-8 py-5 sm:py-7 text-left transition-colors duration-300"
                  >
                    {/* Animated circle icon */}
                    <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 transition-all duration-500 group-hover:scale-105">
                      <span className={`pointer-events-none absolute inset-0 rounded-full border border-white/20 opacity-30 ${open ? "animate-ping" : ""}`} />
                      <svg
                        className={`relative h-5 w-5 text-white transition-transform duration-500 ${open ? "rotate-45" : ""}`}
                        viewBox="0 0 24 24" fill="none"
                      >
                        <path d="M12 5v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </span>

                    <div className="flex flex-1 flex-col gap-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                        <h3 className="text-lg font-medium leading-tight text-white sm:text-xl">
                          {faq.q}
                        </h3>
                        {faq.meta && (
                          <span className="inline-flex w-fit items-center rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-white/40 sm:ml-auto">
                            {faq.meta}
                          </span>
                        )}
                      </div>

                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={btnId}
                        className={`overflow-hidden text-sm leading-relaxed text-white/50 transition-[max-height] duration-500 ease-out ${open ? "max-h-64" : "max-h-0"}`}
                      >
                        <p className="pr-2">{faq.a}</p>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </FadeIn>
      </ParallaxLayer>
    </section>
  );
}
