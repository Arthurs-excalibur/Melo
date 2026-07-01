/**
 * AI Layer — OpenRouter Orchestration
 *
 * Builds prompts from Spotify analysis data and routes them through
 * OpenRouter for personality narratives, era detection, and emotional summaries.
 */

import type { EmotionalProfile, PersonalityArchetype, AudioDNA } from "@/lib/analysis/engine";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AIAnalysisInput {
  topArtists: string[];
  topGenres: string[];
  emotionalProfile: EmotionalProfile;
  audioDNA: AudioDNA;
  archetype: PersonalityArchetype;
  listeningPatterns: {
    nightOwl: boolean;
    weekendHeavy: boolean;
    binge: boolean;
  };
  recentTracks?: string[];
}

export interface AIPersonalityResult {
  narrative: string;
  listeningEras: string[];
  emotionalSummary: string;
  moodTitle: string;
  auraColor: string;
  auraDescription: string;
  shareableTagline: string;
}

// ─── Models ───────────────────────────────────────────────────────────────────

/** Light tasks: summaries, short analyses */
const FAST_MODELS = [
  "google/gemini-flash-1.5",
  "google/gemini-2.5-flash",
  "meta-llama/llama-3-8b-instruct:free",
  "openchat/openchat-7b:free",
];

/** Premium tasks: personality narratives, cinematic storytelling */
const PREMIUM_MODELS = [
  "anthropic/claude-3-haiku",
  "google/gemini-2.5-flash",
  "google/gemini-flash-1.5",
  "meta-llama/llama-3-8b-instruct:free",
  "openchat/openchat-7b:free",
];

// ─── Client ───────────────────────────────────────────────────────────────────

async function callOpenRouter(
  prompt: string,
  systemPrompt: string,
  model: string = FAST_MODELS[0],
  maxTokens: number = 800
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not configured");

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXTAUTH_URL ?? "http://localhost:3000",
      "X-Title": "Melo",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`OpenRouter error: ${err?.error?.message ?? res.statusText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

// ─── Prompt Builders ──────────────────────────────────────────────────────────

function buildPersonalityPrompt(input: AIAnalysisInput): string {
  return `
You are analyzing someone's music taste to create a poetic, insightful personality profile.

**Their Music Data:**
- Top Artists: ${input.topArtists.slice(0, 10).join(", ")}
- Core Genres: ${input.topGenres.slice(0, 8).join(", ")}
- Emotional Profile: Valence ${Math.round(input.emotionalProfile.valence * 100)}%, Energy ${Math.round(input.emotionalProfile.energy * 100)}%, Danceability ${Math.round(input.emotionalProfile.danceability * 100)}%
- Archetype: ${input.archetype}
- Audio DNA: Energy ${Math.round(input.audioDNA.energy * 100)}, Chaos ${Math.round(input.audioDNA.chaos * 100)}, Nostalgia ${Math.round(input.audioDNA.nostalgia * 100)}
- Night Owl: ${input.listeningPatterns.nightOwl}
- Weekend Heavy Listener: ${input.listeningPatterns.weekendHeavy}

**Return a JSON object with EXACTLY these fields:**
{
  "narrative": "2-3 sentence poetic personality description (not generic)",
  "listeningEras": ["3 named listening eras/phases this person has gone through, evocative names"],
  "emotionalSummary": "1 powerful sentence about their emotional relationship with music",
  "moodTitle": "2-3 word evocative title for their music mood",
  "auraColor": "A specific color name that represents their aura (not generic like 'blue')",
  "auraDescription": "15-word description of what this color represents for them",
  "shareableTagline": "Under 10 words, shareable caption for their music personality"
}

Only return valid JSON. No markdown, no explanation.
`.trim();
}

const PERSONALITY_SYSTEM = `You are Melo's AI, a music intelligence engine that creates poetic, 
cinematic personality profiles from music data. Your writing is evocative, specific, and never generic. 
You reference specific emotional textures, not just genre names. Return only valid JSON.`;

// ─── Main Analysis Functions ───────────────────────────────────────────────────

export async function generatePersonalityAnalysis(
  input: AIAnalysisInput,
  onAttemptFail?: (model: string, error: string) => Promise<void>
): Promise<AIPersonalityResult> {
  const prompt = buildPersonalityPrompt(input);
  let lastError: Error | null = null;

  for (const model of PREMIUM_MODELS) {
    try {
      const raw = await callOpenRouter(prompt, PERSONALITY_SYSTEM, model, 1000);
      
      // Strip markdown fences if present
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned) as AIPersonalityResult;

      // Validate required fields
      const required: (keyof AIPersonalityResult)[] = [
        "narrative",
        "listeningEras",
        "emotionalSummary",
        "moodTitle",
        "auraColor",
        "auraDescription",
        "shareableTagline",
      ];

      for (const field of required) {
        if (!parsed[field]) throw new Error(`Missing field: ${field}`);
      }

      return parsed;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[AI] Model ${model} failed: ${errMsg}`);
      lastError = err instanceof Error ? err : new Error(errMsg);
      if (onAttemptFail) {
        await onAttemptFail(model, errMsg);
      }
    }
  }

  throw new Error(`Failed to generate AI personality profile. All models exhausted. Last error: ${lastError?.message}`);
}

export async function generateEmotionalSummary(
  profile: EmotionalProfile,
  topGenres: string[],
  onAttemptFail?: (model: string, error: string) => Promise<void>
): Promise<string> {
  const prompt = `
Given these music stats:
- Mood Score: ${profile.moodScore}/100
- Valence: ${Math.round(profile.valence * 100)}%
- Energy: ${Math.round(profile.energy * 100)}%
- Nostalgia Factor: ${Math.round(profile.nostalgiaFactor * 100)}%
- Genres: ${topGenres.slice(0, 5).join(", ")}

Write ONE evocative sentence (max 25 words) describing this person's emotional relationship with music.
Return ONLY the sentence, no quotes, no punctuation beyond the sentence itself.
`.trim();

  let lastError: Error | null = null;
  for (const model of FAST_MODELS) {
    try {
      const result = await callOpenRouter(
        prompt,
        "You write poetic one-liners about music personalities. Be specific and evocative.",
        model,
        100
      );
      if (!result.trim()) throw new Error("Empty response");
      return result.trim();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[AI] Model ${model} failed for emotional summary: ${errMsg}`);
      lastError = err instanceof Error ? err : new Error(errMsg);
      if (onAttemptFail) {
        await onAttemptFail(model, errMsg);
      }
    }
  }

  throw new Error(`Failed to generate emotional summary. All models exhausted. Last error: ${lastError?.message}`);
}

