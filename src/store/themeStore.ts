import { create } from "zustand";

interface ThemeState {
  smokeColor: string;
  pendingAuraColor: string;
  isRevealed: boolean;
  isManualOverride: boolean;
  setSmokeColor: (color: string) => void;
  forceSetSmokeColor: (color: string) => void;
  setSmokeColorByArchetype: (archetype: string) => void;
  setManualTheme: (archetype: string) => void;
  clearManualTheme: () => void;
  revealAura: () => void;
}

export const getArchetypeColor = (archetype: string): string => {
  if (!archetype) return "#06B6D4"; // Default Cyan

  const name = archetype.toLowerCase();

  if (name.includes("night") || name.includes("midnight")) {
    return "#4B0082"; // Indigo/Dark Purple
  }
  if (name.includes("euphoric") || name.includes("explorer")) {
    return "#FF00FF"; // Magenta
  }
  if (name.includes("melancholic") || name.includes("poet")) {
    return "#1E3A8A"; // Deep Blue
  }
  if (name.includes("energetic") || name.includes("maverick") || name.includes("rhythm")) {
    return "#FF4500"; // Orange Red
  }
  if (name.includes("calm") || name.includes("observer") || name.includes("collector")) {
    return "#2E8B57"; // Sea Green
  }
  if (name.includes("eclectic") || name.includes("mind") || name.includes("nomad")) {
    return "#00CED1"; // Dark Turquoise
  }
  if (name.includes("nostalgic") || name.includes("dreamer")) {
    return "#DAA520"; // Goldenrod
  }
  if (name.includes("intense") || name.includes("creator")) {
    return "#DC143C"; // Crimson
  }

  return "#06B6D4"; // Default Cyan
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  smokeColor: "#4a4a4a",        // Start grey
  pendingAuraColor: "#06B6D4",  // Will be set when archetype loads
  isRevealed: false,
  isManualOverride: false,
  setSmokeColor: (color) => {
    if (!get().isManualOverride) {
      set({ pendingAuraColor: color });
      // Only apply to visible smoke if already revealed
      if (get().isRevealed) set({ smokeColor: color });
    }
  },
  forceSetSmokeColor: (color) => {
    set({ smokeColor: color, pendingAuraColor: color });
  },
  setSmokeColorByArchetype: (archetype) => {
    if (!get().isManualOverride) {
      const color = getArchetypeColor(archetype);
      set({ pendingAuraColor: color });
      // Only apply to visible smoke if already revealed
      if (get().isRevealed) set({ smokeColor: color });
    }
  },
  revealAura: () => {
    const pending = get().pendingAuraColor;
    set({ isRevealed: true, smokeColor: pending });
  },
  setManualTheme: (archetype) => {
    set({ smokeColor: getArchetypeColor(archetype), isManualOverride: true });
  },
  clearManualTheme: () => {
    set({ isManualOverride: false });
  }
}));
