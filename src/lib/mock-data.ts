export interface Artist {
  name: string;
  role: string;
  score: string;
}

export const MOCK_TOP_ARTISTS: Artist[] = [
  { name: "The Midnight", role: "Synthwave", score: "98%" },
  { name: "Beach House", role: "Dream Pop", score: "94%" },
  { name: "Odesza", role: "Electronic", score: "89%" },
  { name: "Slowdive", role: "Shoegaze", score: "82%" },
];

export const MOCK_USER_AURA = {
  name: "Midnight Dreamer",
  color: "Midnight Blue",
  description: "Emotionally introspective, artistically curious, and drawn to atmospheric sounds that echo in the dark.",
  intensity: "87%",
  intensityLabel: "Intense",
};
