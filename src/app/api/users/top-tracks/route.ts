/**
 * GET /api/users/top-tracks?range=medium_term
 * Returns user's top tracks for a given time range.
 */

import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { withSpotify } from "@/lib/spotify/session";
import { cached, keys, TTL } from "@/lib/cache";
import type { TimeRange } from "@/lib/spotify/client";

const VALID_RANGES: TimeRange[] = ["short_term", "medium_term", "long_term"];

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const range = (request.nextUrl.searchParams.get("range") ?? "medium_term") as TimeRange;
  if (!VALID_RANGES.includes(range)) {
    return Response.json({ error: "Invalid time range" }, { status: 400 });
  }

  const result = await withSpotify((client) =>
    cached(
      keys.spotifyTopTracks(session.spotifyId, range),
      () => client.getTopTracks(range, 50),
      TTL.SPOTIFY_MEDIUM
    )
  );

  if (result.error) {
    return Response.json({ error: result.error.message }, { status: result.error.status });
  }

  return Response.json(result.data);
}
