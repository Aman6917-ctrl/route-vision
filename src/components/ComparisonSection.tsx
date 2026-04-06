import { motion } from "framer-motion";
import { Cpu, Info, Orbit, Route, Sparkles, Zap } from "lucide-react";
import type { ComparisonRow } from "@/lib/routeEngine";

export type ComparisonDisplayRow = ComparisonRow & { color: string };

interface Props {
  results: ComparisonDisplayRow[];
  emptyHint?: string | null;
}

const iconFor = (id: ComparisonRow["id"]) => {
  switch (id) {
    case "bellman-ford":
      return Cpu;
    case "floyd-warshall":
      return Sparkles;
    case "dijkstra":
      return Zap;
    case "tsp-tour":
      return Orbit;
    default:
      return Route;
  }
};

const ComparisonSection = ({ results, emptyHint }: Props) => {
  if (results.length === 0) {
    if (!emptyHint) return null;
    return (
      <motion.div
        className="glass-panel rounded-2xl p-6 sm:p-8 ring-1 ring-white/[0.05]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="font-display text-lg font-bold tracking-tight text-foreground">Algorithm comparison</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{emptyHint}</p>
        <p className="mt-4 rounded-xl border border-glass-border bg-secondary/30 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          <strong className="text-foreground/90">When it works:</strong> you’ll see all four — Bellman–Ford, Floyd–Warshall,
          Dijkstra, and TSP — with the same shortest-path km for the first three (they must tie) and a separate tour km for
          TSP, plus which is best for speed vs which problem each solves.
        </p>
      </motion.div>
    );
  }

  const maxDist = Math.max(1, ...results.map((r) => r.distanceKm));
  const spSample = results.find((r) => r.family === "shortest-path");
  const tspRow = results.find((r) => r.id === "tsp-tour");
  const dijkstraRow = results.find((r) => r.id === "dijkstra");

  return (
    <motion.div
      className="glass-panel rounded-2xl p-6 sm:p-8 ring-1 ring-white/[0.05]"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">All 4 algorithms</p>
          <h2 className="font-display text-lg font-bold tracking-tight text-foreground">Algorithm comparison</h2>
          <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground/90">Distance:</strong> Bellman–Ford, Floyd–Warshall, and Dijkstra{" "}
            <strong className="text-emerald-400/90">must show the same km</strong> here — that is the true shortest path on
            the hub graph; none of the three is “more wrong” or “more right”.{" "}
            <strong className="text-cyan-400/90">Usually Dijkstra wins on runtime</strong> for a single route (O(E log V) on
            sparse roads). <strong className="text-amber-400/90">TSP</strong> is a different problem (round trip through all
            cities), so its km is not “worst” vs the others.
          </p>
        </div>
        <div className="flex max-w-md items-start gap-2 rounded-xl border border-glass-border bg-secondary/25 px-3 py-2.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-glow-cyan" />
          <p className="text-[11px] leading-snug text-muted-foreground">
            Bars use hub-network km. Your live map may differ; this section teaches how the four algorithms compare on the
            same graph.
          </p>
        </div>
      </div>

      {/* At-a-glance verdict */}
      {spSample && tspRow ? (
        <div className="mb-8 grid gap-3 lg:grid-cols-3">
          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.07] px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/95">Same best distance (3-way tie)</p>
            <p className="mt-1.5 text-sm font-mono font-bold text-foreground">{spSample.distanceKm.toLocaleString()} km</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              BF · FW · Dijkstra — identical total. Pick by <strong className="text-foreground/85">speed / use-case</strong>, not
              by km.
            </p>
          </div>
          <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/[0.06] px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400/95">Fastest in practice (usually)</p>
            <p className="mt-1.5 text-sm font-semibold text-foreground">Dijkstra</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              {dijkstraRow?.complexity ?? "O(E log V)"} — best trade-off for{" "}
              <strong className="text-foreground/85">one shortest path</strong> on a sparse network.
            </p>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400/95">Different problem</p>
            <p className="mt-1.5 text-sm font-mono font-bold text-foreground">{tspRow.distanceKm.toLocaleString()} km</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              TSP tour — visits all stops and returns. Longer bar is <strong className="text-foreground/85">normal</strong>, not
              “worst algorithm”.
            </p>
          </div>
        </div>
      ) : null}

      <div className="space-y-7">
        {results.map((r, i) => {
          const Icon = iconFor(r.id);
          const isSp = r.family === "shortest-path";
          const badge =
            r.id === "dijkstra"
              ? { label: "Often fastest to compute", style: "hsl(185 80% 45% / 0.2)", color: "hsl(175, 85%, 55%)" }
              : isSp
                ? { label: "Optimal km (tie)", style: "hsl(150 55% 40% / 0.22)", color: "hsl(150, 70%, 52%)" }
                : { label: "Tour metric", style: "hsl(265 90% 65% / 0.15)", color: "hsl(265, 90%, 72%)" };

          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.08 + i * 0.06 }}
            >
              <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-2.5">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-glass-border"
                    style={{ background: "hsl(230 25% 12%)" }}
                  >
                    <Icon className="h-4 w-4 text-glow-purple" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{r.title}</span>
                      <span className="rounded-md border border-glass-border bg-secondary/40 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                        {r.complexity}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                        style={{ background: badge.style, color: badge.color }}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{r.subtitle}</p>
                    <p className="mt-2 rounded-lg border border-glow-cyan/15 bg-gradient-to-r from-glow-cyan/[0.06] to-transparent px-3 py-2 text-[11px] font-medium leading-relaxed text-foreground/95">
                      <span className="text-glow-cyan">Why / best for: </span>
                      {r.bestForLine}
                    </p>
                    <p className="mt-2 rounded-lg border border-glass-border/80 bg-secondary/30 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
                      {r.outcomeCaption}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right sm:pl-4">
                  <span className="font-mono text-xl font-bold tabular-nums text-foreground">{r.distanceKm.toLocaleString()}</span>
                  <span className="ml-1 text-xs text-muted-foreground">km</span>
                </div>
              </div>
              <div className="ml-0 h-2.5 overflow-hidden rounded-full sm:ml-12" style={{ background: "hsl(230 25% 10%)" }}>
                <motion.div
                  className="relative h-full overflow-hidden rounded-full"
                  style={{ background: r.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(r.distanceKm / maxDist) * 100}%` }}
                  transition={{ duration: 1.1, delay: 0.28 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ComparisonSection;
