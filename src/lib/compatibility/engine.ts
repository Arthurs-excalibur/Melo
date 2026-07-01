/**
 * Compatibility Engine
 *
 * Compares two users' music profiles to produce a compatibility score.
 * Used for the social sharing system.
 */

import type { EmotionalProfile, GenreCluster } from "@/lib/analysis/engine";

export interface CompatibilityInput {
  userA: {
    id: string;
    genres: GenreCluster[];
    profile: EmotionalProfile;
    topArtistIds: string[];
  };
  userB: {
    id: string;
    genres: GenreCluster[];
    profile: EmotionalProfile;
    topArtistIds: string[];
  };
}

export interface CompatibilityResult {
  score: number; // 0-100
  label: string;
  breakdown: {
    genreSimilarity: number;
    emotionalAlignment: number;
    artistOverlap: number;
    energyMatch: number;
  };
  insight: string;
  shareMessage: string;
}

export function computeCompatibility(input: CompatibilityInput): CompatibilityResult {
  const { userA, userB } = input;

  // Genre similarity: Jaccard-like intersection
  const genresA = new Set(userA.genres.map((g) => g.genre));
  const genresB = new Set(userB.genres.map((g) => g.genre));
  const intersection = [...genresA].filter((g) => genresB.has(g));
  const union = new Set([...genresA, ...genresB]);
  const genreSimilarity = union.size === 0
    ? 0
    : Math.round((intersection.length / union.size) * 100);

  // Emotional alignment: how close are their profiles?
  const emotionalAlignment = Math.round(
    (1 -
      (Math.abs(userA.profile.valence - userB.profile.valence) +
        Math.abs(userA.profile.energy - userB.profile.energy) +
        Math.abs(userA.profile.emotionalDepth - userB.profile.emotionalDepth)) /
        3) *
      100
  );

  // Artist overlap
  const artistsA = new Set(userA.topArtistIds);
  const artistsB = new Set(userB.topArtistIds);
  const artistIntersection = [...artistsA].filter((a) => artistsB.has(a));
  const artistOverlap = Math.round(
    (artistIntersection.length / Math.max(artistsA.size, artistsB.size, 1)) * 100
  );

  // Energy match: how similar is their energy?
  const energyMatch = Math.round(
    (1 - Math.abs(userA.profile.energy - userB.profile.energy)) * 100
  );

  // Weighted overall score
  const score = Math.round(
    genreSimilarity * 0.35 +
      emotionalAlignment * 0.3 +
      artistOverlap * 0.2 +
      energyMatch * 0.15
  );

  const label = compatibilityLabel(score);
  const insight = buildInsight(score, genreSimilarity, emotionalAlignment, artistOverlap);
  const shareMessage = `We're ${score}% music compatible! ${label} 🎵`;

  return {
    score,
    label,
    breakdown: { genreSimilarity, emotionalAlignment, artistOverlap, energyMatch },
    insight,
    shareMessage,
  };
}

function compatibilityLabel(score: number): string {
  if (score >= 85) return "Sonic Soulmates";
  if (score >= 70) return "Deeply Aligned";
  if (score >= 55) return "Resonant Spirits";
  if (score >= 40) return "Complementary Tastes";
  if (score >= 25) return "Intriguing Contrast";
  return "Musical Opposites";
}

function buildInsight(
  score: number,
  genre: number,
  emotional: number,
  artists: number
): string {
  if (artists > 40) return "You share core artists — you've probably bonded over the same songs already.";
  if (genre > 60) return "Your genre DNA runs parallel — music is your natural common language.";
  if (emotional > 75) return "Your emotional relationship with music is almost identical — you feel sound the same way.";
  if (score > 60) return "Your tastes complement each other beautifully — you'd build a great playlist together.";
  return "Your music universes are distinct — you could open each other's ears to new worlds.";
}
