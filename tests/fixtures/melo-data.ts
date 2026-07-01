export const mockSession = {
  user: {
    name: "Avery Listener",
    email: "avery@example.com",
    image: null,
  },
  accessToken: "test-access-token",
  refreshToken: "test-refresh-token",
  spotifyId: "spotify-user-123",
  scope: "user-read-email user-top-read playlist-modify-private playlist-modify-public ugc-image-upload",
  expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
};

export const mockAnalysis = {
  status: "completed",
  data: {
    shareId: "demo-aura",
    topGenres: ["dream pop", "indie soul", "ambient", "neo r&b"],
    aura: {
      color: "Emerald",
      name: "Velvet Voyager",
      description: "You drift between lush hooks, night-drive textures, and quietly euphoric choruses.",
      intensity: "78%",
      intensityLabel: "Intense",
    },
    personality: {
      narrative: "A listener pulled toward detail, atmosphere, and emotional contrast.",
      emotionalSummary: "Warm, reflective, and high-energy in waves.",
      moodTitle: "Velvet Voyager",
      auraColor: "Emerald",
      auraDescription: "You drift between lush hooks, night-drive textures, and quietly euphoric choruses.",
      shareableTagline: "Soft glow, sharp taste.",
      listeningEras: ["Midnight Focus", "Golden Commute"],
    },
    archetype: "Explorer",
    genreGalaxy: {
      nodes: [
        { id: "dream-pop", genre: "dream pop", weight: 85, affinity: "core", relatedGenres: ["ambient", "indie soul"] },
        { id: "indie-soul", genre: "indie soul", weight: 70, affinity: "adjacent", relatedGenres: ["neo r&b"] },
        { id: "ambient", genre: "ambient", weight: 55, affinity: "adjacent", relatedGenres: ["dream pop"] },
        { id: "neo-rnb", genre: "neo r&b", weight: 40, affinity: "peripheral", relatedGenres: ["indie soul"] },
      ],
      edges: [
        { source: "dream-pop", target: "ambient", strength: 0.9 },
        { source: "dream-pop", target: "indie-soul", strength: 0.7 },
      ],
    },
    audioDNA: {
      dimensions: [
        { label: "Energy", value: 78, description: "Big-motion songs with room to breathe." },
        { label: "Valence", value: 64, description: "Mostly bright, with some late-night shade." },
        { label: "Acousticness", value: 38, description: "Polished, textured, and electronic-leaning." },
      ],
    },
    moodGraph: {
      series: Array.from({ length: 30 }, (_, index) => ({
        date: `2026-06-${String(index + 1).padStart(2, "0")}`,
        valence: 0.45 + index * 0.01,
        energy: 0.62,
        trackCount: 12 + index,
        dominantMood: index % 2 ? "Calm" : "Euphoric",
      })),
      summary: {
        avgMood: 68,
        trendDirection: "rising",
        peakDay: "2026-06-28",
        lowDay: "2026-06-03",
      },
    },
    topArtists: [
      { name: "SZA", role: "R&B", score: "88%", imageUrl: null, followers: 16000000, rank: 1, genre: "R&B" },
      { name: "Frank Ocean", role: "Alternative R&B", score: "85%", imageUrl: null, followers: 12000000, rank: 2, genre: "Alternative R&B" },
      { name: "Kendrick Lamar", role: "Hip Hop", score: "82%", imageUrl: null, followers: 26000000, rank: 3, genre: "Hip Hop" },
      { name: "Laufey", role: "Jazz Pop", score: "79%", imageUrl: null, followers: 5000000, rank: 4, genre: "Jazz Pop" },
      { name: "Tyler, The Creator", role: "Alternative Hip Hop", score: "77%", imageUrl: null, followers: 15000000, rank: 5, genre: "Alternative Hip Hop" },
      { name: "Billie Eilish", role: "Art Pop", score: "75%", imageUrl: null, followers: 98000000, rank: 6, genre: "Art Pop" },
    ],
    topTracks: [
      { id: "track-1", name: "Saturn", artist: "SZA", imageUrl: null, previewUrl: null },
      { id: "track-2", name: "Pink + White", artist: "Frank Ocean", imageUrl: null, previewUrl: null },
      { id: "track-3", name: "Sweet", artist: "Laufey", imageUrl: null, previewUrl: null },
      { id: "track-4", name: "Euphoria", artist: "Kendrick Lamar", imageUrl: null, previewUrl: null },
      { id: "track-5", name: "Birds of a Feather", artist: "Billie Eilish", imageUrl: null, previewUrl: null },
      { id: "track-6", name: "See You Again", artist: "Tyler, The Creator", imageUrl: null, previewUrl: null },
    ],
  },
};

export const emptyAnalysis = {
  ...mockAnalysis,
  data: {
    ...mockAnalysis.data,
    topTracks: [],
    topArtists: [],
    genreGalaxy: { nodes: [], edges: [] },
    moodGraph: { series: [], summary: { avgMood: 0, trendDirection: "stable", peakDay: null, lowDay: null } },
  },
};

export const mockCompatibility = {
  status: "completed",
  data: {
    score: 86,
    label: "Cosmic Match",
    breakdown: {
      genreSimilarity: 88,
      emotionalAlignment: 84,
      artistOverlap: 72,
      energyMatch: 91,
    },
    insight: "Your libraries orbit the same emotional center with a few fun collisions.",
    shareMessage: "We are an 86% Melo match.",
  },
};

export const mockShareCard = {
  id: "demo-aura",
  moodTitle: "Velvet Voyager",
  auraColor: "Emerald",
  auraDescription: "You drift between lush hooks, night-drive textures, and quietly euphoric choruses.",
  tagline: "Soft glow, sharp taste.",
  topGenres: ["dream pop", "indie soul"],
  emotionalProfile: { energy: 0.78, valence: 0.64 },
  createdAt: "2026-06-24T00:00:00.000Z",
  user: { name: "Avery Listener" },
};
