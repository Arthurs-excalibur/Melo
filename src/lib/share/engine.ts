import { db } from "@/lib/db";

/**
 * Retrieves a share card from the database.
 * Falls back to mock data if not found for testing purposes.
 */
export async function getShareCard(id: string) {
  try {
    const card = await db.shareCard.findUnique({
      where: { id },
      include: { user: true },
    });

    if (card) return card;

    // Optional: Return mock data if ID matches a special test ID
    if (id === "demo-aura") {
      return {
        id: "demo-aura",
        userId: "demo-user",
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        archetype: "The Night Wanderer",
        narrative: "Your music tastes reflect a deep, introspective journey...",
        auraColor: "Midnight Blue",
        auraDescription: "Emotionally introspective and atmospheric.",
        moodTitle: "Midnight Dreamer",
        tagline: "Echoes in the dark.",
        topGenres: ["Synthwave", "Dream Pop"],
        audioDNA: {
          energy: 0.72,
          chaos: 0.45,
          emotionality: 0.65,
          danceability: 0.58,
          nostalgia: 0.40,
          acousticness: 0.20,
          experimentalism: 0.15
        },
        emotionalProfile: {
          valence: 0.60,
          energy: 0.72,
          danceability: 0.58,
          acousticness: 0.20,
          instrumentalness: 0.15,
          tempo: 120,
          moodScore: 68,
          chaosIndex: 0.45,
          emotionalDepth: 0.65,
          nostalgiaFactor: 0.40
        },
        user: {
          id: "demo-user",
          spotifyId: "demo-spotify",
          email: "demo@moodify.app",
          name: "Demo User",
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching share card:", error);
    return null;
  }
}
