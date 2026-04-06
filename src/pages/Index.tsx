import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import AnimatedBackground from "@/components/AnimatedBackground";
import CursorGlow from "@/components/CursorGlow";
import HeroSection from "@/components/HeroSection";
import RouteControls, { type RouteConfig } from "@/components/RouteControls";
import MapVisualization from "@/components/MapVisualization";
import ResultsPanel, { type RouteResult } from "@/components/ResultsPanel";
import ComparisonSection from "@/components/ComparisonSection";
import Footer from "@/components/Footer";
import { computeRoute, getAlgorithmMeta, idsToLabels } from "@/lib/routeEngine";
import type { ComparisonRowId } from "@/lib/routeEngine";
import type { ComparisonDisplayRow } from "@/components/ComparisonSection";
import { fetchLiveDrivingRoute } from "@/lib/osrmRouting";
import { fetchRouteInsight, isGeminiConfigured } from "@/lib/geminiInsight";
import {
  dedupeConsecutiveHubs,
  hubIdsToRouteConfig,
  snapLatLngsToHubIds,
} from "@/lib/routeGraph";
import { tryComputeRouteViaGeocodeSnap } from "@/lib/hubSnap";

/** Bar colours — three SP variants + TSP (same km shows as equal bar length for BF/FW/Dijkstra) */
const COMPARISON_BAR: Record<ComparisonRowId, string> = {
  "bellman-ford": "linear-gradient(90deg, hsl(285 72% 58%), hsl(265 90% 62%))",
  "floyd-warshall": "linear-gradient(90deg, hsl(225 88% 56%), hsl(205 92% 54%))",
  dijkstra: "linear-gradient(90deg, hsl(175 96% 48%), hsl(195 95% 52%))",
  "tsp-tour": "linear-gradient(90deg, hsl(35 95% 55%), hsl(25 85% 48%))",
};

const Index = () => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RouteResult | null>(null);
  const [routePath, setRoutePath] = useState<string[] | undefined>();
  const [livePolyline, setLivePolyline] = useState<[number, number][] | undefined>();
  const [liveWaypoints, setLiveWaypoints] = useState<{ position: [number, number]; label: string }[] | undefined>();
  const [comparisonResults, setComparisonResults] = useState<ComparisonDisplayRow[]>([]);

  const handleStart = useCallback(() => setShowDashboard(true), []);

  const handleFindRoute = useCallback(async (config: RouteConfig) => {
    setIsLoading(true);
    setResult(null);
    setRoutePath(undefined);
    setLivePolyline(undefined);
    setLiveWaypoints(undefined);
    setComparisonResults([]);

    try {
      try {
        const live = await fetchLiveDrivingRoute(config);
        if (live) {
          setLivePolyline(live.polylineLatLng);
          setLiveWaypoints(
            live.waypointLabels.map((label, i) => ({
              label,
              position: live.waypointLatLng[i]!,
            }))
          );

          let graph = computeRoute(config);
          let snapUsed = false;
          if (!graph.ok && live.waypointLatLng.length >= 2) {
            const snapIds = dedupeConsecutiveHubs(snapLatLngsToHubIds(live.waypointLatLng));
            if (snapIds.length >= 2) {
              const snapConfig = hubIdsToRouteConfig(snapIds, config.algorithm);
              const retry = computeRoute(snapConfig);
              if (retry.ok) {
                graph = retry;
                snapUsed = true;
                toast.info("Stops mapped to nearest teaching hubs for a fair algorithm comparison.");
              }
            }
          }

          const viaOrs = live.provider === "openrouteservice";
          const providerLabel = viaOrs ? "OpenRouteService" : "OSRM (public)";
          const meta = getAlgorithmMeta(config.algorithm);

          const explanationLive = graph.ok
            ? snapUsed
              ? `Real driving distance and path shape from OpenStreetMap (${providerLabel}). The bar chart compares Bellman–Ford, Floyd–Warshall, Dijkstra, and TSP on the teaching hub network — each stop was mapped to the nearest hub so distances stay comparable (teaching model, not a second GPS route).`
              : `Real driving distance and path shape from OpenStreetMap (${providerLabel}). Free-flow time (no live traffic). The bar chart runs your selected ${meta.name} model on the hub network — it is a teaching comparison, not a second GPS route.`
            : `Real roads from OpenStreetMap (${providerLabel}). Times are estimates. Could not run the hub comparison — try cities that connect on the teaching graph, or fewer stops.`;

          setResult({
            distance: live.distanceKm,
            path: live.waypointLabels,
            timeComplexity: "—",
            explanation: explanationLive,
            algorithmName: graph.ok ? `${providerLabel} · ${meta.name}` : providerLabel,
            durationMinutes: live.durationSec / 60,
            dataSource: "osrm",
            aiLoading: isGeminiConfigured(),
            aiInsight: undefined,
            aiError: undefined,
          });

          if (isGeminiConfigured()) {
            void fetchRouteInsight({
              pathLabel: live.waypointLabels.join(" → "),
              distanceKm: live.distanceKm,
              durationMin: live.durationSec / 60,
              mode: "live",
            }).then((res) => {
              setResult((prev) =>
                prev
                  ? {
                      ...prev,
                      aiLoading: false,
                      ...(res.ok
                        ? { aiInsight: res.text, aiError: undefined }
                        : { aiInsight: undefined, aiError: res.error }),
                    }
                  : null
              );
            });
          }

          if (graph.ok) {
            setComparisonResults(
              graph.comparisonRows.map((row) => ({
                ...row,
                color: COMPARISON_BAR[row.id],
              }))
            );
          }
          return;
        }
      } catch (e) {
        console.error(e);
        toast.info("Live routing unavailable — using the built-in network model.");
      }

      let out = computeRoute(config);
      if (!out.ok) {
        out = await tryComputeRouteViaGeocodeSnap(config);
        if (!out.ok) {
          toast.error(out.message);
          return;
        }
        toast.info("Cities mapped to nearest teaching hubs for algorithm comparison.");
      }

      setRoutePath(out.routePathIds);
      setResult({
        distance: out.distance,
        path: idsToLabels(out.routePathIds),
        timeComplexity: out.timeComplexity,
        explanation: out.explanation,
        algorithmName: out.algorithmName,
        dataSource: "graph",
        aiLoading: isGeminiConfigured(),
        aiInsight: undefined,
        aiError: undefined,
      });

      setComparisonResults(
        out.comparisonRows.map((row) => ({
          ...row,
          color: COMPARISON_BAR[row.id],
        }))
      );

      const estMin = (out.distance / 55) * 60;
      if (isGeminiConfigured()) {
        void fetchRouteInsight({
          pathLabel: idsToLabels(out.routePathIds).join(" → "),
          distanceKm: out.distance,
          durationMin: estMin,
          mode: "graph",
        }).then((res) => {
          setResult((prev) =>
            prev
              ? {
                  ...prev,
                  aiLoading: false,
                  ...(res.ok
                    ? { aiInsight: res.text, aiError: undefined }
                    : { aiInsight: undefined, aiError: res.error }),
                }
              : null
          );
        });
      }
    } finally {
      setIsLoading(false);
    }
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
              className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowDashboard(false);
                    setResult(null);
                    setRoutePath(undefined);
                    setLivePolyline(undefined);
                    setLiveWaypoints(undefined);
                    setComparisonResults([]);
                  }}
                  className="glass-panel-hover self-start rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  ← Back
                </button>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/80 mb-1">Dashboard</p>
                  <h1 className="text-2xl sm:text-3xl font-bold font-display glow-text tracking-tight">Route Planner</h1>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xl leading-relaxed">
                    Live OpenStreetMap routes · Classic algorithms on the teaching hub graph
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2.5 rounded-full border border-glass-border/80 bg-secondary/30 px-4 py-2 shadow-inner shrink-0">
                <div className="relative h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-glow-cyan/50" />
                  <span className="relative block h-2 w-2 rounded-full bg-glow-cyan shadow-[0_0_10px_hsl(187_96%_58%/0.7)]" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Ready</span>
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
                <MapVisualization
                  routePath={routePath}
                  isAnimating={isLoading}
                  livePolyline={livePolyline}
                  liveWaypoints={liveWaypoints}
                />
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
              {result?.dataSource === "osrm" && comparisonResults.length > 0 && (
                <p className="text-xs text-muted-foreground -mt-4 mb-2 px-1 max-w-3xl leading-relaxed">
                  Comparison uses the hub network (approximate intercity km). The map above is real OSM routing — distances can differ from the model.
                </p>
              )}
              <ComparisonSection
                results={comparisonResults}
                emptyHint={
                  result?.dataSource === "osrm" && comparisonResults.length === 0
                    ? "Live routing worked, but the teaching graph could not connect your hubs after mapping — try different places or a shorter chain. When it works, you’ll see Bellman–Ford, Floyd–Warshall, Dijkstra, and TSP with bars and explanations."
                    : null
                }
              />
            </motion.div>

            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
