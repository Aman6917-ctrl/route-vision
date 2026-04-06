import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Route, Clock, Brain, FileText, TrendingUp } from "lucide-react";

export interface RouteResult {
  distance: number;
  path: string[];
  timeComplexity: string;
  explanation: string;
  algorithmName: string;
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
        setDisplay(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{display.toLocaleString()}</span>;
};

const cards = [
  { key: "distance", icon: Route, label: "Shortest Distance", gradient: "from-glow-purple/15 to-glow-blue/10" },
  { key: "path", icon: TrendingUp, label: "Path Taken", gradient: "from-glow-blue/15 to-glow-cyan/10" },
  { key: "complexity", icon: Clock, label: "Time Complexity", gradient: "from-glow-cyan/15 to-glow-purple/10" },
  { key: "explanation", icon: Brain, label: "How It Works", gradient: "from-glow-purple/15 to-glow-cyan/10" },
];

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
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-foreground tracking-tight">Results</h2>
          <span className="text-xs text-muted-foreground/50">Awaiting computation...</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

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
      value: <span className="text-2xl font-mono font-bold tracking-tight">{result.timeComplexity}</span>,
    },
    {
      ...cards[3],
      value: <span className="text-sm leading-relaxed font-normal text-muted-foreground">{result.explanation}</span>,
    },
  ];

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-foreground tracking-tight">
          Results — <span className="text-gradient">{result.algorithmName}</span>
        </h2>
        <div className="flex items-center gap-1.5 glass-panel px-2.5 py-1">
          <div className="w-1.5 h-1.5 rounded-full bg-glow-cyan" />
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Computed</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cardData.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="card-glow p-5 group"
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
