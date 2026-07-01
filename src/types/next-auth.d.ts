/**
 * NextAuth type augmentations.
 * Adds Spotify-specific fields to Session and JWT.
 */

import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    refreshToken: string;
    spotifyId: string;
    scope?: string;
    error?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    spotifyId?: string;
    scope?: string;
    error?: string;
  }
}
