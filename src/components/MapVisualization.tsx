import { useEffect, useState } from "react";
import { motion } from "framer-motion";

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
];

const defaultEdges: Edge[] = [
  { from: "del", to: "jai", weight: 280 },
  { from: "del", to: "lko", weight: 555 },
  { from: "jai", to: "ahm", weight: 660 },
  { from: "ahm", to: "mum", weight: 530 },
  { from: "mum", to: "pun", weight: 150 },
  { from: "mum", to: "goa", weight: 590 },
  { from: "pun", to: "hyd", weight: 560 },
  { from: "goa", to: "blr", weight: 560 },
  { from: "blr", to: "chn", weight: 350 },
  { from: "hyd", to: "blr", weight: 570 },
  { from: "hyd", to: "chn", weight: 630 },
  { from: "lko", to: "pat", weight: 535 },
  { from: "pat", to: "kol", weight: 590 },
  { from: "del", to: "lko", weight: 555 },
  { from: "lko", to: "kol", weight: 985 },
  { from: "hyd", to: "kol", weight: 1490 },
  { from: "del", to: "mum", weight: 1400 },
  { from: "jai", to: "del", weight: 280 },
  { from: "pun", to: "blr", weight: 840 },
];

// Remove duplicate edges
const uniqueEdges = defaultEdges.filter((edge, i, arr) =>
  arr.findIndex(e =>
    (e.from === edge.from && e.to === edge.to) ||
    (e.from === edge.to && e.to === edge.from)
  ) === i
);

interface Props {
  routePath?: string[];
  isAnimating: boolean;
}

const MapVisualization = ({ routePath, isAnimating }: Props) => {
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
    <div className="glass-panel p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">India Route Network</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Interactive graph visualization</p>
        </div>
        <div className="flex items-center gap-4">
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

      <div className="flex-1 relative rounded-xl overflow-hidden border border-glass-border"
        style={{ background: "linear-gradient(145deg, hsl(230 25% 7%), hsl(230 30% 5%))" }}>
        {/* Subtle grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]">
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="hsl(265 90% 65%)" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        <svg viewBox="0 0 700 420" className="w-full h-full relative z-10" style={{ padding: "10px" }}>
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
