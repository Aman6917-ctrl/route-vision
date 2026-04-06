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

const algorithmData: Record<string, { name: string; path: string[]; distance: number; complexity: string; explanation: string }> = {
  "bellman-ford": {
    name: "Bellman-Ford",
    path: ["a", "b", "c", "g", "h"],
    distance: 2450,
    complexity: "O(V·E)",
    explanation: "Relaxes all edges V-1 times. Handles negative weights. Guarantees shortest path in weighted directed graphs.",
  },
  "all-pairs": {
    name: "Floyd-Warshall",
    path: ["a", "e", "f", "g", "h"],
    distance: 2680,
    complexity: "O(V³)",
    explanation: "Computes shortest paths between all pairs of vertices using dynamic programming over intermediate nodes.",
  },
  "greedy": {
    name: "Greedy Selection",
    path: ["a", "b", "c", "d", "h"],
    distance: 2320,
    complexity: "O(E log E)",
    explanation: "Greedily picks the shortest available edge at each step. Fast but may not find global optimum.",
  },
  "tsp": {
    name: "TSP Approximation",
    path: ["a", "e", "f", "c", "b", "d", "h", "g"],
    distance: 4150,
    complexity: "O(n² · 2ⁿ)",
    explanation: "NP-hard problem approximated using nearest neighbor heuristic. Visits all nodes exactly once.",
  },
};

const barColors = [
  "linear-gradient(90deg, hsl(265 90% 65%), hsl(265 90% 55%))",
  "linear-gradient(90deg, hsl(220 90% 60%), hsl(220 90% 50%))",
  "linear-gradient(90deg, hsl(185 95% 55%), hsl(185 95% 45%))",
  "linear-gradient(90deg, hsl(0 72% 55%), hsl(0 72% 45%))",
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
        path: data.path.map((id) => {
          const names: Record<string, string> = { a: "NYC", b: "CHI", c: "DEN", d: "SEA", e: "ATL", f: "DAL", g: "LA", h: "SF" };
          return names[id] || id;
        }),
        timeComplexity: data.complexity,
        explanation: data.explanation,
        algorithmName: data.name,
      });

      // Generate comparison data
      const comparison = Object.entries(algorithmData).map(([, v], i) => ({
        name: v.name,
        distance: v.distance,
        color: barColors[i],
      }));
      setComparisonResults(comparison);
      setIsLoading(false);
    }, 1800);
  }, []);

  return (
    <div className="min-h-screen noise-overlay">
      <AnimatedBackground />
      <CursorGlow />

      <AnimatePresence mode="wait">
        {!showDashboard ? (
          <motion.div
            key="hero"
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
          >
            <HeroSection onStart={handleStart} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8"
          >
            {/* Header */}
            <motion.div
              className="mb-8 flex items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <button
                onClick={() => setShowDashboard(false)}
                className="glass-panel px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold glow-text">Route Planner</h1>
                <p className="text-sm text-muted-foreground">Configure and visualize optimal routes</p>
              </div>
            </motion.div>

            {/* Main layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <motion.div
                className="lg:col-span-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <RouteControls onFindRoute={handleFindRoute} isLoading={isLoading} />
              </motion.div>

              <motion.div
                className="lg:col-span-8 min-h-[400px]"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <MapVisualization routePath={routePath} isAnimating={isLoading} />
              </motion.div>
            </div>

            {/* Results */}
            <div className="mt-6 space-y-6">
              <ResultsPanel result={result} />
              <ComparisonSection results={comparisonResults} />
            </div>

            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
