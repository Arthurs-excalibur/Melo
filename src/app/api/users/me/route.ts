/**
 * GET /api/users/me
 * Returns the current user's Spotify profile.
 */

import { auth } from "@/lib/auth";
import { withSpotify } from "@/lib/spotify/session";
import { cached, keys, TTL } from "@/lib/cache";

export async function GET() {
  const session = await auth();
  if (!session?.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await withSpotify(async (client) => {
    return cached(
      keys.spotifyMe(session.spotifyId),
      () => client.getMe(),
      TTL.SPOTIFY_LONG
    );
  });

  if (result.error) {
    return Response.json({ error: result.error.message }, { status: result.error.status });
  }

  return Response.json(result.data);
}
