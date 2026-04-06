import { motion } from "framer-motion";
import { Heart } from "lucide-react";

const Footer = () => (
  <footer className="relative mt-20 border-t border-glass-border/40">
    <div
      className="absolute top-0 left-1/2 h-px w-3/4 max-w-2xl -translate-x-1/2 premium-divider"
      aria-hidden
    />

    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-base font-bold glow-text tracking-tight">Smart Route Planner</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            India-wide search • OpenStreetMap routing • Hub-network algorithm lab
          </p>
        </motion.div>

        <motion.div
          className="flex items-center gap-2 flex-wrap justify-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          {["React", "TypeScript", "Vite", "Leaflet", "Tailwind"].map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-glass-border/80 bg-secondary/40 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground shadow-inner"
            >
              {tech}
            </span>
          ))}
        </motion.div>
      </div>

      <div className="mt-8 pt-6 border-t border-glass-border/30 flex items-center justify-center gap-1.5 text-xs text-muted-foreground/40">
        <span>Made with</span>
        <Heart className="w-3 h-3 text-destructive/50" fill="currentColor" />
        <span>in India</span>
      </div>
    </div>
  </footer>
);

export default Footer;
