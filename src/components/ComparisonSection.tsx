import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h2 className="text-lg font-semibold text-foreground mb-6">Algorithm Comparison</h2>
      <div className="space-y-4">
        {results.map((r, i) => (
          <div key={r.name} className="flex items-center gap-4">
            <div className="w-40 flex items-center gap-2">
              {i === bestIdx && <Trophy className="w-4 h-4 text-yellow-400" />}
              <span className={`text-sm font-medium ${i === bestIdx ? "text-foreground" : "text-muted-foreground"}`}>
                {r.name}
              </span>
            </div>
            <div className="flex-1 h-8 rounded-lg bg-secondary/30 overflow-hidden relative">
              <motion.div
                className="h-full rounded-lg"
                style={{
                  background: r.color,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${(r.distance / maxDist) * 100}%` }}
                transition={{ duration: 1, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-foreground/70">
                {r.distance} mi
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ComparisonSection;
