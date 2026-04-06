import { useEffect, useRef } from "react";

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const nodes: { x: number; y: number; vx: number; vy: number; radius: number; brightness: number }[] = [];
    const nodeCount = 80;

    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.8 + 0.6,
        brightness: Math.random() * 0.5 + 0.3,
      });
    }

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouse);

    let time = 0;

    const draw = () => {
      time += 0.005;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Subtle grid
      ctx.strokeStyle = "rgba(139, 92, 246, 0.015)";
      ctx.lineWidth = 0.5;
      const gridSize = 50;
      for (let x = 0; x < window.innerWidth; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, window.innerHeight);
        ctx.stroke();
      }
      for (let y = 0; y < window.innerHeight; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(window.innerWidth, y);
        ctx.stroke();
      }

      // Nodes
      nodes.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < -20) node.x = window.innerWidth + 20;
        if (node.x > window.innerWidth + 20) node.x = -20;
        if (node.y < -20) node.y = window.innerHeight + 20;
        if (node.y > window.innerHeight + 20) node.y = -20;

        // Mouse repulsion
        const dx = mouseRef.current.x - node.x;
        const dy = mouseRef.current.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          const force = (180 - dist) / 180;
          node.x -= dx * force * 0.008;
          node.y -= dy * force * 0.008;
        }

        // Pulsing brightness
        const pulse = Math.sin(time * 2 + i) * 0.15 + node.brightness;

        // Glow
        const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * 4);
        glow.addColorStop(0, `rgba(139, 92, 246, ${pulse * 0.5})`);
        glow.addColorStop(1, "rgba(139, 92, 246, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `rgba(160, 120, 255, ${pulse})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();

        // Connections
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const d = Math.sqrt((node.x - other.x) ** 2 + (node.y - other.y) ** 2);
          if (d < 130) {
            const alpha = (1 - d / 130) * 0.08;
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }
      });

      // Mouse glow — purple + cyan premium wash
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      if (mx > 0 && my > 0) {
        const mg = ctx.createRadialGradient(mx, my, 0, mx, my, 280);
        mg.addColorStop(0, "rgba(139, 92, 246, 0.055)");
        mg.addColorStop(0.35, "rgba(56, 189, 248, 0.03)");
        mg.addColorStop(0.65, "rgba(59, 130, 246, 0.02)");
        mg.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = mg;
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default AnimatedBackground;
