/**
 * Visualization Engine
 *
 * Transforms raw analysis data into frontend-ready payloads for:
 * - Mood Graph (recharts line/area)
 * - Genre Galaxy (Three.js node positions)
 * - Audio DNA (radar chart)
 * - Timeline (era cards)
 */

import type { MoodDataPoint, GenreCluster, AudioDNA, EmotionalProfile } from "@/lib/analysis/engine";

// ─── Mood Graph ───────────────────────────────────────────────────────────────

export interface MoodGraphPayload {
  series: MoodDataPoint[];
  summary: {
    avgMood: number;
    trendDirection: "rising" | "falling" | "stable";
    peakDay: string | null;
    lowDay: string | null;
  };
}

export function buildMoodGraphPayload(series: MoodDataPoint[]): MoodGraphPayload {
  if (series.length === 0) {
    return {
      series: [],
      summary: { avgMood: 0, trendDirection: "stable", peakDay: null, lowDay: null },
    };
  }

  const avgMood = Math.round(
    (series.reduce((acc, d) => acc + d.valence, 0) / series.length) * 100
  );

  // Trend: compare first half vs second half
  const mid = Math.floor(series.length / 2);
  const firstHalf = series.slice(0, mid);
  const secondHalf = series.slice(mid);
  const firstAvg = firstHalf.reduce((a, d) => a + d.valence, 0) / (firstHalf.length || 1);
  const secondAvg = secondHalf.reduce((a, d) => a + d.valence, 0) / (secondHalf.length || 1);

  const delta = secondAvg - firstAvg;
  const trendDirection: MoodGraphPayload["summary"]["trendDirection"] =
    delta > 0.05 ? "rising" : delta < -0.05 ? "falling" : "stable";

  const peakDay = series.reduce((best, d) =>
    d.valence > best.valence ? d : best
  ).date;

  const lowDay = series.reduce((worst, d) =>
    d.valence < worst.valence ? d : worst
  ).date;

  return { series, summary: { avgMood, trendDirection, peakDay, lowDay } };
}

// ─── Genre Galaxy ─────────────────────────────────────────────────────────────

export interface GalaxyNode {
  id: string;
  genre: string;
  weight: number;       // 0-100, drives size
  affinity: GenreCluster["affinity"];
  /** Orbital position in 3D space (pre-computed for Three.js) */
  position: [number, number, number];
  color: string;
  relatedGenres: string[];
}

/** Deterministic genre → color mapping based on genre family */
const GENRE_COLORS: Record<string, string> = {
  // Spotify green for modern dominant genres
  "r&b": "#1DB954",
  soul: "#1DB954",
  afrobeats: "#1DB954",
  afropop: "#1DB954",
  funk: "#159c42",
  gospel: "#159c42",
  trap: "#1DB954",
  // Warm / energy colors
  pop: "#f72585",
  "k-pop": "#ff79c6",
  rock: "#e63946",
  "hip hop": "#ff6b35",
  rap: "#ff6b35",
  drill: "#ff6b35",
  // Cool / electronic colors
  electronic: "#4cc9f0",
  edm: "#4cc9f0",
  house: "#4895ef",
  techno: "#4361ee",
  dance: "#4895ef",
  // Mellow / indie
  indie: "#a8dadc",
  folk: "#84a98c",
  country: "#dda15e",
  acoustic: "#c9b99a",
  // Classic / jazz
  classical: "#cdb4db",
  jazz: "#e9c46a",
  blues: "#7b9ec9",
  // Dark / heavy
  metal: "#555555",
  punk: "#ef233c",
  grunge: "#8b7355",
  // Atmospheric
  alternative: "#48cae4",
  ambient: "#90e0ef",
  shoegaze: "#a0c4ff",
  "dream pop": "#c77dff",
  synthwave: "#ff79c6",
  lofi: "#8338ec",
  hyperpop: "#ff006e",
  phonk: "#e07a5f",
};

function genreToColor(genre: string): string {
  const lower = genre.toLowerCase();
  for (const [key, color] of Object.entries(GENRE_COLORS)) {
    if (lower.includes(key)) return color;
  }
  // Deterministic fallback from genre string hash
  const hash = genre.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 65%)`;
}

/** Place nodes in a spherical orbital layout by weight */
function computeOrbitalPosition(
  index: number,
  total: number,
  weight: number
): [number, number, number] {
  // Core genres are closer to center; peripheral are farther
  const radius = weight >= 60 ? 1.5 : weight >= 25 ? 3.0 : 5.0;

  // Fibonacci sphere distribution
  const phi = Math.acos(1 - (2 * (index + 0.5)) / total);
  const theta = Math.PI * (1 + Math.sqrt(5)) * index;

  return [
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi),
  ];
}

export interface GenreGalaxyPayload {
  nodes: GalaxyNode[];
  edges: { source: string; target: string; strength: number }[];
}

export function buildGenreGalaxyPayload(clusters: GenreCluster[]): GenreGalaxyPayload {
  const nodes: GalaxyNode[] = clusters.map((cluster, i) => ({
    id: cluster.genre,
    genre: cluster.genre,
    weight: cluster.weight,
    affinity: cluster.affinity,
    position: computeOrbitalPosition(i, clusters.length, cluster.weight),
    color: genreToColor(cluster.genre),
    relatedGenres: cluster.relatedGenres,
  }));

  // Build edges from relatedGenres
  const edges: GenreGalaxyPayload["edges"] = [];
  const seen = new Set<string>();

  for (const cluster of clusters) {
    for (const related of cluster.relatedGenres) {
      const edgeKey = [cluster.genre, related].sort().join("--");
      if (!seen.has(edgeKey) && clusters.some((c) => c.genre === related)) {
        seen.add(edgeKey);
        edges.push({
          source: cluster.genre,
          target: related,
          strength: cluster.weight / 100,
        });
      }
    }
  }

  return { nodes, edges };
}

// ─── Audio DNA ────────────────────────────────────────────────────────────────

export interface AudioDNAPayload {
  dimensions: {
    label: string;
    value: number; // 0-100
    description: string;
  }[];
  signature: string; // Human-readable fingerprint
}

const DNA_DESCRIPTIONS: Record<keyof AudioDNA, (v: number) => string> = {
  energy: (v) => v > 0.7 ? "Explosive intensity" : v > 0.4 ? "Balanced drive" : "Tranquil stillness",
  chaos: (v) => v > 0.7 ? "Wild unpredictability" : v > 0.4 ? "Controlled tension" : "Focused clarity",
  emotionality: (v) => v > 0.7 ? "Deep emotional complexity" : v > 0.4 ? "Emotional resonance" : "Calm rationality",
  danceability: (v) => v > 0.7 ? "Born to move" : v > 0.4 ? "Rhythmically aware" : "Still and contemplative",
  nostalgia: (v) => v > 0.7 ? "Deeply nostalgic" : v > 0.4 ? "Tinged with memory" : "Present-focused",
  acousticness: (v) => v > 0.7 ? "Purely organic" : v > 0.4 ? "Warm texture" : "Electronic precision",
  experimentalism: (v) => v > 0.7 ? "Boundary-pushing" : v > 0.4 ? "Genre-curious" : "Familiar comfort",
};

export function buildAudioDNAPayload(dna: AudioDNA): AudioDNAPayload {
  const dimensions = (Object.keys(dna) as (keyof AudioDNA)[]).map((key) => ({
    label: key.charAt(0).toUpperCase() + key.slice(1),
    value: Math.round(dna[key] * 100),
    description: DNA_DESCRIPTIONS[key](dna[key]),
  }));

  // Build a human-readable fingerprint from top 3 dimensions
  const top3 = [...dimensions].sort((a, b) => b.value - a.value).slice(0, 3);
  const signature = top3.map((d) => d.label).join(" · ");

  return { dimensions, signature };
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

export interface TimelinePayload {
  eras: {
    name: string;
    period: string;
    description: string;
    dominantMood: string;
    color: string;
  }[];
}

export function buildTimelinePayload(
  listeningEras: string[],
  profile: EmotionalProfile
): TimelinePayload {
  const colors = ["#f72585", "#7209b7", "#3a0ca3", "#4361ee", "#4cc9f0"];

  return {
    eras: listeningEras.map((era, i) => ({
      name: era,
      period: eraTimePeriod(i),
      description: `A chapter defined by ${era.toLowerCase()} — shaped by ${profile.moodScore > 60 ? "optimism" : "introspection"}.`,
      dominantMood: profile.moodScore > 60 ? "Euphoric" : profile.emotionalDepth > 0.6 ? "Melancholic" : "Neutral",
      color: colors[i % colors.length],
    })),
  };
}

function eraTimePeriod(index: number): string {
  const periods = ["Early", "Mid", "Recent", "Current", "Emerging"];
  return periods[index] ?? `Phase ${index + 1}`;
}
