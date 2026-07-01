"use client";

import { useThemeStore } from "@/store/themeStore";
import { Palette, Check, X } from "lucide-react";
import { HoverCard } from "@/components/animations/Wrappers";

export function ThemeButton() {
  const { isManualOverride } = useThemeStore();

  return (
    <HoverCard>
      <button
        className="w-10 h-10 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 backdrop-blur-sm bg-white/5 border border-white/10 hover:border-white/30 transition-all group relative"
        aria-label="Change Theme"
      >
        <Palette className="w-5 h-5 transition-colors group-hover:text-white" />
        {isManualOverride && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-mood-cyan border border-mood-darkest rounded-full" />
        )}
      </button>
    </HoverCard>
  );
}

interface Archetype {
  name: string;
  color: string;
  gradient: string;
}

const ARCHETYPES: Archetype[] = [
  { name: "Midnight Explorer", color: "#4B0082", gradient: "linear-gradient(135deg, #1a0533 0%, #4B0082 50%, #9b4dca 100%)" },
  { name: "Genre Nomad", color: "#00CED1", gradient: "linear-gradient(135deg, #003d40 0%, #00CED1 50%, #66e5e8 100%)" },
  { name: "Nostalgic Dreamer", color: "#DAA520", gradient: "linear-gradient(135deg, #3d2e00 0%, #DAA520 50%, #f5d76e 100%)" },
  { name: "Rhythm Addict", color: "#FF4500", gradient: "linear-gradient(135deg, #4d1200 0%, #FF4500 50%, #ff7340 100%)" },
  { name: "Euphoric Explorer", color: "#FF00FF", gradient: "linear-gradient(135deg, #4d004d 0%, #FF00FF 50%, #ff80ff 100%)" },
  { name: "Melancholic Poet", color: "#1E3A8A", gradient: "linear-gradient(135deg, #0a1628 0%, #1E3A8A 50%, #4a7add 100%)" },
  { name: "Calm Observer", color: "#2E8B57", gradient: "linear-gradient(135deg, #0d2b1a 0%, #2E8B57 50%, #5ccf8a 100%)" },
  { name: "Intense Creator", color: "#DC143C", gradient: "linear-gradient(135deg, #420612 0%, #DC143C 50%, #f04a6a 100%)" },
];

export function ThemePanel({ onClose, className }: { onClose?: () => void, className?: string }) {
  const { smokeColor, isManualOverride, setManualTheme, clearManualTheme } = useThemeStore();

  return (
    <div className={className || "border-b border-white/10 bg-mood-darker/70 backdrop-blur-2xl"}>
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-mood-cyan" />
              Choose Theme
            </h3>
            <button
              onClick={() => clearManualTheme()}
              className={`text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                !isManualOverride
                  ? "bg-white/15 text-white font-semibold backdrop-blur-sm border border-white/20"
                  : "text-white/50 hover:text-white border border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 backdrop-blur-sm"
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-gradient-to-tr from-mood-purple to-mood-cyan" />
              Auto (Your Aura)
              {!isManualOverride && <Check className="w-3 h-3 text-mood-cyan" />}
            </button>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {ARCHETYPES.map((arch) => {
            const isSelected = isManualOverride && smokeColor === arch.color;
            // Get a short name for the card label (e.g., "Midnight Explorer" -> "MIDNIGHT")
            const shortName = arch.name.split(" ")[0].toUpperCase();
            
            return (
              <button
                key={arch.name}
                onClick={() => setManualTheme(arch.name)}
                className={`group relative rounded-[20px] overflow-hidden aspect-square border transition-all duration-300 ${
                  isSelected
                    ? "border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    : "border-white/5 hover:border-white/20"
                }`}
                style={{ backgroundColor: "#050505" }}
              >
                {/* The Bottom Glow */}
                <div
                  className="absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at 50% 110%, ${arch.color} 0%, transparent 70%)`,
                  }}
                />

                {/* Dotted Texture Overlay */}
                <div
                  className="absolute inset-0 opacity-[0.25] mix-blend-overlay pointer-events-none"
                  style={{
                    backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px)`,
                    backgroundSize: "4px 4px",
                  }}
                />

                {/* Content Container */}
                <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
                  <div className="flex items-start justify-between w-full">
                    {/* Icon */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border shadow-inner transition-colors ${
                        isSelected ? "border-white/60" : "border-white/20 group-hover:border-white/40"
                      }`}
                      style={{ background: `linear-gradient(135deg, #a78bfa 0%, #6366f1 100%)` }}
                    >
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <div className="flex gap-[2px] opacity-70">
                          <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
                          <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>

                    {/* Label */}
                    <span className="text-[11px] font-medium tracking-wider text-white mt-1">
                      {shortName}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
