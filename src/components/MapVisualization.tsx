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
}

const defaultNodes: Node[] = [
  { id: "a", x: 80, y: 120, label: "NYC" },
  { id: "b", x: 220, y: 60, label: "CHI" },
  { id: "c", x: 360, y: 100, label: "DEN" },
  { id: "d", x: 500, y: 50, label: "SEA" },
  { id: "e", x: 180, y: 220, label: "ATL" },
  { id: "f", x: 340, y: 260, label: "DAL" },
  { id: "g", x: 500, y: 200, label: "LA" },
  { id: "h", x: 620, y: 130, label: "SF" },
];

const defaultEdges: Edge[] = [
  { from: "a", to: "b" }, { from: "a", to: "e" }, { from: "b", to: "c" },
  { from: "b", to: "e" }, { from: "c", to: "d" }, { from: "c", to: "f" },
  { from: "c", to: "g" }, { from: "d", to: "h" }, { from: "e", to: "f" },
  { from: "f", to: "g" }, { from: "g", to: "h" },
];

interface Props {
  routePath?: string[];
  isAnimating: boolean;
}

const MapVisualization = ({ routePath, isAnimating }: Props) => {
  const [pathProgress, setPathProgress] = useState(0);

  useEffect(() => {
    if (routePath && routePath.length > 0) {
      setPathProgress(0);
      const interval = setInterval(() => {
        setPathProgress((p) => {
          if (p >= 1) { clearInterval(interval); return 1; }
          return p + 0.02;
        });
      }, 20);
      return () => clearInterval(interval);
    }
  }, [routePath]);

  const getNode = (id: string) => defaultNodes.find((n) => n.id === id)!;

  const routeEdges = routePath
    ? routePath.slice(0, -1).map((id, i) => ({ from: id, to: routePath[i + 1] }))
    : [];

  return (
    <div className="glass-panel p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Route Visualization</h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-glow-purple" />
          <span className="text-xs text-muted-foreground">Graph Network</span>
        </div>
      </div>

      <div className="flex-1 relative rounded-lg overflow-hidden"
        style={{ background: "linear-gradient(135deg, hsl(230 25% 8%), hsl(230 25% 6%))" }}>
        {/* Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(265 90% 65%)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        <svg viewBox="0 0 700 320" className="w-full h-full relative z-10">
          {/* Background edges */}
          {defaultEdges.map((edge, i) => {
            const from = getNode(edge.from);
            const to = getNode(edge.to);
            return (
              <line
                key={i}
                x1={from.x} y1={from.y}
                x2={to.x} y2={to.y}
                stroke="rgba(139, 92, 246, 0.1)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Route path */}
          {routeEdges.map((edge, i) => {
            const from = getNode(edge.from);
            const to = getNode(edge.to);
            const edgeProgress = Math.max(0, Math.min(1, pathProgress * routeEdges.length - i));
            if (edgeProgress <= 0) return null;
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            return (
              <g key={`route-${i}`}>
                <line
                  x1={from.x} y1={from.y}
                  x2={from.x + dx * edgeProgress} y2={from.y + dy * edgeProgress}
                  stroke="url(#routeGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  filter="url(#glow)"
                />
              </g>
            );
          })}

          {/* Glow filter */}
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(265, 90%, 65%)" />
              <stop offset="50%" stopColor="hsl(220, 90%, 60%)" />
              <stop offset="100%" stopColor="hsl(185, 95%, 55%)" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Nodes */}
          {defaultNodes.map((node) => {
            const isOnRoute = routePath?.includes(node.id);
            return (
              <g key={node.id}>
                {isOnRoute && (
                  <circle cx={node.x} cy={node.y} r="16" fill="none" stroke="hsl(265, 90%, 65%)" strokeWidth="1" opacity="0.3">
                    <animate attributeName="r" from="16" to="28" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={node.x} cy={node.y}
                  r={isOnRoute ? 10 : 7}
                  fill={isOnRoute ? "hsl(265, 90%, 65%)" : "hsl(230, 25%, 20%)"}
                  stroke={isOnRoute ? "hsl(265, 90%, 75%)" : "hsl(230, 20%, 30%)"}
                  strokeWidth="2"
                />
                <text
                  x={node.x} y={node.y + 26}
                  textAnchor="middle"
                  fill="hsl(215, 20%, 55%)"
                  fontSize="11"
                  fontWeight="500"
                  fontFamily="Inter, sans-serif"
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
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: "linear-gradient(90deg, transparent, hsl(265 90% 65% / 0.05), transparent)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2s linear infinite",
            }}
          />
        )}
      </div>
    </div>
  );
};

export default MapVisualization;
