import { motion } from "framer-motion";
import { ArrowRight, MapPin, Navigation, Route, Sparkles, Cpu, BarChart3, Zap } from "lucide-react";

interface HeroSectionProps {
  onStart: () => void;
}

const floatingCards = [
  { icon: MapPin, label: "Delhi → Mumbai", distance: "1,400 km", delay: 0.6, x: -55, y: 28 },
  { icon: Navigation, label: "BLR → Chennai", distance: "350 km", delay: 0.8, x: 55, y: 22 },
  { icon: Route, label: "Kolkata → HYD", distance: "1,490 km", delay: 1.0, x: -48, y: 72 },
  { icon: Sparkles, label: "Jaipur → AMD", distance: "660 km", delay: 1.2, x: 52, y: 68 },
];

const features = [
  {
    icon: Cpu,
    title: "4 Advanced Algorithms",
    desc: "Bellman-Ford, Floyd-Warshall, Greedy & TSP — compare results side by side",
    gradient: "from-glow-purple/20 to-glow-blue/5",
  },
  {
    icon: Route,
    title: "Live map + graph",
    desc: "OpenStreetMap driving routes for any place in India, plus an animated hub network for teaching",
    gradient: "from-glow-blue/20 to-glow-cyan/5",
  },
  {
    icon: BarChart3,
    title: "Smart Comparison",
    desc: "Animated bar charts comparing distance, complexity & efficiency",
    gradient: "from-glow-cyan/20 to-glow-purple/5",
  },
];

const HeroSection = ({ onStart }: HeroSectionProps) => {
  return (
    <div className="relative">
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6">
        {/* Gradient orbs */}
        <div className="absolute top-[10%] left-[15%] w-[600px] h-[600px] rounded-full opacity-[0.08] blur-[120px]"
          style={{ background: "radial-gradient(circle, hsl(265 90% 65%), transparent)" }} />
        <div className="absolute bottom-[15%] right-[10%] w-[500px] h-[500px] rounded-full opacity-[0.06] blur-[100px]"
          style={{ background: "radial-gradient(circle, hsl(200 95% 55%), transparent)" }} />
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.04] blur-[80px]"
          style={{ background: "radial-gradient(circle, hsl(220 90% 60%), transparent)" }} />

        {/* Orbiting ring decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[700px] sm:h-[700px] rounded-full border border-glass-border/20 opacity-30 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] rounded-full border border-glass-border/10 opacity-20 pointer-events-none" />

        <div className="relative z-10 text-center max-w-5xl mx-auto w-full">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-3 rounded-full border border-glow-purple/25 bg-gradient-to-r from-glow-purple/[0.12] via-secondary/40 to-glow-cyan/[0.08] px-6 py-2.5 shadow-[0_8px_32px_-8px_hsl(267_90%_50%/0.35)] backdrop-blur-md cursor-default">
              <div className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-glow-cyan opacity-40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gradient-to-br from-glow-cyan to-glow-blue shadow-[0_0_12px_hsl(187_96%_58%/0.8)]" />
              </div>
              <span className="text-sm font-semibold tracking-wide text-foreground/90">
                India-wide routing · OSM live map
              </span>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="font-display text-[3.2rem] sm:text-7xl lg:text-[5.8rem] font-extrabold tracking-[-0.045em] leading-[0.88] mb-6 drop-shadow-[0_4px_48px_hsl(267_90%_50%/0.15)]"
            initial={{ opacity: 0, y: 50, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-foreground/95">Smart </span>
            <span className="glow-text">Route</span>
            <br className="sm:hidden" />
            <span className="text-foreground/95"> Planner</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            Search cities and towns across India, get real road distances on a live map, and compare classic shortest-path algorithms side by side.
          </motion.p>

          {/* CTA */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              onClick={onStart}
              className="btn-glow inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-primary-foreground font-semibold text-lg group shadow-2xl"
            >
              <span className="relative z-10 flex items-center gap-3">
                Start Planning
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
              </span>
            </button>
          </motion.div>

          {/* Floating route cards - grid layout for visibility */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55 }}
          >
            {floatingCards.map((card, i) => (
              <motion.div
                key={i}
                className="glass-panel-hover px-3 py-3 flex items-center gap-2.5 rounded-xl ring-1 ring-white/[0.04] shadow-lg shadow-black/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.03 }}
              >
                <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, hsl(265 90% 65% / 0.15), hsl(200 95% 55% / 0.1))" }}>
                  <card.icon className="w-3.5 h-3.5 text-glow-purple" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{card.label}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{card.distance}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            className="flex items-center justify-center gap-8 sm:gap-14"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            {[
              { value: "India-wide", label: "Place search" },
              { value: "4", label: "Algorithms" },
              { value: "OSM", label: "Live routing" },
            ].map((stat) => (
              <div key={stat.label} className="text-center px-2">
                <div className="text-xl sm:text-2xl font-bold font-display text-gradient">{stat.value}</div>
                <div className="text-[10px] sm:text-[11px] text-muted-foreground mt-1 uppercase tracking-[0.15em] font-semibold">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1.5 }}
        >
          <div className="w-5 h-8 rounded-full border border-muted-foreground/30 flex items-start justify-center p-1.5">
            <motion.div
              className="w-1 h-1.5 rounded-full bg-muted-foreground/60"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40"
          style={{ background: "linear-gradient(to top, hsl(230 25% 7%), transparent)" }} />
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-20 -mt-10">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="card-glow p-6 group cursor-default"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${feature.gradient} border border-glass-border mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-5 h-5 text-foreground" />
              </div>
              <h3 className="text-sm font-bold text-foreground mb-1.5 tracking-tight">{feature.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
};

export default HeroSection;
