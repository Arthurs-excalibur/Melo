import { db } from "@/lib/db";
import { fetchFullAnalysis } from "@/lib/orchestrator";
import { getShareCard } from "@/lib/share/engine";
import { SpotifyClient } from "@/lib/spotify/client";
import {
  computeCompatibility,
  type CompatibilityResult,
  type CompatibilityInput,
} from "@/lib/compatibility/engine";
import type { EmotionalProfile } from "@/lib/analysis/engine";

interface CompatibilityRunnerInput {
  currentUserId: string;
  currentSpotifyId: string;
  accessToken: string;
  shareCardId: string;
  persist?: boolean;
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

export async function runCompatibilityComparison({
  currentUserId,
  currentSpotifyId,
  accessToken,
  shareCardId,
  persist = true,
}: CompatibilityRunnerInput): Promise<CompatibilityResult> {
  const sharedCard = await getShareCard(shareCardId);
  if (!sharedCard) {
    throw new Error("Share card not found or expired");
  }

  const client = new SpotifyClient(accessToken);
  const currentUserAnalysis = await fetchFullAnalysis(
    client,
    currentSpotifyId,
    "medium_term"
  );

  const sharedProfile = toEmotionalProfile(sharedCard.emotionalProfile);
  const sharedGenres = sharedCard.topGenres.map((genre) => ({
    genre,
    weight: 100,
    relatedGenres: [],
    affinity: "core" as const,
  }));

  const input: CompatibilityInput = {
    userA: {
      id: currentSpotifyId,
      genres: currentUserAnalysis.genreClusters,
      profile: currentUserAnalysis.emotionalProfile,
      topArtistIds: currentUserAnalysis.topArtists.map((artist) => artist.id),
    },
    userB: {
      id: sharedCard.id,
      genres: sharedGenres,
      profile: sharedProfile,
      topArtistIds: [],
    },
  };

  const result = await addAiInsight(
    computeCompatibility(input),
    currentUserAnalysis.topGenres,
    currentUserAnalysis.emotionalProfile.energy,
    sharedCard.topGenres,
    sharedProfile.energy
  );

  if (persist && sharedCard.userId !== "demo-user") {
    await db.compatibilityResult.upsert({
      where: {
        user1Id_user2Id: {
          user1Id: currentUserId,
          user2Id: sharedCard.userId,
        },
      },
      update: {
        score: result.score,
        breakdown: result.breakdown,
      },
      create: {
        user1Id: currentUserId,
        user2Id: sharedCard.userId,
        score: result.score,
        breakdown: result.breakdown,
      },
    });
  }

  return result;
}

async function addAiInsight(
  result: CompatibilityResult,
  currentGenres: string[],
  currentEnergy: number,
  sharedGenres: string[],
  sharedEnergy: number
): Promise<CompatibilityResult> {
  if (!process.env.OPENROUTER_API_KEY) {
    return result;
  }

  try {
    const aiPrompt = `You are Melo's witty AI music critic.
Analyze the compatibility between two users based on their music taste.
User 1 top genres: ${currentGenres.join(", ")}
User 1 aura: ${currentEnergy > 0.6 ? "High Energy" : "Chill"}
User 2 top genres: ${sharedGenres.join(", ")}
User 2 aura: ${sharedEnergy > 0.6 ? "High Energy" : "Chill"}
Compatibility Score: ${result.score}%
Label: ${result.label}

Write a brief 2 sentence compatibility report about their combined music taste. Keep it fun, specific, and concise.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-preview",
        messages: [{ role: "user", content: aiPrompt }],
      }),
    });

    if (!response.ok) {
      return result;
    }

    const aiData = await response.json() as ChatCompletionResponse;
    const aiMessage = aiData.choices?.[0]?.message?.content?.trim();
    return aiMessage ? { ...result, insight: aiMessage } : result;
  } catch (err) {
    console.warn("Failed to generate AI compatibility message, falling back to heuristic.", err);
    return result;
  }
}

function toEmotionalProfile(value: unknown): EmotionalProfile {
  if (isProfileLike(value)) {
    return {
      valence: value.valence,
      energy: value.energy,
      danceability: value.danceability,
      acousticness: value.acousticness,
      instrumentalness: value.instrumentalness,
      tempo: value.tempo,
      moodScore: value.moodScore,
      chaosIndex: value.chaosIndex,
      emotionalDepth: value.emotionalDepth,
      nostalgiaFactor: value.nostalgiaFactor,
    };
  }

  return {
    valence: 0.5,
    energy: 0.5,
    danceability: 0.5,
    acousticness: 0.3,
    instrumentalness: 0.1,
    tempo: 110,
    moodScore: 50,
    chaosIndex: 0.3,
    emotionalDepth: 0.5,
    nostalgiaFactor: 0.4,
  };
}

function isProfileLike(value: unknown): value is EmotionalProfile {
  if (!value || typeof value !== "object") return false;
  const profile = value as Record<keyof EmotionalProfile, unknown>;
  return (
    typeof profile.valence === "number" &&
    typeof profile.energy === "number" &&
    typeof profile.danceability === "number" &&
    typeof profile.acousticness === "number" &&
    typeof profile.instrumentalness === "number" &&
    typeof profile.tempo === "number" &&
    typeof profile.moodScore === "number" &&
    typeof profile.chaosIndex === "number" &&
    typeof profile.emotionalDepth === "number" &&
    typeof profile.nostalgiaFactor === "number"
  );
}
