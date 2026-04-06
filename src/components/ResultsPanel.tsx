import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Route, Clock, Brain, TrendingUp, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { isGeminiConfigured } from "@/lib/geminiInsight";

export interface RouteResult {
  distance: number;
  path: string[];
  timeComplexity: string;
  explanation: string;
  algorithmName: string;
  /** Present when routing used OSRM (real roads) */
  durationMinutes?: number;
  dataSource?: "osrm" | "graph";
  /** AI travel briefing (when API key is set) */
  aiLoading?: boolean;
  aiInsight?: string;
  aiError?: string;
}

interface Props {
  result: RouteResult | null;
}

const AnimatedCounter = ({ value, duration = 1400 }: { value: number; duration?: number }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = value / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.round(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{display.toLocaleString()}</span>;
};

const formatDrive = (minutes: number) => {
  const m = Math.max(0, Math.round(minutes));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h <= 0) return `${r} min`;
  return `${h}h ${r}m`;
};

const SkeletonCard = () => (
  <div className="rounded-xl p-6 bg-secondary/20 border border-glass-border">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded-lg bg-muted/30 animate-pulse" />
      <div className="h-3 w-20 bg-muted/30 rounded animate-pulse" />
    </div>
    <div className="h-7 w-16 bg-muted/20 rounded animate-pulse" />
  </div>
);

const ResultsPanel = ({ result }: Props) => {
  if (!result) {
    return (
      <div className="glass-panel p-6 sm:p-7 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70 mb-1">Results</p>
            <h2 className="text-lg font-bold font-display text-foreground tracking-tight">Awaiting route</h2>
          </div>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">Computing…</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  const cards = [
    { key: "distance", icon: Route, label: "Shortest Distance", gradient: "from-glow-purple/15 to-glow-blue/10" },
    { key: "path", icon: TrendingUp, label: "Path Taken", gradient: "from-glow-blue/15 to-glow-cyan/10" },
    {
      key: "complexity",
      icon: Clock,
      label: result.dataSource === "osrm" ? "Est. drive time" : "Time Complexity",
      gradient: "from-glow-cyan/15 to-glow-purple/10",
    },
    { key: "explanation", icon: Brain, label: "How It Works", gradient: "from-glow-purple/15 to-glow-cyan/10" },
  ];

  const cardData = [
    {
      ...cards[0],
      value: (
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold"><AnimatedCounter value={result.distance} /></span>
          <span className="text-sm text-muted-foreground font-medium">km</span>
        </div>
      ),
    },
    {
      ...cards[1],
      value: (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {result.path.map((city, i) => (
            <span key={i} className="inline-flex items-center gap-1">
              <span className="text-sm font-semibold text-foreground">{city}</span>
              {i < result.path.length - 1 && <span className="text-muted-foreground text-xs">→</span>}
            </span>
          ))}
        </div>
      ),
    },
    {
      ...cards[2],
      value:
        result.dataSource === "osrm" && result.durationMinutes != null ? (
          <span className="text-2xl font-bold tracking-tight">{formatDrive(result.durationMinutes)}</span>
        ) : (
          <span className="text-2xl font-mono font-bold tracking-tight">{result.timeComplexity}</span>
        ),
    },
    {
      ...cards[3],
      value: <span className="text-sm leading-relaxed font-normal text-muted-foreground">{result.explanation}</span>,
    },
  ];

  const aiOn = isGeminiConfigured();

  return (
    <div className="glass-panel p-6 sm:p-7 rounded-2xl">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/80 mb-1.5">Results</p>
          <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-foreground">
            <span className="text-gradient">{result.algorithmName}</span>
          </h2>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-glass-border/80 bg-secondary/40 px-3 py-1.5 shadow-inner shrink-0">
          <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${result.dataSource === "osrm" ? "bg-glow-purple text-glow-purple" : "bg-glow-cyan text-glow-cyan"}`} />
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
            {result.dataSource === "osrm" ? "Live roads (OSM)" : "Hub graph"}
          </span>
        </div>
      </div>

      {aiOn ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 premium-glow-frame p-4 sm:p-5"
        >
          <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-glow-purple/25 to-glow-cyan/10 border border-glow-purple/20">
              <Sparkles className="w-4 h-4 text-glow-purple" />
            </div>
            <span className="text-sm font-semibold text-foreground tracking-tight">AI assistant</span>
            {result.aiLoading ? (
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Generating…
              </span>
            ) : null}
          </div>
          {result.aiLoading && !result.aiInsight && !result.aiError ? (
            <p className="text-xs text-muted-foreground">Preparing your travel tip…</p>
          ) : null}
          {result.aiError ? (
            <div className="flex items-start gap-2 text-sm text-destructive/90">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{result.aiError}</span>
            </div>
          ) : null}
          {result.aiInsight ? (
            <p className="text-sm leading-relaxed text-foreground/95">{result.aiInsight}</p>
          ) : null}
          </div>
        </motion.div>
      ) : (
        <p className="text-[11px] text-muted-foreground mb-6 px-0.5 leading-relaxed rounded-lg border border-glass-border/50 bg-secondary/20 p-3">
          Add <code className="text-foreground/90 font-mono text-[10px]">VITE_GEMINI_API_KEY</code> in{" "}
          <code className="text-foreground/90 font-mono text-[10px]">.env.local</code> and restart{" "}
          <code className="text-foreground/90 font-mono text-[10px]">npm run dev</code> for AI travel tips.
        </p>
      )}

      <div className="premium-divider mb-6" aria-hidden />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cardData.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="card-glow p-5 group rounded-xl"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br ${card.gradient} border border-glass-border group-hover:scale-110 transition-transform duration-300`}>
                <card.icon className="w-4 h-4 text-foreground" />
              </div>
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{card.label}</span>
            </div>
            <div className="text-foreground">{card.value}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ResultsPanel;
