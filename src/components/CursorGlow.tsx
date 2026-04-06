import { useEffect, useState } from "react";

const CursorGlow = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <div
      className="fixed pointer-events-none z-50 w-80 h-80 rounded-full opacity-[0.07] blur-3xl transition-all duration-300 ease-out"
      style={{
        left: pos.x - 160,
        top: pos.y - 160,
        background: "radial-gradient(circle, hsl(265 90% 65%), hsl(220 90% 60%), transparent)",
      }}
    />
  );
};

export default CursorGlow;
