/**
 * Spotify API Client
 * Typed, error-safe wrapper around the Spotify Web API.
 */

export const SPOTIFY_BASE = "https://api.spotify.com/v1";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  images: SpotifyImage[];
  external_urls: { spotify: string };
  followers?: { total: number };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  artists: Pick<SpotifyArtist, "id" | "name">[];
  album: {
    id: string;
    name: string;
    images: SpotifyImage[];
    release_date: string;
  };
  duration_ms: number;
  popularity: number;
  explicit: boolean;
  external_urls: { spotify: string };
  preview_url: string | null;
}

export interface AudioFeatures {
  id: string;
  energy: number;
  valence: number;
  danceability: number;
  tempo: number;
  acousticness: number;
  instrumentalness: number;
  speechiness: number;
  liveness: number;
  loudness: number;
  mode: number;
  key: number;
  time_signature: number;
}

export interface PlayHistory {
  track: SpotifyTrack;
  played_at: string;
  context: { type: string; uri: string } | null;
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: SpotifyImage[];
  country: string;
  product: string;
  followers: { total: number };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: SpotifyImage[];
  tracks: { total: number };
  public: boolean;
  owner: { id: string; display_name: string };
  external_urls: { spotify: string };
}

export type TimeRange = "short_term" | "medium_term" | "long_term";

// ─── Client ──────────────────────────────────────────────────────────────────

export class SpotifyClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Standard fetch — throws SpotifyAPIError on all errors including 429.
   * Safe to use in regular Next.js API routes.
   */
  private async fetch<T>(endpoint: string, init?: RequestInit): Promise<T> {
    return this.fetchInternal<T>(endpoint, false, init);
  }

  /**
   * Inngest-aware fetch — throws RetryAfterError on 429 so Inngest can sleep & retry.
   * Use ONLY inside inngest step.run() callbacks.
   */
  async fetchInngest<T>(endpoint: string, init?: RequestInit): Promise<T> {
    return this.fetchInternal<T>(endpoint, true, init);
  }

  private async fetchInternal<T>(endpoint: string, inngestMode: boolean, init?: RequestInit): Promise<T> {
    const res = await fetch(`${SPOTIFY_BASE}${endpoint}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });

    if (!res.ok) {
      if (res.status === 429) {
        const retryAfter = res.headers.get("Retry-After") || "5";
        if (inngestMode) {
          // Dynamically import to avoid crashing in non-Inngest contexts
          const { RetryAfterError } = await import("inngest");
          throw new RetryAfterError("Spotify Rate Limit Exceeded", parseInt(retryAfter, 10) * 1000);
        }
        // Outside Inngest: throw a standard error so the route can return a 429 response
        throw new SpotifyAPIError(`Spotify rate limit hit. Retry after ${retryAfter}s.`, 429);
      }

      const bodyText = await res.text().catch(() => "");
      console.error(`[spotify-client] ${res.status} ${res.url?.split("?")[0] ?? ""} — body: ${bodyText}`);
      const err = (() => {
        try { return JSON.parse(bodyText); } catch { return {}; }
      })();
      throw new SpotifyAPIError(
        err?.error?.message ?? res.statusText,
        res.status
      );
    }

    // 204 No Content
    if (res.status === 204) return undefined as T;

    const text = await res.text();
    if (!text) return undefined as T;
    return JSON.parse(text) as T;
  }

  // ── Profile ────────────────────────────────────────────────────────────────

  async getMe(): Promise<SpotifyUser> {
    return this.fetch<SpotifyUser>("/me");
  }

  // ── Top Items ─────────────────────────────────────────────────────────────

  async getTopArtists(
    timeRange: TimeRange = "medium_term",
    limit = 50,
    offset = 0
  ): Promise<{ items: SpotifyArtist[]; total: number }> {
    return this.fetch(
      `/me/top/artists?time_range=${timeRange}&limit=${limit}&offset=${offset}`
    );
  }

  async getTopTracks(
    timeRange: TimeRange = "medium_term",
    limit = 50,
    offset = 0
  ): Promise<{ items: SpotifyTrack[]; total: number }> {
    return this.fetch(
      `/me/top/tracks?time_range=${timeRange}&limit=${limit}&offset=${offset}`
    );
  }

  async getArtists(ids: string[]): Promise<{ artists: SpotifyArtist[] }> {
    if (ids.length === 0) return { artists: [] };
    return this.fetch(`/artists?ids=${ids.join(",")}`);
  }

  // ── History ───────────────────────────────────────────────────────────────

  async getRecentlyPlayed(
    limit = 50,
    before?: number,
    after?: number
  ): Promise<{ items: PlayHistory[]; cursors: { before: string; after: string } }> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (before) params.set("before", String(before));
    if (after) params.set("after", String(after));
    return this.fetch(`/me/player/recently-played?${params}`);
  }

  // ── Audio Features ────────────────────────────────────────────────────────

  async getAudioFeatures(trackIds: string[]): Promise<{ audio_features: AudioFeatures[] }> {
    if (trackIds.length === 0) return { audio_features: [] };
    // Spotify limits to 100 ids per request
    const chunks = chunkArray(trackIds, 100);
    const results: AudioFeatures[] = [];

    for (const chunk of chunks) {
      const res = await this.fetch<{ audio_features: AudioFeatures[] }>(
        `/audio-features?ids=${chunk.join(",")}`
      );
      results.push(...(res.audio_features ?? []));
    }
    return { audio_features: results };
  }

  // ── Playlists ─────────────────────────────────────────────────────────────

  async getPlaylists(
    limit = 50,
    offset = 0
  ): Promise<{ items: SpotifyPlaylist[]; total: number }> {
    return this.fetch(`/me/playlists?limit=${limit}&offset=${offset}`);
  }

  async createPlaylist(
    name: string,
    description: string,
    isPublic = false
  ): Promise<SpotifyPlaylist> {
    return this.fetch(`/me/playlists`, {
      method: "POST",
      body: JSON.stringify({
        name,
        description,
        public: isPublic,
      }),
    });
  }

  async addItemsToPlaylist(playlistId: string, uris: string[]): Promise<{ snapshot_id: string }> {
    return this.fetch(`/playlists/${playlistId}/items`, {
      method: "POST",
      body: JSON.stringify({ uris }),
    });
  }

  /** Replace ALL playlist items. */
  async replacePlaylistTracks(playlistId: string, uris: string[]): Promise<{ snapshot_id: string }> {
    return this.fetch(`/playlists/${playlistId}/items`, {
      method: "PUT",
      body: JSON.stringify({ uris }),
    });
  }

  async uploadPlaylistCoverImage(playlistId: string, base64Jpeg: string): Promise<void> {
    await this.fetch<void>(`/playlists/${playlistId}/images`, {
      method: "PUT",
      headers: {
        "Content-Type": "image/jpeg",
      },
      body: base64Jpeg,
    });
  }

  // ── Recommendations ───────────────────────────────────────────────────────

  async getRecommendations(
    seedGenres: string[],
    limit = 20
  ): Promise<{ tracks: SpotifyTrack[] }> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (seedGenres.length > 0) {
      params.set("seed_genres", seedGenres.slice(0, 5).join(","));
    }
    return this.fetch(`/recommendations?${params}`);
  }

  // ── Refresh Token ─────────────────────────────────────────────────────────

  static async refreshAccessToken(refreshToken: string): Promise<{
    access_token: string;
    expires_in: number;
    refresh_token?: string;
  }> {
    const clientId = process.env.SPOTIFY_CLIENT_ID!;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;

    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!res.ok) {
      throw new SpotifyAPIError("Failed to refresh token", res.status);
    }

    return res.json();
  }

  static async getClientCredentialsToken(): Promise<string> {
    const clientId = process.env.SPOTIFY_CLIENT_ID!;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;

    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
      }),
    });

    if (!res.ok) {
      throw new SpotifyAPIError("Failed to get client credentials token", res.status);
    }

    const data = await res.json();
    return data.access_token;
  }
}

// ─── Errors ──────────────────────────────────────────────────────────────────

export class SpotifyAPIError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "SpotifyAPIError";
    this.status = status;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}
