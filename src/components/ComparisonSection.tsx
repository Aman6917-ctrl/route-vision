import { motion } from "framer-motion";
import { Trophy, Medal, TrendingDown } from "lucide-react";

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
  const minDist = Math.min(...results.map((r) => r.distance));

  return (
    <motion.div
      className="glass-panel p-6 sm:p-8"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight font-display">Algorithm Comparison</h2>
          <p className="text-xs text-muted-foreground mt-1">Distance comparison across all algorithms</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <TrendingDown className="w-3.5 h-3.5" />
          <span>Lower is better</span>
        </div>
      </div>
      <div className="space-y-6">
        {results.map((r, i) => {
          const isBest = r.distance === minDist;
          return (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  {isBest ? (
                    <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "hsl(45 90% 55% / 0.15)" }}>
                      <Trophy className="w-3.5 h-3.5" style={{ color: "hsl(45, 90%, 55%)" }} />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-md flex items-center justify-center bg-secondary/30">
                      <Medal className="w-3 h-3 text-muted-foreground/40" />
                    </div>
                  )}
                  <span className={`text-sm font-semibold ${isBest ? "text-foreground" : "text-muted-foreground"}`}>
                    {r.name}
                  </span>
                  {isBest && (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
                      style={{ background: "hsl(45 90% 55% / 0.12)", color: "hsl(45, 90%, 55%)" }}>
                      Optimal
                    </span>
                  )}
                </div>
                <span className={`text-sm font-mono font-bold ${isBest ? "text-foreground" : "text-muted-foreground"}`}>
                  {r.distance.toLocaleString()} km
                </span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: "hsl(230 25% 10%)" }}>
                <motion.div
                  className="h-full rounded-full relative overflow-hidden"
                  style={{ background: r.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(r.distance / maxDist) * 100}%` }}
                  transition={{ duration: 1.4, delay: 0.4 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Shimmer on bar */}
                  <div className="absolute inset-0"
                    style={{
                      background: "linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 3s ease-in-out infinite",
                      animationDelay: `${i * 0.5}s`,
                    }}
                  />
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ComparisonSection;
