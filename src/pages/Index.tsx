import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedBackground from "@/components/AnimatedBackground";
import CursorGlow from "@/components/CursorGlow";
import HeroSection from "@/components/HeroSection";
import RouteControls, { type RouteConfig } from "@/components/RouteControls";
import MapVisualization from "@/components/MapVisualization";
import ResultsPanel, { type RouteResult } from "@/components/ResultsPanel";
import ComparisonSection from "@/components/ComparisonSection";
import Footer from "@/components/Footer";

const cityNames: Record<string, string> = {
  del: "Delhi", jai: "Jaipur", ahm: "Ahmedabad", mum: "Mumbai",
  goa: "Goa", blr: "Bangalore", chn: "Chennai", hyd: "Hyderabad",
  kol: "Kolkata", lko: "Lucknow", pat: "Patna", pun: "Pune",
};

const algorithmData: Record<string, { name: string; path: string[]; distance: number; complexity: string; explanation: string }> = {
  "bellman-ford": {
    name: "Bellman-Ford",
    path: ["del", "jai", "ahm", "mum", "pun", "hyd", "blr", "chn"],
    distance: 2880,
    complexity: "O(V·E)",
    explanation: "Relaxes all edges V-1 times to find shortest path. Handles negative edge weights and detects negative cycles in weighted directed graphs.",
  },
  "all-pairs": {
    name: "Floyd-Warshall",
    path: ["del", "lko", "pat", "kol"],
    distance: 1680,
    complexity: "O(V³)",
    explanation: "Computes shortest paths between all pairs of vertices using dynamic programming. Uses intermediate nodes to progressively improve distance estimates.",
  },
  "greedy": {
    name: "Greedy Selection",
    path: ["del", "jai", "ahm", "mum"],
    distance: 1470,
    complexity: "O(E log E)",
    explanation: "At each step, greedily selects the shortest available edge. Produces fast results but does not guarantee a globally optimal solution.",
  },
  "tsp": {
    name: "TSP Approximation",
    path: ["del", "jai", "ahm", "mum", "pun", "goa", "blr", "chn", "hyd", "kol", "pat", "lko"],
    distance: 6840,
    complexity: "O(n² · 2ⁿ)",
    explanation: "NP-hard problem solved with nearest-neighbor heuristic. Visits every city exactly once and returns to origin, minimizing total distance.",
  },
};

const barColors = [
  "linear-gradient(90deg, hsl(265 90% 65%), hsl(265 80% 55%))",
  "linear-gradient(90deg, hsl(220 90% 60%), hsl(220 80% 50%))",
  "linear-gradient(90deg, hsl(170 90% 45%), hsl(185 95% 40%))",
  "linear-gradient(90deg, hsl(35 95% 55%), hsl(25 90% 50%))",
];

const Index = () => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RouteResult | null>(null);
  const [routePath, setRoutePath] = useState<string[] | undefined>();
  const [comparisonResults, setComparisonResults] = useState<{ name: string; distance: number; color: string }[]>([]);

  const handleStart = useCallback(() => setShowDashboard(true), []);

  const handleFindRoute = useCallback((config: RouteConfig) => {
    setIsLoading(true);
    setResult(null);
    setRoutePath(undefined);
    setComparisonResults([]);

    setTimeout(() => {
      const data = algorithmData[config.algorithm];
      setRoutePath(data.path);
      setResult({
        distance: data.distance,
        path: data.path.map((id) => cityNames[id] || id),
        timeComplexity: data.complexity,
        explanation: data.explanation,
        algorithmName: data.name,
      });

      const comparison = Object.entries(algorithmData).map(([, v], i) => ({
        name: v.name,
        distance: v.distance,
        color: barColors[i],
      }));
      setComparisonResults(comparison);
      setIsLoading(false);
    }, 2000);
  }, []);

  return (
    <div className="min-h-screen noise-overlay">
      <AnimatedBackground />
      <CursorGlow />

      <AnimatePresence mode="wait">
        {!showDashboard ? (
          <motion.div
            key="hero"
            exit={{ opacity: 0, y: -40, filter: "blur(8px)" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <HeroSection onStart={handleStart} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, filter: "blur(8px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8"
          >
            {/* Header */}
            <motion.div
              className="mb-8 flex items-center justify-between"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => { setShowDashboard(false); setResult(null); setRoutePath(undefined); setComparisonResults([]); }}
                  className="glass-panel-hover px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  ← Back
                </button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold glow-text tracking-tight">Route Planner</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">Configure and visualize optimal routes across India</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 glass-panel px-3 py-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-glow-cyan" />
                <span className="text-xs text-muted-foreground font-medium">Live</span>
              </div>
            </motion.div>

            {/* Main layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <motion.div
                className="lg:col-span-4"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <RouteControls onFindRoute={handleFindRoute} isLoading={isLoading} />
              </motion.div>

              <motion.div
                className="lg:col-span-8 min-h-[420px]"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <MapVisualization routePath={routePath} isAnimating={isLoading} />
              </motion.div>
            </div>

            {/* Results */}
            <motion.div
              className="mt-8 space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <ResultsPanel result={result} />
              <ComparisonSection results={comparisonResults} />
            </motion.div>

            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
