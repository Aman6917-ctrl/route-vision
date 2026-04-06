import { motion } from "framer-motion";
import { Heart } from "lucide-react";

const Footer = () => (
  <footer className="relative mt-16 border-t border-glass-border/50">
    {/* Top gradient line */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px"
      style={{ background: "linear-gradient(90deg, transparent, hsl(265 90% 65% / 0.4), hsl(200 95% 55% / 0.4), transparent)" }} />

    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-base font-bold glow-text tracking-tight">Smart Route Planner</h3>
          <p className="text-xs text-muted-foreground mt-1">🇮🇳 Built for Indian cities • Advanced pathfinding</p>
        </motion.div>

        <motion.div
          className="flex items-center gap-2 flex-wrap justify-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          {["React", "TypeScript", "Tailwind CSS", "Framer Motion"].map((tech) => (
            <span key={tech} className="px-3 py-1.5 text-[10px] font-semibold rounded-full bg-secondary/50 text-muted-foreground border border-glass-border uppercase tracking-wider">
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
