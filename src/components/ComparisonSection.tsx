import { motion } from "framer-motion";
import { Trophy, Medal } from "lucide-react";

interface AlgoResult {
  name: string;
  distance: number;
  color: string;
}

interface Props {
  results: AlgoResult[];
}

const ComparisonSection = ({ results }: Props) => {
  if (results.length === 0) return null;

  const maxDist = Math.max(...results.map((r) => r.distance));
  const bestIdx = results.indexOf(results.reduce((a, b) => (a.distance < b.distance ? a : b)));

  return (
    <motion.div
      className="glass-panel p-6"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground tracking-tight">Algorithm Comparison</h2>
        <span className="text-xs text-muted-foreground">Lower is better</span>
      </div>
      <div className="space-y-5">
        {results.map((r, i) => (
          <motion.div
            key={r.name}
            className="group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {i === bestIdx ? (
                  <Trophy className="w-4 h-4" style={{ color: "hsl(45, 90%, 55%)" }} />
                ) : (
                  <Medal className="w-3.5 h-3.5 text-muted-foreground/40" />
                )}
                <span className={`text-sm font-medium ${i === bestIdx ? "text-foreground" : "text-muted-foreground"}`}>
                  {r.name}
                </span>
                {i === bestIdx && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider"
                    style={{ background: "hsl(45 90% 55% / 0.1)", color: "hsl(45, 90%, 55%)" }}>
                    Best
                  </span>
                )}
              </div>
              <span className="text-sm font-mono font-semibold text-muted-foreground">{r.distance.toLocaleString()} km</span>
            </div>
            <div className="h-3 rounded-full bg-secondary/30 overflow-hidden">
              <motion.div
                className="h-full rounded-full relative"
                style={{ background: r.color }}
                initial={{ width: 0 }}
                animate={{ width: `${(r.distance / maxDist) * 100}%` }}
                transition={{ duration: 1.2, delay: 0.4 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              >
                {i === bestIdx && (
                  <div className="absolute inset-0 rounded-full animate-glow-pulse" />
                )}
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ComparisonSection;
