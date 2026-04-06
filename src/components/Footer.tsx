import { motion } from "framer-motion";

const Footer = () => (
  <footer className="relative mt-20 border-t border-glass-border">
    {/* Gradient line */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px"
      style={{ background: "linear-gradient(90deg, transparent, hsl(265 90% 65% / 0.5), hsl(200 95% 55% / 0.5), transparent)" }} />

    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-lg font-bold glow-text mb-1">Smart Route Planner</h3>
          <p className="text-sm text-muted-foreground">Advanced pathfinding visualization</p>
        </motion.div>

        <motion.div
          className="flex items-center gap-3 flex-wrap justify-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          {["React", "Tailwind CSS", "Framer Motion", "GSAP"].map((tech) => (
            <span key={tech} className="px-3 py-1.5 text-xs font-medium rounded-full bg-secondary text-muted-foreground border border-glass-border">
              {tech}
            </span>
          ))}
        </motion.div>
      </div>

      <div className="mt-8 text-center text-xs text-muted-foreground/50">
        © {new Date().getFullYear()} Smart Route Planner. Built with precision.
      </div>
    </div>
  </footer>
);

export default Footer;
