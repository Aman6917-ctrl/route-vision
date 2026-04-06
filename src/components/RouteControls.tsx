import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Plus, Trash2, ChevronDown, Loader2, Zap, Search } from "lucide-react";

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

const indianCities = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Patna", "Goa"];

const RouteControls = ({ onFindRoute, isLoading }: Props) => {
  const [source, setSource] = useState("Delhi");
  const [destination, setDestination] = useState("Chennai");
  const [stops, setStops] = useState<string[]>([]);
  const [algorithm, setAlgorithm] = useState(algorithms[0].id);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sourceSuggestions, setSourceSuggestions] = useState(false);
  const [destSuggestions, setDestSuggestions] = useState(false);

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

  const filterCities = (query: string) =>
    indianCities.filter(c => c.toLowerCase().includes(query.toLowerCase()));

  const CitySuggestions = ({ query, onSelect, show }: { query: string; onSelect: (city: string) => void; show: boolean }) => {
    if (!show) return null;
    const filtered = filterCities(query);
    if (filtered.length === 0) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        className="absolute z-50 w-full mt-1 glass-panel p-1 max-h-36 overflow-y-auto"
      >
        {filtered.map(city => (
          <button
            key={city}
            onMouseDown={(e) => { e.preventDefault(); onSelect(city); }}
            className="w-full text-left px-3 py-2 text-sm rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            {city}
          </button>
        ))}
      </motion.div>
    );
  };

  return (
    <div className="glass-panel p-6 space-y-5 h-full">
      <div className="pb-4 border-b border-glass-border">
        <h2 className="text-lg font-semibold text-foreground mb-0.5 tracking-tight">Route Configuration</h2>
        <p className="text-xs text-muted-foreground">Select Indian cities and algorithm</p>
      </div>

      {/* Source */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Source City</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-glow-purple" />
          <input
            className="input-glass w-full pl-10"
            placeholder="e.g. Delhi"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            onFocus={() => setSourceSuggestions(true)}
            onBlur={() => setTimeout(() => setSourceSuggestions(false), 150)}
          />
          <AnimatePresence>
            <CitySuggestions
              query={source}
              show={sourceSuggestions}
              onSelect={(c) => { setSource(c); setSourceSuggestions(false); }}
            />
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
                <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-glow-cyan" />
                <input
                  className="input-glass w-full pl-10"
                  placeholder={`Stop city...`}
                  value={stop}
                  onChange={(e) => updateStop(i, e.target.value)}
                />
              </div>
              <button
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
        onClick={addStop}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-glass-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all duration-200 hover:bg-secondary/20 active:scale-[0.98]"
      >
        <Plus className="w-4 h-4" /> Add Stop
      </button>

      {/* Destination */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Destination City</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-glow-blue" />
          <input
            className="input-glass w-full pl-10"
            placeholder="e.g. Mumbai"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onFocus={() => setDestSuggestions(true)}
            onBlur={() => setTimeout(() => setDestSuggestions(false), 150)}
          />
          <AnimatePresence>
            <CitySuggestions
              query={destination}
              show={destSuggestions}
              onSelect={(c) => { setDestination(c); setDestSuggestions(false); }}
            />
          </AnimatePresence>
        </div>
      </div>

      {/* Algorithm Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Algorithm</label>
        <div className="relative">
          <button
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
                className="absolute z-50 w-full mt-2 glass-panel p-1.5 space-y-0.5"
              >
                {algorithms.map((algo) => (
                  <button
                    key={algo.id}
                    onClick={() => { setAlgorithm(algo.id); setDropdownOpen(false); }}
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
