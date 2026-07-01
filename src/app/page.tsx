import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ConnectButton } from "@/components/auth/ConnectButton";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks";
import { LandingArchetypes } from "@/components/landing/LandingArchetypes";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingTrust } from "@/components/landing/LandingTrust";
import { ThemeSetter } from "@/components/layout/ThemeSetter";
import { LandingFAQ } from "@/components/landing/LandingFAQ";
import { LandingFinalCTA } from "@/components/landing/LandingFinalCTA";

export default async function LandingPage() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="relative min-h-screen text-white font-sans">
      <ThemeSetter color="#1DB954" force={true} />

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-5 md:px-12 backdrop-blur-md bg-mood-darkest/50 border-b border-white/5 sticky top-0">
        <Link href="#" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image src="/logo/enhanced.png" alt="Melo Logo" width={28} height={28} priority className="w-7 h-7" />
          <span className="text-xl font-bold font-heading tracking-wide">Melo</span>
        </Link>
        <div className="flex items-center gap-4">
          <a
            href="#how-it-works"
            className="text-white/60 hover:text-white text-sm font-medium transition-colors hidden md:block"
          >
            How it works
          </a>
          <a
            href="#archetypes"
            className="text-white/60 hover:text-white text-sm font-medium transition-colors hidden md:block"
          >
            Personalities
          </a>
          <ConnectButton variant="navbar" />
        </div>
      </nav>

      {/* ── Page Sections ────────────────────────────────────────── */}
      <div className="relative z-10">

        {/* 1. Hero — split layout with live interactive demo */}
        <LandingHero />

        {/* Subtle section divider */}
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
          <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
        </div>

        {/* 2. How It Works */}
        <LandingHowItWorks />

        {/* 3. Personality Archetypes */}
        <div id="archetypes" className="pt-16 md:pt-24">
          <LandingArchetypes />
        </div>

        {/* 4. Feature Cards — outcomes */}
        <LandingFeatures />

        {/* 5. Trust & Security */}
        <LandingTrust />

        {/* 6. FAQ */}
        <LandingFAQ />

        {/* 7. Final CTA */}
        <LandingFinalCTA />

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/10 py-8 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4 text-white/60 text-xs bg-black/20 mt-12">
          <div className="flex items-center gap-2">
            <Image src="/logo/enhanced.png" alt="Melo Logo" width={16} height={16} className="w-4 h-4 opacity-80" />
            <span className="font-medium">Melo — Spotify Music Intelligence</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/share/demo-aura" className="hover:text-white/50 transition-colors">View Demo</Link>
            <span>Powered by Spotify API</span>
            <span>Privacy-first · Read-only</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
