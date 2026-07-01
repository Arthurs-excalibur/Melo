"use client";

import { useEffect, useRef, useState } from "react";
import { Star, Sparkles, Mic2, Compass, BarChart2, Info, X, ArrowRight, Link as LinkIcon, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface GenreNode {
  id: string;
  genre: string;
  weight: number;
  affinity: string;
  color: string;
  relatedGenres: string[];
}

interface ArtistNode {
  name: string;
  role: string;
  score: string;
  imageUrl: string | null;
  followers?: number;
  rank?: number;
  genre?: string;
}

interface GalaxyUniverseProps {
  genreGalaxy: {
    nodes: GenreNode[];
    edges: { source: string; target: string; strength: number }[];
  };
  topArtists: ArtistNode[];
  userImage?: string | null;
}

interface PhysicsNode {
  id: string;
  name: string;
  type: "genre" | "artist";
  weight: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  color: string;
  imageUrl?: string;
  imgElement?: HTMLImageElement;
  imgLoaded: boolean;
  details: {
    roleOrAffinity: string;
    hours: number;
    score: string;
    followers?: number;
    rank?: number;
    genre?: string;
    related?: string[];
  };
}

interface StarParticle {
  x: number;
  y: number;
  z: number;
  size: number;
  alpha: number;
  speed: number;
}
// ─── Main Component ───────────────────────────────────────────────────────────
export default function GalaxyUniverse({ genreGalaxy, topArtists, userImage }: GalaxyUniverseProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState<"genres" | "artists">("genres");
  const [selectedNode, setSelectedNode] = useState<PhysicsNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<PhysicsNode | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // ── HTML-based Genre Galaxy States ─────────────────────────────────────────
  const [expandedGenreId, setExpandedGenreId] = useState<string | null>(null);
  const [genreRotationAngle, setGenreRotationAngle] = useState<number>(0);
  const [genreAutoRotate, setGenreAutoRotate] = useState<boolean>(true);
  const [genrePulseEffect, setGenrePulseEffect] = useState<Record<string, boolean>>({});
  const genreNodeRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const toggleGenreNode = (id: string) => {
    if (expandedGenreId === id) {
      setExpandedGenreId(null);
      setGenreAutoRotate(true);
      setGenrePulseEffect({});
    } else {
      setExpandedGenreId(id);
      setGenreAutoRotate(false);

      const selectedNode = genreGalaxy.nodes.find(n => n.id === id);
      if (selectedNode) {
        const newPulse: Record<string, boolean> = {};
        selectedNode.relatedGenres.forEach(gName => {
          const relNode = genreGalaxy.nodes.find(n => n.genre.toLowerCase() === gName.toLowerCase());
          if (relNode) {
            newPulse[relNode.id] = true;
          }
        });
        setGenrePulseEffect(newPulse);
        centerRotationOnGenre(id);
      }
    }
  };

  const centerRotationOnGenre = (nodeId: string) => {
    const nodes = genreGalaxy.nodes;
    const nodeIndex = nodes.findIndex((item) => item.id === nodeId);
    if (nodeIndex === -1) return;
    const totalNodes = nodes.length;
    const targetAngle = (nodeIndex / totalNodes) * 360;
    setGenreRotationAngle(270 - targetAngle);
  };

  const calculateGenreNodePosition = (index: number, total: number) => {
    const ringIndex = index % 3;
    const ringRadii = [110, 180, 250];
    const radius = ringRadii[ringIndex];
    const speedMultiplier = [1.3, 1.0, 0.7][ringIndex];
    const angle = ((index / total) * 360 + genreRotationAngle * speedMultiplier) % 360;
    const radian = (angle * Math.PI) / 180;

    const x = radius * Math.cos(radian);
    const y = radius * Math.sin(radian) * 0.40;

    const depthSort = Math.sin(radian);
    const depthZIndex = Math.round(100 + 50 * depthSort);
    const opacity = Math.max(0.35, Math.min(1, 0.35 + 0.65 * ((1 + depthSort) / 2)));
    const scale = 0.65 + 0.35 * ((1 + depthSort) / 2);

    return { x, y, angle, zIndex: depthZIndex, opacity, scale, radius };
  };

  // ── Physics engine state (artists tab) ────────────────────────────────────
  const nodesRef = useRef<PhysicsNode[]>([]);
  const starsRef = useRef<StarParticle[]>([]);
  const draggedNodeRef = useRef<PhysicsNode | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const mouseWorldRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef<number>(1);
  const targetZoomRef = useRef<number>(1);
  const cameraOffsetRef = useRef({ x: 0, y: 0 });
  const targetCameraOffsetRef = useRef({ x: 0, y: 0 });


  // ── HTML-based Genre Galaxy Auto-rotation Timer ────────────────────────────
  useEffect(() => {
    let rotationTimer: NodeJS.Timeout;

    if (genreAutoRotate && activeTab === "genres") {
      rotationTimer = setInterval(() => {
        setGenreRotationAngle((prev) => {
          const newAngle = (prev + 0.08) % 360;
          return Number(newAngle.toFixed(3));
        });
      }, 50);
    }

    return () => {
      if (rotationTimer) {
        clearInterval(rotationTimer);
      }
    };
  }, [genreAutoRotate, activeTab]);

  // ── Initialise artist physics nodes ───────────────────────────────────────
  useEffect(() => {
    if (activeTab !== "artists") return;

    const stars: StarParticle[] = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 2000, y: (Math.random() - 0.5) * 2000,
        z: Math.random() * 1000, size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.7 + 0.3, speed: Math.random() * 0.05 + 0.01,
      });
    }
    starsRef.current = stars;

    const nodes: PhysicsNode[] = [];
    topArtists.forEach((a, idx) => {
      const parsedScore = parseInt(String(a.score)) || 75;
      const node: PhysicsNode = {
        id: a.name.toLowerCase().replace(/\s+/g, "-"),
        name: a.name, type: "artist", weight: parsedScore,
        x: (Math.random() - 0.5) * 0.5,
        y: (Math.random() - 0.5) * 0.5,
        z: (Math.random() - 0.5) * 0.5,
        vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.6, vz: (Math.random() - 0.5) * 0.6,
        radius: 0,
        color: idx === 0 ? "#f72585" : idx === 1 ? "#7209b7" : idx === 2 ? "#3f37c9" : "#4cc9f0",
        imageUrl: a.imageUrl || undefined, imgLoaded: false,
        details: {
          roleOrAffinity: a.role,
          hours: Math.max(12, Math.round(180 * Math.pow(0.92, idx) + Math.random() * 5)),
          score: a.score || `${parsedScore}%`,
          followers: a.followers ?? 0, rank: a.rank ?? (idx + 1),
          genre: a.genre || a.role,
        },
      };
      if (a.imageUrl) {
        const img = new Image(); img.crossOrigin = "anonymous";
        img.onload = () => { node.imgLoaded = true; };
        img.src = a.imageUrl; node.imgElement = img;
      }
      nodes.push(node);
    });

    nodesRef.current = nodes;
    cameraOffsetRef.current = { x: 0, y: 0 };
    targetCameraOffsetRef.current = { x: 0, y: 0 };
    zoomRef.current = 1.3; targetZoomRef.current = 1.3;
  }, [activeTab, topArtists]);

  // ── Render loop ───────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const handleResize = () => {
      if (!canvas) return;
      const container = containerRef.current ?? canvas.parentElement;
      if (!container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // -- Stars for starfield background (both tabs) --
    const makeStarField = () => {
      const out: StarParticle[] = [];
      for (let i = 0; i < 120; i++) {
        out.push({ x: (Math.random() - 0.5) * 2000, y: (Math.random() - 0.5) * 2000, z: Math.random() * 1000, size: Math.random() * 1.8 + 0.3, alpha: Math.random() * 0.6 + 0.1, speed: Math.random() * 0.03 + 0.01 });
      }
      return out;
    };
    const bgStars = makeStarField();

    const loop = () => {
      if (!ctx || !canvas) return;
      const W = canvas.width, H = canvas.height;

      ctx.fillStyle = "#030712";
      ctx.fillRect(0, 0, W, H);

      // ── GENRE SOLAR SYSTEM (Stars only, planets rendered in React DOM) ───
      if (activeTab === "genres") {
        // Stars
        for (const s of bgStars) {
          ctx.beginPath(); ctx.arc((s.x + 1000) / 2000 * W, (s.y + 1000) / 2000 * H, s.size || 0.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${s.alpha})`; ctx.fill();
        }
      } else {
        // ── ARTIST PHYSICS CONSTELLATION ──────────────────────────────────
        const centerX = W / 2, centerY = H / 2;
        const focalLength = 400;

        const nebula1 = ctx.createRadialGradient(centerX - 200, centerY - 100, 100, centerX, centerY, 600);
        nebula1.addColorStop(0, "rgba(114,9,183,0.08)"); nebula1.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = nebula1; ctx.fillRect(0, 0, W, H);

        const nebula2 = ctx.createRadialGradient(centerX + 300, centerY + 200, 50, centerX, centerY, 500);
        nebula2.addColorStop(0, "rgba(76,201,240,0.06)"); nebula2.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = nebula2; ctx.fillRect(0, 0, W, H);

        zoomRef.current += (targetZoomRef.current - zoomRef.current) * 0.08;
        cameraOffsetRef.current.x += (targetCameraOffsetRef.current.x - cameraOffsetRef.current.x) * 0.08;
        cameraOffsetRef.current.y += (targetCameraOffsetRef.current.y - cameraOffsetRef.current.y) * 0.08;

        const nodes = nodesRef.current;
        for (let i = 0; i < nodes.length; i++) {
          const a = nodes[i];
          a.vx *= 0.93; a.vy *= 0.93; a.vz *= 0.93;
          const cosO = Math.cos(0.003), sinO = Math.sin(0.003);
          const rx = a.x * cosO - a.z * sinO, rz = a.x * sinO + a.z * cosO;
          a.x = rx; a.z = rz;
          const dC = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z) || 1;
          a.vx -= (a.x / dC) * 0.08; a.vy -= (a.y / dC) * 0.08; a.vz -= (a.z / dC) * 0.08;
          for (let j = i + 1; j < nodes.length; j++) {
            const b = nodes[j];
            const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
            const minD = (a.weight + b.weight) * 0.8 + 30;
            if (dist < minD) {
              const force = (minD - dist) * 0.08;
              a.vx -= (dx / dist) * force; a.vy -= (dy / dist) * force; a.vz -= (dz / dist) * force;
              b.vx += (dx / dist) * force; b.vy += (dy / dist) * force; b.vz += (dz / dist) * force;
            }
          }
          if (draggedNodeRef.current === a && isDraggingRef.current) {
            a.x = mouseWorldRef.current.x;
            a.y = mouseWorldRef.current.y;
            a.z *= 0.8; // smoothly bring to front
            a.vx = 0;
            a.vy = 0;
            a.vz = 0;
          } else {
            a.x += a.vx; a.y += a.vy; a.z += a.vz;
          }
        }

        const stars = starsRef.current;
        stars.forEach(s => {
          s.z -= s.speed * 10; if (s.z <= 0) s.z = 1000;
          const sPX = centerX + s.x * (400 / s.z) + cameraOffsetRef.current.x * 0.3;
          const sPY = centerY + s.y * (400 / s.z) + cameraOffsetRef.current.y * 0.3;
          if (sPX >= 0 && sPX <= W && sPY >= 0 && sPY <= H) {
            ctx.fillStyle = `rgba(255,255,255,${s.alpha * (1 - s.z / 1000)})`;
            ctx.beginPath(); ctx.arc(sPX, sPY, s.size * (1 - s.z / 1000), 0, Math.PI * 2); ctx.fill();
          }
        });

        const sortedNodes = [...nodes].sort((a, b) => b.z - a.z);
        sortedNodes.forEach(node => {
          const scale = (focalLength / (focalLength + node.z)) * zoomRef.current;
          const screenX = centerX + node.x * scale + cameraOffsetRef.current.x;
          const screenY = centerY + node.y * scale + cameraOffsetRef.current.y;
          const baseR = 55;
          const radius = Math.max(15, baseR * scale); node.radius = radius;
          const zOpacity = Math.max(0.15, Math.min(1.0, 1.2 - node.z / 600));
          const isHov = hoveredNode?.id === node.id, isSel = selectedNode?.id === node.id;
          ctx.shadowBlur = isHov ? 25 : isSel ? 30 : 15; ctx.shadowColor = node.color;
          ctx.strokeStyle = isHov || isSel ? node.color : `${node.color}aa`;
          ctx.lineWidth = isHov || isSel ? 4 : 2;
          ctx.beginPath(); ctx.arc(screenX, screenY, radius + 4, 0, Math.PI * 2); ctx.stroke();
          ctx.shadowBlur = 0;
          if (node.imageUrl && node.imgLoaded && node.imgElement) {
            ctx.save(); ctx.beginPath(); ctx.arc(screenX, screenY, radius, 0, Math.PI * 2); ctx.clip();
            ctx.drawImage(node.imgElement, screenX - radius, screenY - radius, radius * 2, radius * 2); ctx.restore();
            const ov = ctx.createRadialGradient(screenX - radius * 0.2, screenY - radius * 0.2, radius * 0.1, screenX, screenY, radius);
            ov.addColorStop(0, "rgba(0,0,0,0)"); ov.addColorStop(0.8, "rgba(0,0,0,0.4)"); ov.addColorStop(1, "rgba(0,0,0,0.85)");
            ctx.fillStyle = ov; ctx.beginPath(); ctx.arc(screenX, screenY, radius, 0, Math.PI * 2); ctx.fill();
          } else {
            const sg = ctx.createRadialGradient(screenX - radius * 0.3, screenY - radius * 0.3, radius * 0.1, screenX, screenY, radius);
            sg.addColorStop(0, "rgba(255,255,255,0.7)"); sg.addColorStop(0.3, node.color); sg.addColorStop(0.9, "rgba(10,10,20,0.9)"); sg.addColorStop(1, "rgba(0,0,0,0.95)");
            ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(screenX, screenY, radius, 0, Math.PI * 2); ctx.fill();
          }
          ctx.fillStyle = `rgba(255,255,255,${zOpacity * 0.95})`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          if (radius > 25) {
            ctx.font = `bold ${Math.max(10, Math.round(radius * 0.22))}px font-heading,sans-serif`;
            ctx.fillText(node.name, screenX, screenY - 2);
            ctx.font = `${Math.max(8, Math.round(radius * 0.16))}px sans-serif`;
            ctx.fillStyle = `rgba(255,255,255,${zOpacity * 0.85})`;
            ctx.fillText(`#${node.details.rank}`, screenX, screenY + Math.max(10, radius * 0.25));
          } else {
            ctx.font = "bold 9px sans-serif"; ctx.fillText(node.name.slice(0, 3).toUpperCase(), screenX, screenY);
          }
        });
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [activeTab, genreGalaxy, hoveredNode, selectedNode]);

  // ── Solar hover hit-test ──────────────────────────────────────────────────
  // ── Artist physics mouse handlers ─────────────────────────────────────────
  const handleArtistMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTab !== "artists") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    setMousePos({ x, y });
    const centerX = canvas.width / 2, centerY = canvas.height / 2;
    const sf = (400 / 400) * zoomRef.current;
    mouseWorldRef.current.x = (x - centerX - cameraOffsetRef.current.x) / sf;
    mouseWorldRef.current.y = (y - centerY - cameraOffsetRef.current.y) / sf;
    if (isDraggingRef.current && draggedNodeRef.current) return;
    const sorted = [...nodesRef.current].sort((a, b) => a.z - b.z);
    let hit: PhysicsNode | null = null;
    for (const node of sorted) {
      const sc = (400 / (400 + node.z)) * zoomRef.current;
      const px = centerX + node.x * sc + cameraOffsetRef.current.x;
      const py = centerY + node.y * sc + cameraOffsetRef.current.y;
      if (Math.sqrt((x - px) ** 2 + (y - py) ** 2) <= node.radius) { hit = node; break; }
    }
    if (hit !== hoveredNode) { setHoveredNode(hit); canvas.style.cursor = hit ? "pointer" : "default"; }
  };

  const handleMouseDown = () => { if (hoveredNode) { draggedNodeRef.current = hoveredNode; isDraggingRef.current = true; } };
  const handleMouseUp = () => { isDraggingRef.current = false; draggedNodeRef.current = null; };

  const handleMouseClick = () => {
    if (activeTab === "genres") {
      return;
    }

    if (activeTab === "artists") {
      if (hoveredNode) {
        setSelectedNode(hoveredNode);
        targetCameraOffsetRef.current = { x: -hoveredNode.x * 0.5, y: -hoveredNode.y * 0.5 };
        targetZoomRef.current = 1.35;
      } else {
        setSelectedNode(null);
        targetCameraOffsetRef.current = { x: 0, y: 0 };
        targetZoomRef.current = 1.0;
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handleArtistMouseMove(e);
  };

  const handleCanvasMouseLeave = () => {
    setHoveredNode(null);
    handleMouseUp();
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-glass p-6 md:p-8 relative overflow-hidden flex flex-col h-[700px] select-none">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#1DB954]/8 blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-mood-purple/8 blur-[100px] pointer-events-none animate-pulse delay-75" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 z-20 relative">
        <div>
          <h2 className="text-2xl font-bold font-heading flex items-center gap-2 text-white">
            <Compass className="w-6 h-6 text-mood-cyan animate-pulse" />
            Interactive Music Universe
          </h2>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("genres")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all duration-300 flex items-center gap-2 ${activeTab === "genres" ? "bg-[#1DB954] text-black shadow-lg" : "text-white/40 hover:text-white"
              }`}
          >
            <Star className="w-3.5 h-3.5" /> Genre Galaxy
          </button>
          <button
            onClick={() => setActiveTab("artists")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all duration-300 flex items-center gap-2 ${activeTab === "artists" ? "bg-[#1DB954] text-black shadow-lg" : "text-white/40 hover:text-white"
              }`}
          >
            <Mic2 className="w-3.5 h-3.5" /> Artist Constellation
          </button>
        </div>
      </div>

      {/* Genre Galaxy — HTML DOM orbital system */}
      {activeTab === "genres" && (
        <div
          className="flex-1 w-full relative rounded-2xl overflow-hidden border border-white/5 bg-black/40 backdrop-blur-sm"
          onClick={() => { if (expandedGenreId) { setExpandedGenreId(null); setGenreAutoRotate(true); setGenrePulseEffect({}); } }}
        >
          {/* Starfield canvas (stars only) */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block pointer-events-none" />

          {/* Nebula glows */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-mood-purple/10 blur-[80px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full bg-spotify-green/8 blur-[40px]" />
          </div>

          {/* Orbit rings (decorative) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[110, 180, 250].map((r, i) => (
              <div
                key={i}
                className="absolute rounded-full border border-white/[0.06]"
                style={{
                  width: r * 2,
                  height: r * 2 * 0.40,
                  borderRadius: "50%",
                }}
              />
            ))}
          </div>

          {/* Central avatar */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative z-10">
              {/* Pulse rings */}
              <div className="absolute inset-0 rounded-full border border-mood-purple/30 scale-[1.3] animate-ping opacity-40" />
              <div className="absolute inset-0 rounded-full border border-spotify-green/20 scale-[1.16]" />
              {/* Avatar */}
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-mood-purple/65 shadow-[0_0_28px_rgba(139,92,246,0.35)] bg-gradient-to-tr from-mood-purple via-mood-blue to-mood-cyan flex items-center justify-center relative">
                {userImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={userImage} alt="You" className="w-full h-full object-cover" crossOrigin="anonymous" />
                ) : (
                  <Sparkles className="w-8 h-8 text-white/60" />
                )}
              </div>
            </div>
          </div>

          {/* Orbital genre planets */}
          <div className="absolute inset-0 flex items-center justify-center">
            {(genreGalaxy?.nodes ?? []).map((node, index) => {
              const total = (genreGalaxy?.nodes ?? []).length;
              const pos = calculateGenreNodePosition(index, total);
              const isExpanded = expandedGenreId === node.id;
              const isPulsing = genrePulseEffect[node.id];
              const isRelated = !!(expandedGenreId && genrePulseEffect[node.id]);

              // Planet size based on weight
              const planetSize = Math.round(12 + (node.weight / 100) * 22);

              return (
                <div
                  key={node.id}
                  ref={el => { genreNodeRefs.current[node.id] = el; }}
                  className="absolute transition-all duration-700 cursor-pointer"
                  style={{
                    transform: `translate(${pos.x}px, ${pos.y}px)`,
                    zIndex: isExpanded ? 200 : pos.zIndex,
                    opacity: isExpanded ? 1 : pos.opacity,
                  }}
                  onClick={e => { e.stopPropagation(); toggleGenreNode(node.id); }}
                >
                  {/* Atmosphere halo */}
                  <div
                    className={`absolute rounded-full pointer-events-none ${isPulsing ? "animate-pulse" : ""}`}
                    style={{
                      background: `radial-gradient(circle, ${node.color}44 0%, transparent 70%)`,
                      width: planetSize * 3,
                      height: planetSize * 3,
                      left: -planetSize,
                      top: -planetSize,
                    }}
                  />

                  {/* Planet body */}
                  <div
                    className={`rounded-full flex items-center justify-center relative transition-all duration-300 ${isExpanded ? "scale-150" : isRelated ? "scale-110" : ""}`}
                    style={{
                      width: planetSize,
                      height: planetSize,
                      background: `radial-gradient(circle at 35% 35%, ${node.color}dd, ${node.color}44)`,
                      boxShadow: isExpanded
                        ? `0 0 20px ${node.color}99, 0 0 40px ${node.color}44`
                        : isRelated
                          ? `0 0 12px ${node.color}88`
                          : `0 0 8px ${node.color}44`,
                      border: `1.5px solid ${isExpanded || isRelated ? node.color + "cc" : node.color + "44"}`,
                    }}
                  />

                  {/* Label */}
                  <div
                    className={`absolute whitespace-nowrap text-center transition-all duration-300 pointer-events-none font-medium tracking-wide ${isExpanded ? "text-white scale-110" : isRelated ? "text-white/90" : "text-white/65"}`}
                    style={{
                      fontSize: Math.max(9, planetSize * 0.6),
                      top: planetSize + 5,
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                  >
                    {node.genre}
                  </div>

                  {/* Expanded card */}
                  {isExpanded && (
                    <div
                      className="absolute z-50 w-64 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-visible"
                      style={{ top: planetSize + 28, left: "50%", transform: "translateX(-50%)" }}
                      onClick={e => e.stopPropagation()}
                    >
                      {/* Connector line */}
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3" style={{ background: node.color + "80" }} />

                      <div className="p-4">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: node.color, boxShadow: `0 0 8px ${node.color}` }} />
                            <span className="font-bold text-white text-sm capitalize">{node.genre}</span>
                          </div>
                          <span className="text-[10px] font-mono text-white/40 border border-white/10 rounded-full px-2 py-0.5 uppercase">{node.affinity}</span>
                        </div>

                        {/* Affinity bar */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center text-xs mb-1.5">
                            <span className="flex items-center gap-1 text-white/50">
                              <Zap size={10} />
                              Affinity Score
                            </span>
                            <span className="font-mono font-bold" style={{ color: node.color }}>{node.weight}%</span>
                          </div>
                          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${node.weight}%`, background: `linear-gradient(90deg, ${node.color}, ${node.color}88)` }}
                            />
                          </div>
                        </div>

                        {/* Related genres */}
                        {node.relatedGenres?.length > 0 && (
                          <div className="border-t border-white/10 pt-3">
                            <div className="flex items-center gap-1 mb-2">
                              <LinkIcon size={10} className="text-white/40" />
                              <span className="text-[10px] uppercase tracking-wider font-medium text-white/40">Connected Genres</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {node.relatedGenres.slice(0, 6).map(g => {
                                const relNode = (genreGalaxy?.nodes ?? []).find(n => n.genre.toLowerCase() === g.toLowerCase());
                                return (
                                  <button
                                    key={g}
                                    className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                                    onClick={e => { e.stopPropagation(); if (relNode) toggleGenreNode(relNode.id); }}
                                  >
                                    {g}
                                    <ArrowRight size={8} className="text-white/30" />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Hint */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none text-white/20 text-[10px] tracking-wider">
            &nbsp;Click planets
          </div>
        </div>
      )}

      {/* Artist constellation — canvas */}
      {activeTab === "artists" && (
        <div ref={containerRef} className="flex-1 w-full relative rounded-2xl overflow-hidden border border-white/5 bg-black/40 backdrop-blur-sm">
          <canvas
            ref={canvasRef}
            onMouseMove={handleCanvasMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleCanvasMouseLeave}
            onClick={handleMouseClick}
            className="absolute inset-0 w-full h-full block"
          />

          {/* Artist hover tooltip */}
          <AnimatePresence>
            {hoveredNode && !selectedNode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                style={{ position: "absolute", left: mousePos.x + 20, top: mousePos.y + 15 }}
                className="pointer-events-none z-50 min-w-[200px] border border-white/25 bg-mood-darkest/90 backdrop-blur-xl p-4 rounded-xl shadow-2xl flex flex-col gap-1 text-sm font-sans"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hoveredNode.color }} />
                  <span className="font-bold text-white truncate max-w-[150px]">{hoveredNode.name}</span>
                </div>
                <div className="text-white/50 text-xs mt-1">{hoveredNode.details.roleOrAffinity}</div>
                <div className="flex items-center justify-between border-t border-white/10 mt-2 pt-2 text-xs">
                  <span className="text-white/40">Monthly Listeners:</span>
                  <span className="font-semibold text-mood-cyan">
                    {new Intl.NumberFormat("en-US", { notation: "compact", compactDisplay: "short" }).format(hoveredNode.details.followers ?? 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-white/40">Artist Rank:</span>
                  <span className="font-semibold text-mood-pink">#{hoveredNode.details.rank ?? "?"}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Artist selected node panel */}
          <AnimatePresence>
            {selectedNode && (
              <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 120 }}
                className="absolute inset-4 md:inset-auto md:right-4 md:top-4 md:bottom-4 md:w-[340px] z-40 border border-white/10 bg-mood-darkest/95 backdrop-blur-2xl p-6 rounded-2xl shadow-2xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full animate-ping" style={{ backgroundColor: selectedNode.color }} />
                      <h3 className="font-bold text-lg text-white font-heading truncate max-w-[200px]">{selectedNode.name}</h3>
                    </div>
                    <button
                      onClick={() => { setSelectedNode(null); targetCameraOffsetRef.current = { x: 0, y: 0 }; targetZoomRef.current = 1.0; }}
                      className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-white/50 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {selectedNode.imageUrl && (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden mb-4 border border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={selectedNode.imageUrl} alt={selectedNode.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-[#1DB954]/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10 text-xs font-semibold text-black">
                        <Sparkles className="w-3.5 h-3.5" /> Core Artist
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 font-sans mt-2">
                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-[#1DB954]" />
                        <span className="text-sm text-white/50">Monthly Listeners</span>
                      </div>
                      <span className="font-bold text-base text-[#1DB954]">
                        {new Intl.NumberFormat("en-US", { notation: "compact", compactDisplay: "short" }).format(selectedNode.details.followers ?? 0)}
                      </span>
                    </div>
                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-mood-pink" />
                        <span className="text-sm text-white/50">Artist Rank</span>
                      </div>
                      <span className="font-bold text-base text-mood-pink">#{selectedNode.details.rank ?? "?"}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 flex items-center justify-between text-xs text-white/30">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Real-time Spotify metrics
                  </span>
                  <span>ID: {selectedNode.id}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
