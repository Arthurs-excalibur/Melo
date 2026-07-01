"use client";

import { useThemeStore } from "@/store/themeStore";
import { SmokeBackground } from "@/components/animations/SmokeBackground";

export function ThemeWrapper() {
  const smokeColor = useThemeStore((state) => state.smokeColor);
  return <SmokeBackground smokeColor={smokeColor} />;
}
