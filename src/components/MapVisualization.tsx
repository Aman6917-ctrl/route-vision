import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GRAPH_EDGES } from "@/lib/routeGraph";
import LiveRouteMap from "@/components/LiveRouteMap";

interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
}

interface Edge {
  from: string;
  to: string;
  weight: number;
}

const uniqueEdges: Edge[] = GRAPH_EDGES.map((e) => ({
  from: e.from,
  to: e.to,
  weight: e.weight,
}));

const defaultNodes: Node[] = [
  { id: "del", x: 340, y: 55, label: "Delhi" },
  { id: "jai", x: 240, y: 100, label: "Jaipur" },
  { id: "ahm", x: 170, y: 185, label: "Ahmedabad" },
  { id: "mum", x: 180, y: 270, label: "Mumbai" },
  { id: "goa", x: 230, y: 330, label: "Goa" },
  { id: "blr", x: 320, y: 350, label: "Bangalore" },
  { id: "chn", x: 420, y: 340, label: "Chennai" },
  { id: "hyd", x: 370, y: 265, label: "Hyderabad" },
  { id: "kol", x: 530, y: 140, label: "Kolkata" },
  { id: "lko", x: 420, y: 85, label: "Lucknow" },
  { id: "pat", x: 490, y: 90, label: "Patna" },
  { id: "pun", x: 230, y: 230, label: "Pune" },
  { id: "nag", x: 350, y: 210, label: "Nagpur" },
];

interface Props {
  routePath?: string[];
  isAnimating: boolean;
  /** Real OSRM route — when set, shows Leaflet map */
  livePolyline?: [number, number][];
  liveWaypoints?: { position: [number, number]; label: string }[];
}

const MapVisualization = ({ routePath, isAnimating, livePolyline, liveWaypoints }: Props) => {
  const [pathProgress, setPathProgress] = useState(0);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    if (routePath && routePath.length > 0) {
      setPathProgress(0);
      const interval = setInterval(() => {
        setPathProgress((p) => {
          if (p >= 1) { clearInterval(interval); return 1; }
          return p + 0.015;
        });
      }, 20);
      return () => clearInterval(interval);
    } else {
      setPathProgress(0);
    }
  }, [routePath]);

  const getNode = (id: string) => defaultNodes.find((n) => n.id === id);

  const routeEdges = routePath
    ? routePath.slice(0, -1).map((id, i) => ({ from: id, to: routePath[i + 1] }))
    : [];

  return (
    <div className="glass-panel flex h-full flex-col rounded-2xl p-6 sm:p-7 ring-1 ring-white/[0.06]">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/75 mb-1">Map</p>
          <h2 className="text-xl font-bold font-display tracking-tight text-foreground">
            {livePolyline && livePolyline.length > 0 ? "Live route" : "Hub network"}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {livePolyline && livePolyline.length > 0
              ? "Real driving geometry (OSRM) · Tiles © OpenStreetMap contributors"
              : "Teaching graph — major Indian city hubs & highway-style edges"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-4 sm:pt-1">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5 rounded-full bg-glow-purple opacity-40" style={{ borderTop: "1.5px dashed hsl(265 90% 65%)" }} />
            <span className="text-xs text-muted-foreground">Connections</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5 rounded-full" style={{ background: "linear-gradient(90deg, hsl(265 90% 65%), hsl(185 95% 55%))" }} />
            <span className="text-xs text-muted-foreground">Route</span>
          </div>
        </div>
      </div>

      <div
        className="relative min-h-[360px] flex-1 overflow-hidden rounded-xl border border-glass-border/90 shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.05)]"
        style={{ background: "linear-gradient(155deg, hsl(232 28% 8%), hsl(230 30% 5%))" }}
      >
        {livePolyline && livePolyline.length > 0 ? (
          <div className="absolute inset-0 z-[5]">
            <LiveRouteMap polyline={livePolyline} waypoints={liveWaypoints} />
          </div>
        ) : null}

        {!livePolyline?.length && !routePath?.length && !isAnimating ? (
          <div className="absolute inset-0 z-[1] flex items-center justify-center pointer-events-none">
            <p className="text-sm text-muted-foreground/70 text-center px-6 max-w-sm leading-relaxed">
              Choose source and destination, then <span className="text-foreground/90 font-medium">Find Optimal Route</span> to see the hub
              graph or a live map when OSM routing is available.
            </p>
          </div>
        ) : null}

        {/* Subtle grid */}
        <svg className={`absolute inset-0 w-full h-full opacity-[0.06] ${livePolyline?.length ? "hidden" : ""}`}>
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="hsl(265 90% 65%)" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        <svg
          viewBox="0 0 700 420"
          className={`w-full h-full relative z-10 ${livePolyline?.length ? "hidden" : ""}`}
          style={{ padding: "10px" }}
        >
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(265, 90%, 65%)" />
              <stop offset="50%" stopColor="hsl(220, 90%, 60%)" />
              <stop offset="100%" stopColor="hsl(185, 95%, 55%)" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background edges */}
          {uniqueEdges.map((edge, i) => {
            const from = getNode(edge.from);
            const to = getNode(edge.to);
            if (!from || !to) return null;
            return (
              <line
                key={i}
                x1={from.x} y1={from.y}
                x2={to.x} y2={to.y}
                stroke="rgba(139, 92, 246, 0.08)"
                strokeWidth="1"
                strokeDasharray="6 4"
              />
            );
          })}

          {/* Route path with glow */}
          {routeEdges.map((edge, i) => {
            const from = getNode(edge.from);
            const to = getNode(edge.to);
            if (!from || !to) return null;
            const edgeProgress = Math.max(0, Math.min(1, pathProgress * routeEdges.length - i));
            if (edgeProgress <= 0) return null;
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            return (
              <g key={`route-${i}`}>
                {/* Glow line */}
                <line
                  x1={from.x} y1={from.y}
                  x2={from.x + dx * edgeProgress} y2={from.y + dy * edgeProgress}
                  stroke="url(#routeGradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  opacity="0.3"
                  filter="url(#softGlow)"
                />
                {/* Main line */}
                <line
                  x1={from.x} y1={from.y}
                  x2={from.x + dx * edgeProgress} y2={from.y + dy * edgeProgress}
                  stroke="url(#routeGradient)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  filter="url(#glow)"
                />
              </g>
            );
          })}

          {/* Nodes */}
          {defaultNodes.map((node) => {
            const isOnRoute = routePath?.includes(node.id);
            const isHovered = hoveredNode === node.id;
            const nodeRadius = isOnRoute ? 9 : isHovered ? 8 : 6;
            return (
              <g
                key={node.id}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer"
              >
                {/* Pulse ring for active nodes */}
                {isOnRoute && (
                  <>
                    <circle cx={node.x} cy={node.y} r="14" fill="none" stroke="hsl(265, 90%, 65%)" strokeWidth="0.8" opacity="0.4">
                      <animate attributeName="r" from="14" to="26" dur="2.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.4" to="0" dur="2.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={node.x} cy={node.y} r="14" fill="hsl(265, 90%, 65%)" opacity="0.08" />
                  </>
                )}

                {/* Node circle */}
                <circle
                  cx={node.x} cy={node.y}
                  r={nodeRadius}
                  fill={isOnRoute ? "hsl(265, 90%, 65%)" : isHovered ? "hsl(230, 25%, 25%)" : "hsl(230, 25%, 16%)"}
                  stroke={isOnRoute ? "hsl(265, 90%, 80%)" : isHovered ? "hsl(265, 90%, 45%)" : "hsl(230, 20%, 28%)"}
                  strokeWidth={isOnRoute ? 2 : 1.5}
                  style={{ transition: "all 0.2s ease" }}
                />

                {/* Inner dot for active */}
                {isOnRoute && (
                  <circle cx={node.x} cy={node.y} r="3" fill="hsl(0, 0%, 100%)" opacity="0.9" />
                )}

                {/* Label */}
                <text
                  x={node.x}
                  y={node.y - (isOnRoute ? 18 : 14)}
                  textAnchor="middle"
                  fill={isOnRoute ? "hsl(265, 90%, 80%)" : isHovered ? "hsl(210, 40%, 85%)" : "hsl(215, 20%, 50%)"}
                  fontSize={isOnRoute ? "11" : "10"}
                  fontWeight={isOnRoute ? "600" : "500"}
                  fontFamily="Inter, sans-serif"
                  style={{ transition: "all 0.2s ease" }}
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Shimmer overlay when loading */}
        {isAnimating && (
          <motion.div
            className="absolute inset-0 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0"
              style={{
                background: "linear-gradient(90deg, transparent 0%, hsl(265 90% 65% / 0.04) 50%, transparent 100%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s linear infinite",
              }}
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-panel px-4 py-2 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-glow-purple animate-pulse" />
              <span className="text-xs text-muted-foreground font-medium">Computing optimal path...</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MapVisualization;
