import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Plus, Trash2, ChevronDown, Loader2, Zap } from "lucide-react";

export interface RouteConfig {
  source: string;
  destination: string;
  stops: string[];
  algorithm: string;
}

interface Props {
  onFindRoute: (config: RouteConfig) => void;
  isLoading: boolean;
}

const algorithms = [
  { id: "bellman-ford", name: "Bellman-Ford", tag: "Dynamic Programming", color: "text-glow-purple" },
  { id: "all-pairs", name: "All-Pairs Shortest Path", tag: "Floyd-Warshall", color: "text-glow-blue" },
  { id: "greedy", name: "Activity Selection", tag: "Greedy", color: "text-glow-cyan" },
  { id: "tsp", name: "Traveling Salesman", tag: "NP Approximation", color: "text-destructive" },
];

const RouteControls = ({ onFindRoute, isLoading }: Props) => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [stops, setStops] = useState<string[]>([]);
  const [algorithm, setAlgorithm] = useState(algorithms[0].id);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedAlgo = algorithms.find((a) => a.id === algorithm)!;

  const addStop = () => setStops([...stops, ""]);
  const removeStop = (i: number) => setStops(stops.filter((_, idx) => idx !== i));
  const updateStop = (i: number, val: string) => {
    const next = [...stops];
    next[i] = val;
    setStops(next);
  };

  const handleSubmit = () => {
    onFindRoute({ source, destination, stops, algorithm });
  };

  return (
    <div className="glass-panel p-6 space-y-6 h-full">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Route Configuration</h2>
        <p className="text-sm text-muted-foreground">Set your route parameters below</p>
      </div>

      {/* Source */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Source</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-glow-purple" />
          <input
            className="input-glass w-full pl-10"
            placeholder="Enter source city..."
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
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
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            <label className="text-sm font-medium text-muted-foreground">Stop {i + 1}</label>
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-glow-cyan" />
                <input
                  className="input-glass w-full pl-10"
                  placeholder={`Stop ${i + 1}...`}
                  value={stop}
                  onChange={(e) => updateStop(i, e.target.value)}
                />
              </div>
              <button
                onClick={() => removeStop(i)}
                className="p-3 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <button
        onClick={addStop}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-glass-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-200"
      >
        <Plus className="w-4 h-4" /> Add Stop
      </button>

      {/* Destination */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Destination</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-glow-blue" />
          <input
            className="input-glass w-full pl-10"
            placeholder="Enter destination city..."
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>
      </div>

      {/* Algorithm Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Algorithm</label>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="input-glass w-full flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Zap className={`w-4 h-4 ${selectedAlgo.color}`} />
              <span className="text-foreground">{selectedAlgo.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                {selectedAlgo.tag}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute z-50 w-full mt-2 glass-panel p-1 space-y-0.5"
              >
                {algorithms.map((algo) => (
                  <button
                    key={algo.id}
                    onClick={() => { setAlgorithm(algo.id); setDropdownOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      algorithm === algo.id ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <Zap className={`w-4 h-4 ${algo.color}`} />
                    <div className="text-left">
                      <p className="text-sm font-medium">{algo.name}</p>
                      <p className="text-xs text-muted-foreground">{algo.tag}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isLoading || !source || !destination}
        className="btn-glow w-full py-3.5 rounded-xl text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" /> Computing...
          </>
        ) : (
          "Find Route"
        )}
      </button>
    </div>
  );
};

export default RouteControls;
