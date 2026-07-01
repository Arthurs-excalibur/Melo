"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/themeStore";

export function ThemeSetter({ archetype, color, force }: { archetype?: string, color?: string, force?: boolean }) {
  const setSmokeColorByArchetype = useThemeStore(s => s.setSmokeColorByArchetype);
  const setSmokeColor = useThemeStore(s => s.setSmokeColor);
  const forceSetSmokeColor = useThemeStore(s => s.forceSetSmokeColor);
  
  useEffect(() => {
    if (color) {
      if (force) {
        forceSetSmokeColor(color);
      } else {
        setSmokeColor(color);
      }
    } else if (archetype) {
      setSmokeColorByArchetype(archetype);
    }
  }, [archetype, color, force, forceSetSmokeColor, setSmokeColorByArchetype, setSmokeColor]);
  
  return null;
}
