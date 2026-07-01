/**
 * GET /api/visualizations/genre-galaxy
 * Returns the cached genre galaxy payload.
 */

import { auth } from "@/lib/auth";
import { cache, keys } from "@/lib/cache";
import { getSpotifyClient } from "@/lib/spotify/session";
import { fetchFullAnalysis } from "@/lib/orchestrator";
import { buildGenreGalaxyPayload } from "@/lib/visualizations/engine";
import { TTL } from "@/lib/cache";

export async function GET() {
  const session = await auth();
  if (!session?.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cacheKey = keys.visualizationGenreGalaxy(session.spotifyId);
  let data = await cache.get(cacheKey);

  if (!data) {
    // Cache miss, rebuild
    try {
      const client = await getSpotifyClient();
      const analysis = await fetchFullAnalysis(client, session.spotifyId);
      data = buildGenreGalaxyPayload(analysis.genreClusters);
      await cache.set(cacheKey, data, TTL.VISUALIZATION);
    } catch (err) {
      console.error("Failed to rebuild genre galaxy:", err);
      return Response.json({ error: "Failed to generate visualization" }, { status: 500 });
    }
  }

  return Response.json(data);
}
