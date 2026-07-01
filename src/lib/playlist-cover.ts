import sharp from "sharp";

interface CoverInput {
  moodTitle: string;
  auraColor: string;
  tagline?: string | null;
}

interface MoodPalette {
  background: string;
  glow: string;
  glowAlt: string;
  accent: string;
  shadow: string;
}

const JPEG_SIZE_LIMIT_BYTES = 256 * 1024;

export async function generateAuraPlaylistCover(input: CoverInput): Promise<string> {
  const title = cleanText(input.moodTitle || "Melo Aura");
  const aura = cleanText(input.auraColor || "Aura");
  const tagline = cleanText(input.tagline || "Generated from your listening mood");
  const palette = getMoodPalette(`${title} ${aura}`);
  const svg = buildCoverSvg({ title, aura, tagline, palette });

  for (const quality of [88, 82, 76, 70]) {
    const jpeg = await sharp(Buffer.from(svg))
      .resize(640, 640, { fit: "cover" })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();

    if (jpeg.byteLength <= JPEG_SIZE_LIMIT_BYTES || quality === 70) {
      return jpeg.toString("base64");
    }
  }

  throw new Error("Unable to generate playlist cover");
}

function buildCoverSvg({
  title,
  aura,
  tagline,
  palette,
}: {
  title: string;
  aura: string;
  tagline: string;
  palette: MoodPalette;
}) {
  const titleLines = wrapTitle(title).map(escapeXml);

  return `
<svg width="640" height="640" viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.background}" />
      <stop offset="54%" stop-color="${palette.glowAlt}" />
      <stop offset="100%" stop-color="${palette.shadow}" />
    </linearGradient>
    <radialGradient id="glow" cx="62%" cy="22%" r="58%">
      <stop offset="0%" stop-color="${palette.glow}" stop-opacity="0.95" />
      <stop offset="48%" stop-color="${palette.accent}" stop-opacity="0.42" />
      <stop offset="100%" stop-color="${palette.background}" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="lowGlow" cx="18%" cy="92%" r="64%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.22" />
      <stop offset="40%" stop-color="${palette.accent}" stop-opacity="0.28" />
      <stop offset="100%" stop-color="${palette.shadow}" stop-opacity="0" />
    </radialGradient>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="3" seed="42" />
      <feColorMatrix type="saturate" values="0" />
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0.13" />
      </feComponentTransfer>
    </filter>
  </defs>
  <rect width="640" height="640" fill="url(#bg)" />
  <rect width="640" height="640" fill="url(#glow)" />
  <rect width="640" height="640" fill="url(#lowGlow)" />
  <rect width="640" height="640" filter="url(#grain)" opacity="0.55" />
  <circle cx="514" cy="122" r="188" fill="${palette.glow}" opacity="0.24" />
  <circle cx="96" cy="540" r="170" fill="${palette.accent}" opacity="0.18" />
  <path d="M48 482 C160 418 250 500 356 432 C462 364 510 404 592 338" fill="none" stroke="#ffffff" stroke-opacity="0.16" stroke-width="3" />
  <text x="52" y="72" fill="#ffffff" opacity="0.88" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="800" letter-spacing="1.5">melo</text>
  <text x="52" y="108" fill="#ffffff" opacity="0.68" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="700">${escapeXml(aura)} aura playlist</text>
  ${titleLines.map((line, index) => `
  <text x="52" y="${268 + index * 68}" fill="#ffffff" font-family="Arial Black, Arial, Helvetica, sans-serif" font-size="58" font-weight="900">${line}</text>`).join("")}
  <rect x="52" y="522" width="74" height="5" rx="2.5" fill="#ffffff" opacity="0.9" />
  <text x="52" y="572" fill="#ffffff" opacity="0.82" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700">${escapeXml(tagline).slice(0, 86)}</text>
</svg>`;
}

function getMoodPalette(seed: string): MoodPalette {
  const text = seed.toLowerCase();

  if (text.includes("boundless") || text.includes("reverie") || text.includes("dream") || text.includes("blue")) {
    return {
      background: "#071A4A",
      glow: "#66E3FF",
      glowAlt: "#1D6FCE",
      accent: "#A7F3FF",
      shadow: "#020617",
    };
  }
  if (text.includes("night") || text.includes("midnight")) {
    return { background: "#12052F", glow: "#A78BFA", glowAlt: "#4C1D95", accent: "#38BDF8", shadow: "#05000F" };
  }
  if (text.includes("euphoric") || text.includes("explorer") || text.includes("pink")) {
    return { background: "#3B0764", glow: "#F0ABFC", glowAlt: "#C026D3", accent: "#FDBA74", shadow: "#16051F" };
  }
  if (text.includes("melancholic") || text.includes("poet")) {
    return { background: "#0F172A", glow: "#60A5FA", glowAlt: "#1E3A8A", accent: "#CBD5E1", shadow: "#020617" };
  }
  if (text.includes("energetic") || text.includes("maverick") || text.includes("orange")) {
    return { background: "#451A03", glow: "#FDBA74", glowAlt: "#EA580C", accent: "#FDE68A", shadow: "#1C0701" };
  }
  if (text.includes("calm") || text.includes("observer") || text.includes("green")) {
    return { background: "#052E2B", glow: "#6EE7B7", glowAlt: "#0F766E", accent: "#BAE6FD", shadow: "#021312" };
  }
  if (text.includes("nostalgic") || text.includes("gold")) {
    return { background: "#422006", glow: "#FDE68A", glowAlt: "#CA8A04", accent: "#F9A8D4", shadow: "#1C0A00" };
  }
  if (text.includes("intense") || text.includes("crimson") || text.includes("red")) {
    return { background: "#450A0A", glow: "#FB7185", glowAlt: "#BE123C", accent: "#FDE68A", shadow: "#170204" };
  }

  return {
    background: "#042F3D",
    glow: "#67E8F9",
    glowAlt: "#0891B2",
    accent: "#C4B5FD",
    shadow: "#020617",
  };
}

function wrapTitle(title: string): string[] {
  const words = title.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > 16 && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
