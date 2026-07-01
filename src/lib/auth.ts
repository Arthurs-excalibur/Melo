/**
 * NextAuth v4 configuration with real Spotify OAuth.
 *
 * REQUIRED env vars:
 *   SPOTIFY_CLIENT_ID
 *   SPOTIFY_CLIENT_SECRET
 *   NEXTAUTH_SECRET
 *   NEXTAUTH_URL
 */

import { type NextAuthOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import { SpotifyClient } from "@/lib/spotify/client";

// Scopes required by Melo
const SPOTIFY_SCOPES = [
  "user-read-email",
  "user-read-private",
  "user-top-read",
  "user-read-recently-played",
  "user-library-read",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-private",
  "playlist-modify-public",
  "ugc-image-upload",
].join(" ");

export const authOptions: NextAuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: SPOTIFY_SCOPES,
          show_dialog: true,
        },
      },
    }),
  ],



  session: {
    strategy: "jwt",
    // 1 hour — matches Spotify access token lifetime
    maxAge: 60 * 60,
  },

  callbacks: {
    /**
     * On initial sign-in store the Spotify tokens in the JWT.
     * On subsequent calls check expiry and refresh if needed.
     */
    async jwt({ token, account }) {
      // Initial sign-in: account is present
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + 3600 * 1000;
        token.spotifyId = account.providerAccountId;
        token.scope = account.scope ?? "";
        return token;
      }

      // Token still valid
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token expired — refresh it
      try {
        const refreshed = await SpotifyClient.refreshAccessToken(
          token.refreshToken as string
        );
        token.accessToken = refreshed.access_token;
        token.accessTokenExpires = Date.now() + refreshed.expires_in * 1000;
        if (refreshed.refresh_token) {
          token.refreshToken = refreshed.refresh_token;
        }
        token.error = undefined;
      } catch {
        token.error = "RefreshAccessTokenError";
      }

      return token;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.spotifyId = token.spotifyId as string;
      session.scope = token.scope as string | undefined;
      session.error = token.error as string | undefined;

      if (session.user) {
        if (token.name) session.user.name = token.name as string;
        if (token.picture) session.user.image = token.picture as string;
        if (token.email) session.user.email = token.email as string;
      }

      return session;
    },
  },
};

// Re-export auth() helper used by server components and route handlers
import { getServerSession } from "next-auth/next";
export const auth = () => getServerSession(authOptions);
