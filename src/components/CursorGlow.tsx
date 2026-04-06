import { useEffect, useState, useRef } from "react";

const CursorGlow = () => {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const rafRef = useRef<number>(0);
  const targetRef = useRef({ x: -200, y: -200 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handler);

    const animate = () => {
      setPos(prev => ({
        x: prev.x + (targetRef.current.x - prev.x) * 0.15,
        y: prev.y + (targetRef.current.y - prev.y) * 0.15,
      }));
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handler);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      className="fixed pointer-events-none z-30 w-[500px] h-[500px] rounded-full opacity-[0.05]"
      style={{
        left: pos.x - 250,
        top: pos.y - 250,
        background: "radial-gradient(circle, hsl(265 90% 65%), hsl(220 90% 60%) 40%, transparent 70%)",
        filter: "blur(40px)",
        willChange: "transform",
      }}
    />
  );
};

export default CursorGlow;
