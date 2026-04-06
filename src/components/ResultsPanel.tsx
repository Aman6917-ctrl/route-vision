import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Route, Clock, Brain, FileText } from "lucide-react";

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

const AnimatedCounter = ({ value, duration = 1200 }: { value: number; duration?: number }) => {
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
  { key: "distance", icon: Route, label: "Shortest Distance", color: "from-glow-purple/20 to-glow-blue/10" },
  { key: "path", icon: FileText, label: "Path Taken", color: "from-glow-blue/20 to-glow-cyan/10" },
  { key: "complexity", icon: Clock, label: "Time Complexity", color: "from-glow-cyan/20 to-glow-purple/10" },
  { key: "explanation", icon: Brain, label: "Explanation", color: "from-glow-purple/20 to-glow-cyan/10" },
];

const ResultsPanel = ({ result }: Props) => {
  if (!result) {
    return (
      <div className="glass-panel p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Results</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl p-5 bg-secondary/30 animate-pulse">
              <div className="h-4 w-24 bg-muted rounded mb-3" />
              <div className="h-8 w-16 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const cardData = [
    { ...cards[0], value: <><AnimatedCounter value={result.distance} /> <span className="text-sm text-muted-foreground font-normal">mi</span></> },
    { ...cards[1], value: <span className="text-base font-mono">{result.path.join(" → ")}</span> },
    { ...cards[2], value: <span className="font-mono">{result.timeComplexity}</span> },
    { ...cards[3], value: <span className="text-sm leading-relaxed font-normal text-muted-foreground">{result.explanation}</span> },
  ];

  return (
    <div className="glass-panel p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Results — <span className="text-gradient">{result.algorithmName}</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cardData.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="card-glow p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${card.color}`}>
                <card.icon className="w-4 h-4 text-foreground" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">{card.label}</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{card.value}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ResultsPanel;
