import { motion } from "framer-motion";
import { ArrowRight, MapPin, Navigation, Route, Sparkles } from "lucide-react";

interface HeroSectionProps {
  onStart: () => void;
}

const floatingCards = [
  { icon: MapPin, label: "Delhi → Mumbai", distance: "1,400 km", delay: 0.8, x: -340, y: -80 },
  { icon: Navigation, label: "Bangalore → Chennai", distance: "350 km", delay: 1.0, x: 300, y: -110 },
  { icon: Route, label: "Kolkata → Hyderabad", distance: "1,490 km", delay: 1.2, x: -300, y: 110 },
  { icon: Sparkles, label: "Jaipur → Ahmedabad", distance: "660 km", delay: 1.4, x: 320, y: 90 },
];

const stats = [
  { value: "10+", label: "Indian Cities" },
  { value: "4", label: "Algorithms" },
  { value: "Real-time", label: "Visualization" },
];

const HeroSection = ({ onStart }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">
      {/* Multiple gradient orbs for depth */}
      <div className="absolute top-[15%] left-[20%] w-[500px] h-[500px] rounded-full opacity-[0.12] blur-[100px]"
        style={{ background: "radial-gradient(circle, hsl(265 90% 65%), transparent)" }} />
      <div className="absolute bottom-[20%] right-[15%] w-[400px] h-[400px] rounded-full opacity-[0.08] blur-[80px]"
        style={{ background: "radial-gradient(circle, hsl(200 95% 55%), transparent)" }} />
      <div className="absolute top-[60%] left-[50%] w-[300px] h-[300px] rounded-full opacity-[0.06] blur-[60px]"
        style={{ background: "radial-gradient(circle, hsl(185 95% 55%), transparent)" }} />

      <div className="relative z-10 text-center max-w-5xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-2.5 glass-panel px-5 py-2.5 mb-10 group cursor-default">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-glow-cyan" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-glow-cyan animate-ping opacity-75" />
            </div>
            <span className="text-sm font-medium text-muted-foreground tracking-wide">
              🇮🇳 Optimized for Indian Routes
            </span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-5xl sm:text-7xl lg:text-[5.5rem] font-extrabold tracking-[-0.03em] mb-6 leading-[0.95]"
          initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="text-foreground">Smart</span>{" "}
          <span className="glow-text">Route</span>
          <br />
          <span className="text-foreground">Planner</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          Find the fastest paths between Indian cities using Bellman-Ford, Floyd-Warshall, Greedy & TSP algorithms.
        </motion.p>

        {/* CTA + Stats */}
        <motion.div
          className="flex flex-col items-center gap-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            onClick={onStart}
            className="btn-glow inline-flex items-center gap-3 px-10 py-4.5 rounded-2xl text-primary-foreground font-semibold text-lg group relative"
          >
            <span className="relative z-10 flex items-center gap-3">
              Start Planning
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
            </span>
          </button>

          {/* Stats row */}
          <div className="flex items-center gap-8 sm:gap-12">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
              >
                <div className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-0.5">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Floating glass cards */}
        {floatingCards.map((card, i) => (
          <motion.div
            key={i}
            className="hidden xl:flex absolute glass-panel px-5 py-3.5 items-center gap-3.5 animate-float"
            style={{
              left: `calc(50% + ${card.x}px)`,
              top: `calc(50% + ${card.y}px)`,
              animationDelay: `${i * 1.2}s`,
            }}
            initial={{ opacity: 0, scale: 0.8, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.7, delay: card.delay, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, hsl(265 90% 65% / 0.15), hsl(200 95% 55% / 0.15))" }}>
              <card.icon className="w-4 h-4 text-glow-purple" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground tracking-tight">{card.label}</p>
              <p className="text-xs text-muted-foreground font-mono">{card.distance}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32"
        style={{ background: "linear-gradient(to top, hsl(230 25% 7%), transparent)" }} />
    </section>
  );
};

export default HeroSection;
