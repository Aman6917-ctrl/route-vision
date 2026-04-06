import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { MapPin, Navigation, Plus, Trash2, ChevronDown, Loader2, Zap, Search } from "lucide-react";

import type { RouteConfig } from "@/lib/routeTypes";
import { INDIA_QUICK_PICKS } from "@/lib/indiaPlaceSearch";
import { useIndiaPlaceSearch } from "@/hooks/useIndiaPlaceSearch";

export type { RouteConfig };

interface Props {
  onFindRoute: (config: RouteConfig) => void;
  isLoading: boolean;
}

const algorithms = [
  { id: "bellman-ford", name: "Bellman-Ford", tag: "Edge relaxation", color: "text-glow-purple" },
  { id: "all-pairs", name: "All-Pairs Shortest Path", tag: "Floyd-Warshall", color: "text-glow-blue" },
  { id: "greedy", name: "Greedy shortest path", tag: "Dijkstra", color: "text-glow-cyan" },
  { id: "tsp", name: "Traveling Salesman", tag: "Nearest neighbor", color: "text-destructive" },
];

type FocusField =
  | { kind: "source" }
  | { kind: "dest" }
  | { kind: "stop"; index: number }
  | null;

const RouteControls = ({ onFindRoute, isLoading }: Props) => {
  const [source, setSource] = useState("Delhi");
  const [destination, setDestination] = useState("Chennai");
  const [stops, setStops] = useState<string[]>([]);
  const [algorithm, setAlgorithm] = useState(algorithms[0].id);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [focusField, setFocusField] = useState<FocusField>(null);

  const selectedAlgo = algorithms.find((a) => a.id === algorithm)!;

  const activeQuery =
    focusField?.kind === "source"
      ? source
      : focusField?.kind === "dest"
        ? destination
        : focusField?.kind === "stop"
          ? stops[focusField.index] ?? ""
          : "";

  const searchEnabled = focusField !== null;
  const { results: searchResults, loading: searchLoading } = useIndiaPlaceSearch(activeQuery, searchEnabled);

  const addStop = () => setStops([...stops, ""]);
  const removeStop = (i: number) => setStops(stops.filter((_, idx) => idx !== i));
  const updateStop = (i: number, val: string) => {
    const next = [...stops];
    next[i] = val;
    setStops(next);
  };

  const handleSubmit = () => {
    const src = source.trim();
    const dst = destination.trim();
    const cleanStops = stops.map((s) => s.trim()).filter(Boolean);
    if (!src || !dst) {
      toast.error("Please enter source and destination.");
      return;
    }
    if (src.toLowerCase() === dst.toLowerCase() && cleanStops.length === 0) {
      toast.error("Source and destination must be different.");
      return;
    }
    onFindRoute({ source: src, destination: dst, stops: cleanStops, algorithm });
  };

  const blurClose = () => {
    setTimeout(() => setFocusField(null), 180);
  };

  const filterQuickPicks = (q: string) => {
    const s = q.trim().toLowerCase();
    if (!s) return [...INDIA_QUICK_PICKS];
    return INDIA_QUICK_PICKS.filter((p) => p.toLowerCase().includes(s));
  };

  function matchesSuggestionTarget(
    kind: "source" | "dest" | "stop",
    stopIndex?: number
  ): boolean {
    if (!focusField) return false;
    if (focusField.kind !== kind) return false;
    if (kind === "stop") {
      return focusField.kind === "stop" && focusField.index === stopIndex;
    }
    return true;
  }

  function PlaceSuggestions({
    kind,
    stopIndex,
    value,
    onSelect,
  }: {
    kind: "source" | "dest" | "stop";
    stopIndex?: number;
    value: string;
    onSelect: (label: string) => void;
  }) {
    if (!matchesSuggestionTarget(kind, stopIndex)) return null;

    const q = value.trim();
    const useApi = q.length >= 2;

    return (
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        className="absolute z-[100] w-full mt-1 glass-panel max-h-64 overflow-y-auto shadow-lg border border-glass-border"
      >
        {!useApi ? (
          <>
            <p className="text-[10px] text-muted-foreground px-3 pt-2 pb-1 border-b border-glass-border/60">
              Popular places — type 2+ letters to search any city, town, or state in India
            </p>
            {filterQuickPicks(q).map((label) => (
              <button
                key={label}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(label);
                  setFocusField(null);
                }}
                className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                {label}
              </button>
            ))}
          </>
        ) : searchLoading ? (
          <div className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            Searching OpenStreetMap…
          </div>
        ) : searchResults.length === 0 ? (
          <p className="px-3 py-3 text-sm text-muted-foreground">No places found. Try another spelling or district name.</p>
        ) : (
          searchResults.map((p) => (
            <button
              key={`${p.label}-${p.lon}-${p.lat}`}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(p.label);
                setFocusField(null);
              }}
              className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              {p.label}
            </button>
          ))
        )}
      </motion.div>
    );
  }

  return (
    <div className="glass-panel h-full space-y-5 rounded-2xl p-6 sm:p-7 ring-1 ring-white/[0.06]">
      <div className="pb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/75 mb-2">Configure</p>
        <h2 className="text-xl font-bold font-display text-foreground tracking-tight">Route</h2>
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
          Search any place in India (OpenStreetMap). Pick a suggestion or keep typing — then choose your algorithm.
        </p>
        <div className="premium-divider mt-5" />
      </div>

      {/* Source */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Source</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-glow-purple pointer-events-none" />
          <input
            className="input-glass w-full pl-10"
            placeholder="e.g. Delhi or Kochi, Kerala"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            onFocus={() => setFocusField({ kind: "source" })}
            onBlur={blurClose}
            autoComplete="off"
          />
          <AnimatePresence>
            <PlaceSuggestions kind="source" value={source} onSelect={setSource} />
          </AnimatePresence>
        </div>
      </div>

      {/* Stops */}
      <AnimatePresence>
        {stops.map((stop, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-1.5"
          >
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stop {i + 1}</label>
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-glow-cyan pointer-events-none" />
                <input
                  className="input-glass w-full pl-10"
                  placeholder="Search a city in India…"
                  value={stop}
                  onChange={(e) => updateStop(i, e.target.value)}
                  onFocus={() => setFocusField({ kind: "stop", index: i })}
                  onBlur={blurClose}
                  autoComplete="off"
                />
                <AnimatePresence>
                  <PlaceSuggestions kind="stop" stopIndex={i} value={stop} onSelect={(label) => updateStop(i, label)} />
                </AnimatePresence>
              </div>
              <button
                type="button"
                onClick={() => removeStop(i)}
                className="p-3 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <button
        type="button"
        onClick={addStop}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-glass-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all duration-200 hover:bg-secondary/20 active:scale-[0.98]"
      >
        <Plus className="w-4 h-4" /> Add Stop
      </button>

      {/* Destination */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Destination</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-glow-blue pointer-events-none" />
          <input
            className="input-glass w-full pl-10"
            placeholder="e.g. Chennai or Shillong, Meghalaya"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onFocus={() => setFocusField({ kind: "dest" })}
            onBlur={blurClose}
            autoComplete="off"
          />
          <AnimatePresence>
            <PlaceSuggestions kind="dest" value={destination} onSelect={setDestination} />
          </AnimatePresence>
        </div>
      </div>

      {/* Algorithm Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Algorithm</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="input-glass w-full flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <Zap className={`w-4 h-4 ${selectedAlgo.color}`} />
              <span className="text-foreground text-sm font-medium">{selectedAlgo.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">
                {selectedAlgo.tag}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute z-[100] w-full mt-2 glass-panel p-1.5 space-y-0.5"
              >
                {algorithms.map((algo) => (
                  <button
                    type="button"
                    key={algo.id}
                    onClick={() => {
                      setAlgorithm(algo.id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-150 ${
                      algorithm === algo.id
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                    }`}
                  >
                    <Zap className={`w-4 h-4 flex-shrink-0 ${algo.color}`} />
                    <div className="text-left">
                      <p className="text-sm font-medium leading-tight">{algo.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{algo.tag}</p>
                    </div>
                    {algorithm === algo.id && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-glow-purple" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || !source || !destination}
          className="btn-glow w-full py-4 rounded-xl text-primary-foreground font-semibold flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed text-[15px] active:scale-[0.98] transition-transform"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Computing Route...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Find Optimal Route</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default RouteControls;
