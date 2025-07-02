"use client";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

export default function CardSpotlight({ children, className = "", ...props }) {
  const ref = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const x = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const y = useSpring(mouseY, { stiffness: 300, damping: 30 });

  const background = useTransform(
    [x, y],
    ([latestX, latestY]) =>
      `radial-gradient(600px circle at ${latestX}px ${latestY}px, rgba(180, 180, 255, 0.15), transparent 80%)`
  );

  return (
    <motion.div
      ref={ref}
      className={`relative rounded-xl border bg-white/80 shadow-lg transition-shadow overflow-hidden ${className}`}
      style={{ background }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
} 