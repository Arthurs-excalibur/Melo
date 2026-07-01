/**
 * GET /api/users/history
 * Returns the user's recently played tracks.
 */

import { auth } from "@/lib/auth";
import { withSpotify } from "@/lib/spotify/session";
import { cached, keys, TTL } from "@/lib/cache";

export async function GET() {
  const session = await auth();
  if (!session?.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await withSpotify((client) =>
    cached(
      keys.spotifyHistory(session.spotifyId),
      () => client.getRecentlyPlayed(50),
      TTL.SPOTIFY_SHORT
    )
  );

  if (result.error) {
    return Response.json({ error: result.error.message }, { status: result.error.status });
  }

  return Response.json(result.data);
}
