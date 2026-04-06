import { motion } from "framer-motion";
import { ArrowRight, MapPin, Navigation, Route } from "lucide-react";

interface HeroSectionProps {
  onStart: () => void;
}

const floatingCards = [
  { icon: MapPin, label: "NYC → LA", distance: "2,790 mi", delay: 0.8, x: -320, y: -60 },
  { icon: Navigation, label: "London → Paris", distance: "285 mi", delay: 1.0, x: 280, y: -100 },
  { icon: Route, label: "Tokyo → Osaka", distance: "315 mi", delay: 1.2, x: -280, y: 120 },
];

const HeroSection = ({ onStart }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(265 90% 65%), transparent)" }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(200 95% 55%), transparent)" }} />

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-2 glass-panel px-4 py-2 mb-8">
            <div className="w-2 h-2 rounded-full bg-glow-cyan animate-pulse" />
            <span className="text-sm font-medium text-muted-foreground">Powered by Advanced Algorithms</span>
          </div>
        </motion.div>

        <motion.h1
          className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="text-foreground">Smart</span>{" "}
          <span className="glow-text">Route</span>
          <br />
          <span className="text-foreground">Planner</span>
        </motion.h1>

        <motion.p
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          Find optimal routes using advanced algorithms. Visualize, compare,
          and understand pathfinding like never before.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            onClick={onStart}
            className="btn-glow inline-flex items-center gap-3 px-8 py-4 rounded-xl text-primary-foreground font-semibold text-lg group"
          >
            Start Planning
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </motion.div>

        {/* Floating glass cards */}
        {floatingCards.map((card, i) => (
          <motion.div
            key={i}
            className="hidden lg:flex absolute glass-panel px-4 py-3 items-center gap-3 animate-float"
            style={{
              left: `calc(50% + ${card.x}px)`,
              top: `calc(50% + ${card.y}px)`,
              animationDelay: `${i * 0.8}s`,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: card.delay, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, hsl(265 90% 65% / 0.2), hsl(200 95% 55% / 0.2))" }}>
              <card.icon className="w-4 h-4 text-glow-purple" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{card.label}</p>
              <p className="text-xs text-muted-foreground">{card.distance}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
