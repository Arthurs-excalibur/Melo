/**
 * Session helpers — get an authenticated SpotifyClient from the current session.
 * Handles automatic token refresh transparently.
 */

import { auth } from "@/lib/auth";
import { SpotifyClient, SpotifyAPIError } from "./client";

export async function getSpotifyClient(): Promise<SpotifyClient> {
  const session = await auth();

  if (!session?.accessToken) {
    throw new SpotifyAPIError("No access token in session", 401);
  }

  return new SpotifyClient(session.accessToken as string);
}

/**
 * Wraps a Spotify API call and returns a typed result object.
 * On 401, signals that the session should be refreshed.
 */
export async function withSpotify<T>(
  fn: (client: SpotifyClient) => Promise<T>
): Promise<{ data: T; error: null } | { data: null; error: { message: string; status: number } }> {
  try {
    const client = await getSpotifyClient();
    const data = await fn(client);
    return { data, error: null };
  } catch (err) {
    if (err instanceof SpotifyAPIError) {
      return { data: null, error: { message: err.message, status: err.status } };
    }
    return { data: null, error: { message: "Internal error", status: 500 } };
  }
}
