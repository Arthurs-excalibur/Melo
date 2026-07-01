"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Zap, Moon, Sun, Loader2 } from "lucide-react";

interface MoodDataPoint {
  date: string;
  valence: number;
  energy: number;
  trackCount: number;
  dominantMood: string;
  projected?: boolean;
}

interface MoodGraphPayload {
  series: MoodDataPoint[];
  summary: {
    avgMood: number;
    trendDirection: "rising" | "falling" | "stable";
    peakDay: string | null;
    lowDay: string | null;
  };
}

interface EmotionalJourneyProps {
  moodGraph: MoodGraphPayload;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const data: MoodDataPoint = payload[0]?.payload;

  const MOOD_COLORS: Record<string, string> = {
    Euphoric: "#1DB954", Energetic: "#ff6b35", Melancholic: "#4895ef",
    Calm: "#4cc9f0", Intense: "#7209b7", Nostalgic: "#9b5de5", Neutral: "#B3B3B3",
  };
  const moodColor = MOOD_COLORS[data.dominantMood] || "#B3B3B3";
  const formattedDate = new Date(label + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });

  return (
    <div className="bg-[#181818] border border-white/10 rounded-xl p-3 backdrop-blur-xl shadow-2xl min-w-[180px]">
      <p className="text-white/50 text-xs mb-2">{formattedDate}</p>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: moodColor }} />
        <span className="font-semibold text-sm text-white">{data.dominantMood}</span>
        {data.projected && (
          <span className="text-[10px] text-white/30 ml-auto">est.</span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs">
        <span className="text-white/40">Valence</span>
        <span className="text-[#1DB954] font-medium">{Math.round(data.valence * 100)}%</span>
        <span className="text-white/40">Energy</span>
        <span className="text-mood-pink font-medium">{Math.round(data.energy * 100)}%</span>
        {!data.projected && <><span className="text-white/40">Tracks</span><span className="text-white/70 font-medium">{data.trackCount}</span></>}
      </div>
    </div>
  );
};

const RANGES = [
  { label: "Last 7 Days", days: 7 },
  { label: "Last 2 Weeks", days: 14 },
  { label: "Last 30 Days", days: 30 },
] as const;

type RangeDays = 7 | 14 | 30;

export default function EmotionalJourney({ moodGraph }: EmotionalJourneyProps) {
  const [activeDays, setActiveDays] = useState<RangeDays>(30);
  const [activeLines, setActiveLines] = useState({ valence: true, energy: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cache, setCache] = useState<Record<number, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const isMounted = useRef(true);

  const fetchRange = useCallback(async (days: RangeDays) => {
    if (cache[days]) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/visualizations/mood-graph?days=${days}`);
      if (res.ok) {
        const data = await res.json();
        setCache((prev) => ({ ...prev, [days]: data }));
      }
    } catch {
      // fall back to prop data
    } finally {
      setIsLoading(false);
    }
  }, [cache]);

  // Fetch all 3 ranges on mount — 30d first (active), then background
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRange(30);
    // slight delay so 30d loads first
    const t = setTimeout(() => { fetchRange(7); fetchRange(14); }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRangeChange = async (days: RangeDays) => {
    setActiveDays(days);
    if (!cache[days]) {
      setIsLoading(true);
      await fetchRange(days);
    }
  };

  const currentData = cache[activeDays] ?? moodGraph;
  const series = useMemo(() => currentData?.series ?? [], [currentData]);
  const summary = currentData?.summary;

  const avgValence = useMemo(
    () => series.length ? Math.round((series.reduce((a: number, d: MoodDataPoint) => a + d.valence, 0) / series.length) * 100) : 0,
    [series]
  );
  const avgEnergy = useMemo(
    () => series.length ? Math.round((series.reduce((a: number, d: MoodDataPoint) => a + d.energy, 0) / series.length) * 100) : 0,
    [series]
  );

  const TrendIcon = summary?.trendDirection === "rising" ? TrendingUp
    : summary?.trendDirection === "falling" ? TrendingDown : Minus;
  const trendColor = summary?.trendDirection === "rising" ? "text-[#1DB954]"
    : summary?.trendDirection === "falling" ? "text-red-400" : "text-white/40";

  if (!series.length && !isLoading) {
    return (
      <div className="flex-1 min-h-[220px] flex flex-col items-center justify-center gap-2 border border-white/5 rounded-2xl bg-white/5">
        <p className="text-white/30 italic text-sm">No listening data found for this period.</p>
        <p className="text-white/20 text-xs">Try a wider time range or listen to more music!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Stats Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className={`flex items-center gap-1.5 text-sm font-semibold ${trendColor}`}>
          <TrendIcon className="w-4 h-4" />
          <span className="capitalize">{summary?.trendDirection ?? "stable"}</span>
        </div>
        <div className="w-px h-4 bg-white/10" />
        <div className="flex items-center gap-1.5 text-sm">
          <Zap className="w-3.5 h-3.5 text-mood-pink" />
          <span className="text-white/40">Avg Mood</span>
          <span className="text-white font-semibold">{summary?.avgMood ?? 0}%</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <Sun className="w-3.5 h-3.5 text-[#1DB954]" />
          <span className="text-white/40">Valence</span>
          <span className="text-white font-semibold">{avgValence}%</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <Moon className="w-3.5 h-3.5 text-mood-purple" />
          <span className="text-white/40">Energy</span>
          <span className="text-white font-semibold">{avgEnergy}%</span>
        </div>
        {/* Legend toggles */}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setActiveLines(l => ({ ...l, valence: !l.valence }))}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${
              activeLines.valence ? "border-[#1DB954]/60 bg-[#1DB954]/10 text-[#1DB954]" : "border-white/10 text-white/30"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#1DB954]" />Valence
          </button>
          <button
            onClick={() => setActiveLines(l => ({ ...l, energy: !l.energy }))}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${
              activeLines.energy ? "border-mood-pink/60 bg-mood-pink/10 text-mood-pink" : "border-white/10 text-white/30"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-mood-pink" />Energy
          </button>
        </div>
      </div>

      {/* Range Selector */}
      <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 self-start">
        {RANGES.map(({ label, days }) => (
          <button
            key={days}
            onClick={() => handleRangeChange(days as RangeDays)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
              activeDays === days ? "bg-[#1DB954] text-black shadow" : "text-white/40 hover:text-white/70"
            }`}
          >
            {isLoading && activeDays === days && <Loader2 className="w-3 h-3 animate-spin" />}
            {label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[180px] relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl z-10 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-[#1DB954] text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading {activeDays}-day data...
            </div>
          </div>
        )}
        {isMounted && (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 10, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="valenceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1DB954" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#1DB954" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f72585" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f72585" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(d) => new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
              axisLine={false} tickLine={false} interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 1]}
              tickFormatter={(v) => `${Math.round(v * 100)}%`}
              tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
              axisLine={false} tickLine={false} tickCount={5}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }} />
            <ReferenceLine y={0.5} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
            {summary?.peakDay && (
              <ReferenceLine x={summary.peakDay} stroke="rgba(29,185,84,0.35)" strokeDasharray="3 3"
                label={{ value: "Peak", position: "top", fill: "rgba(29,185,84,0.6)", fontSize: 9 }} />
            )}
            {summary?.lowDay && summary.lowDay !== summary.peakDay && (
              <ReferenceLine x={summary.lowDay} stroke="rgba(247,37,133,0.35)" strokeDasharray="3 3"
                label={{ value: "Low", position: "top", fill: "rgba(247,37,133,0.6)", fontSize: 9 }} />
            )}
            {activeLines.valence && (
              <Area type="monotone" dataKey="valence" stroke="#1DB954" strokeWidth={2}
                fill="url(#valenceGrad)" dot={false}
                activeDot={{ r: 4, fill: "#1DB954", stroke: "rgba(29,185,84,0.3)", strokeWidth: 4 }} />
            )}
            {activeLines.energy && (
              <Area type="monotone" dataKey="energy" stroke="#f72585" strokeWidth={2}
                fill="url(#energyGrad)" dot={false}
                activeDot={{ r: 4, fill: "#f72585", stroke: "rgba(247,37,133,0.3)", strokeWidth: 4 }} />
            )}
          </AreaChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
