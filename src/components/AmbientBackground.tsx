import { motion } from "framer-motion";
import { useMemo } from "react";

// Generates floating bars that drift around in the background
export default function AmbientBackground() {
  const bars = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      width: Math.random() * 2 + 0.5,
      height: Math.random() * 8 + 3,
      duration: Math.random() * 12 + 10,
      delay: Math.random() * -20,
      opacity: Math.random() * 0.06 + 0.02,
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {bars.map((bar) => (
        <motion.div
          key={bar.id}
          className="absolute rounded-full bg-primary"
          style={{
            left: `${bar.x}%`,
            top: `${bar.y}%`,
            width: `${bar.width}rem`,
            height: `${bar.height}rem`,
            opacity: bar.opacity,
          }}
          animate={{
            y: [0, -40, 20, -10, 0],
            x: [0, 15, -10, 5, 0],
            scaleY: [1, 1.3, 0.8, 1.1, 1],
            opacity: [bar.opacity, bar.opacity * 1.8, bar.opacity * 0.5, bar.opacity * 1.4, bar.opacity],
          }}
          transition={{
            duration: bar.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: bar.delay,
          }}
        />
      ))}
      {/* Subtle radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(271 91% 65% / 0.04) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
