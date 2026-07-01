/**
 * GET /api/visualizations/timeline
 * Returns the cached timeline payload.
 * Note: Since timeline depends on the AI personality result (listeningEras),
 * it relies on the /api/analysis cache.
 */

import { auth } from "@/lib/auth";
import { cache, keys } from "@/lib/cache";

export async function GET() {
  const session = await auth();
  if (!session?.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // The timeline is generated and cached as part of the full analysis result
  // We can just pull it from the analysis cache
  const cacheKey = keys.analysisPersonality(session.spotifyId);
  const analysisResult = await cache.get<{ timeline?: unknown }>(cacheKey);

  if (!analysisResult || !analysisResult.timeline) {
    // If not in cache, client must hit /api/analysis first
    return Response.json(
      { error: "Analysis not ready. Please call /api/analysis first." },
      { status: 400 }
    );
  }

  return Response.json(analysisResult.timeline);
}
