/**
 * GET /api/visualizations/audio-dna
 * Returns the cached audio DNA payload.
 */

import { auth } from "@/lib/auth";
import { cache, keys } from "@/lib/cache";
import { getSpotifyClient } from "@/lib/spotify/session";
import { fetchFullAnalysis } from "@/lib/orchestrator";
import { buildAudioDNAPayload } from "@/lib/visualizations/engine";
import { TTL } from "@/lib/cache";

export async function GET() {
  const session = await auth();
  if (!session?.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cacheKey = keys.visualizationAudioDNA(session.spotifyId);
  let data = await cache.get(cacheKey);

  if (!data) {
    try {
      const client = await getSpotifyClient();
      const analysis = await fetchFullAnalysis(client, session.spotifyId);
      data = buildAudioDNAPayload(analysis.audioDNA);
      await cache.set(cacheKey, data, TTL.VISUALIZATION);
    } catch (err) {
      console.error("Failed to rebuild audio DNA:", err);
      return Response.json({ error: "Failed to generate visualization" }, { status: 500 });
    }
  }

  return Response.json(data);
}
