/**
 * Analysis Engine — Emotional Profiling
 *
 * Computes emotional scores, mood trends, and listening patterns
 * from raw Spotify audio features.
 */

import type { AudioFeatures, PlayHistory } from "@/lib/spotify/client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface EmotionalProfile {
  /** 0-1 scale */
  valence: number;
  energy: number;
  danceability: number;
  acousticness: number;
  instrumentalness: number;
  tempo: number; // BPM
  /** Derived */
  moodScore: number;    // composite mood 0-100
  chaosIndex: number;   // tempo variance
  emotionalDepth: number;
  nostalgiaFactor: number;
}

export interface MoodDataPoint {
  date: string; // ISO date
  valence: number;
  energy: number;
  trackCount: number;
  dominantMood: MoodLabel;
}

export type MoodLabel =
  | "Euphoric"
  | "Energetic"
  | "Melancholic"
  | "Calm"
  | "Intense"
  | "Nostalgic"
  | "Neutral";

export interface GenreCluster {
  genre: string;
  weight: number; // 0-100
  relatedGenres: string[];
  affinity: "core" | "adjacent" | "peripheral";
}

export interface ListeningPattern {
  nightOwl: boolean;        // most listening after midnight
  weekendHeavy: boolean;
  binge: boolean;           // long uninterrupted sessions
  genreDiverse: boolean;
  acousticPreference: boolean;
}

export interface AudioDNA {
  energy: number;
  chaos: number;
  emotionality: number;
  danceability: number;
  nostalgia: number;
  acousticness: number;
  experimentalism: number;
}

// ─── Core Computations ───────────────────────────────────────────────────────

/** Compute an averaged emotional profile from a set of audio features */
export function computeEmotionalProfile(features: AudioFeatures[]): EmotionalProfile {
  if (features.length === 0) {
    return zeroProfile();
  }

  const valid = features.filter(Boolean);
  const avg = (key: keyof AudioFeatures) => {
    const sum = valid.reduce((acc, f) => acc + (f[key] as number), 0);
    return sum / valid.length;
  };

  const valence = avg("valence");
  const energy = avg("energy");
  const danceability = avg("danceability");
  const acousticness = avg("acousticness");
  const instrumentalness = avg("instrumentalness");
  const tempo = avg("tempo");

  // Derived metrics
  const moodScore = Math.round((valence * 0.5 + energy * 0.3 + danceability * 0.2) * 100);

  // Chaos: high tempo variance + low acousticness
  const tempos = valid.map((f) => f.tempo);
  const tempoVariance = standardDeviation(tempos) / 180; // normalize to ~0-1
  const chaosIndex = Math.min(1, tempoVariance * 1.5 + (1 - acousticness) * 0.3);

  // Emotional depth: low valence + high instrumentalness
  const emotionalDepth = Math.min(1, (1 - valence) * 0.6 + instrumentalness * 0.4);

  // Nostalgia factor: acousticness + low energy + medium valence
  const nostalgiaFactor = Math.min(1, acousticness * 0.5 + (1 - energy) * 0.3 + valence * 0.2);

  return {
    valence: round2(valence),
    energy: round2(energy),
    danceability: round2(danceability),
    acousticness: round2(acousticness),
    instrumentalness: round2(instrumentalness),
    tempo: Math.round(tempo),
    moodScore,
    chaosIndex: round2(chaosIndex),
    emotionalDepth: round2(emotionalDepth),
    nostalgiaFactor: round2(nostalgiaFactor),
  };
}

/** Map audio features of a track to a human-readable mood label */
export function classifyMood(valence: number, energy: number): MoodLabel {
  if (valence > 0.7 && energy > 0.7) return "Euphoric";
  if (valence > 0.5 && energy > 0.6) return "Energetic";
  if (valence < 0.35 && energy > 0.5) return "Intense";
  if (valence < 0.4 && energy < 0.4) return "Melancholic";
  if (valence > 0.5 && energy < 0.4) return "Calm";
  if (valence > 0.4 && energy < 0.35) return "Nostalgic";
  return "Neutral";
}

/** Build a daily mood timeline from play history + audio features */
export function buildMoodTimeline(
  history: PlayHistory[],
  featuresMap: Map<string, AudioFeatures>
): MoodDataPoint[] {
  // Group by day
  const byDay = new Map<string, AudioFeatures[]>();

  for (const item of history) {
    const day = item.played_at.slice(0, 10); // YYYY-MM-DD
    const features = featuresMap.get(item.track.id);
    if (!features) continue;
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)!.push(features);
  }

  return Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, feats]) => {
      const avgValence = avg(feats.map((f) => f.valence));
      const avgEnergy = avg(feats.map((f) => f.energy));
      return {
        date,
        valence: round2(avgValence),
        energy: round2(avgEnergy),
        trackCount: feats.length,
        dominantMood: classifyMood(avgValence, avgEnergy),
      };
    });
}

/** Cluster top artists into genres with affinity scores */
export function buildGenreClusters(
  artistGenres: { genres: string[] }[]
): GenreCluster[] {
  const genreCount = new Map<string, number>();

  for (const artist of artistGenres) {
    if (!artist || !Array.isArray(artist.genres)) continue;
    for (const genre of artist.genres) {
      genreCount.set(genre, (genreCount.get(genre) ?? 0) + 1);
    }
  }

  if (genreCount.size === 0) return [];

  const maxCount = Math.max(...genreCount.values());

  return Array.from(genreCount.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 50) // top 50 genres
    .map(([genre, count]) => {
      const weight = Math.round((count / maxCount) * 100);
      const affinity: GenreCluster["affinity"] =
        weight >= 60 ? "core" : weight >= 25 ? "adjacent" : "peripheral";

      // Find related genres (genres that share artists)
      const relatedGenres = findRelatedGenres(genre, artistGenres, 3);

      return { genre, weight, relatedGenres, affinity };
    });
}

/** Detect behavioral listening patterns from play history */
export function detectListeningPatterns(history: PlayHistory[]): ListeningPattern {
  if (history.length === 0) {
    return {
      nightOwl: false,
      weekendHeavy: false,
      binge: false,
      genreDiverse: false,
      acousticPreference: false,
    };
  }

  // Night owl: >35% plays between midnight and 5am
  const nightPlays = history.filter((h) => {
    const hour = new Date(h.played_at).getHours();
    return hour >= 0 && hour < 5;
  });
  const nightOwl = nightPlays.length / history.length > 0.35;

  // Weekend heavy: >50% plays on Sat/Sun
  const weekendPlays = history.filter((h) => {
    const day = new Date(h.played_at).getDay();
    return day === 0 || day === 6;
  });
  const weekendHeavy = weekendPlays.length / history.length > 0.5;

  // Binge: any 3+ consecutive tracks within 15 min window
  const binge = detectBingeListening(history);

  // Placeholder — requires genre data from artists
  const genreDiverse = false;
  const acousticPreference = false;

  return { nightOwl, weekendHeavy, binge, genreDiverse, acousticPreference };
}

/** Compute normalized Audio DNA scores for radar chart */
export function computeAudioDNA(profile: EmotionalProfile): AudioDNA {
  return {
    energy: round2(profile.energy),
    chaos: round2(profile.chaosIndex),
    emotionality: round2(profile.emotionalDepth),
    danceability: round2(profile.danceability),
    nostalgia: round2(profile.nostalgiaFactor),
    acousticness: round2(profile.acousticness),
    experimentalism: round2(profile.instrumentalness),
  };
}

// ─── Personality Archetype ────────────────────────────────────────────────────

export type PersonalityArchetype =
  | "The Night Wanderer"
  | "The Euphoric Explorer"
  | "The Melancholic Poet"
  | "The Energetic Maverick"
  | "The Calm Observer"
  | "The Eclectic Mind"
  | "The Nostalgic Dreamer"
  | "The Intense Creator";

export function deriveArchetype(
  profile: EmotionalProfile,
  patterns: ListeningPattern
): PersonalityArchetype {
  const { valence, energy, acousticness, emotionalDepth } = profile;

  if (patterns.nightOwl && valence < 0.45) return "The Night Wanderer";
  if (valence > 0.7 && energy > 0.7) return "The Euphoric Explorer";
  if (emotionalDepth > 0.65 && valence < 0.4) return "The Melancholic Poet";
  if (energy > 0.75 && valence > 0.5) return "The Energetic Maverick";
  if (acousticness > 0.6 && energy < 0.4) return "The Calm Observer";
  if (profile.nostalgiaFactor > 0.6) return "The Nostalgic Dreamer";
  if (energy > 0.65 && emotionalDepth > 0.5) return "The Intense Creator";
  return "The Eclectic Mind";
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function standardDeviation(nums: number[]): number {
  if (nums.length === 0) return 0;
  const mean = avg(nums);
  const variance = avg(nums.map((n) => (n - mean) ** 2));
  return Math.sqrt(variance);
}

function zeroProfile(): EmotionalProfile {
  return {
    valence: 0,
    energy: 0,
    danceability: 0,
    acousticness: 0,
    instrumentalness: 0,
    tempo: 0,
    moodScore: 0,
    chaosIndex: 0,
    emotionalDepth: 0,
    nostalgiaFactor: 0,
  };
}

function findRelatedGenres(
  genre: string,
  artistGenres: { genres: string[] }[],
  limit: number
): string[] {
  const cooccurrences = new Map<string, number>();

  for (const artist of artistGenres) {
    if (!artist || !Array.isArray(artist.genres) || !artist.genres.includes(genre)) continue;
    for (const g of artist.genres) {
      if (g === genre) continue;
      cooccurrences.set(g, (cooccurrences.get(g) ?? 0) + 1);
    }
  }

  return Array.from(cooccurrences.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([g]) => g);
}

function detectBingeListening(history: PlayHistory[]): boolean {
  const sorted = [...history].sort(
    (a, b) => new Date(a.played_at).getTime() - new Date(b.played_at).getTime()
  );

  for (let i = 0; i < sorted.length - 2; i++) {
    const t1 = new Date(sorted[i].played_at).getTime();
    const t3 = new Date(sorted[i + 2].played_at).getTime();
    if (t3 - t1 < 15 * 60 * 1000) return true; // 3 tracks within 15 min
  }

  return false;
}
