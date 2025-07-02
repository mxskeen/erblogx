"use client";
import React, { useRef } from "react";
import { motion, useAnimationFrame, useMotionTemplate, useMotionValue, useTransform } from "framer-motion";
import { cn } from "../../lib/utils";

export default function MovingBorderContainer({ children, className, borderRadius = "1.5rem", duration = 4000 }) {
  const pathRef = useRef(null);
  const progress = useMotionValue(0);

  useAnimationFrame((t) => {
    const length = pathRef.current?.getTotalLength();
    if (length) {
      const pxPerMs = length / duration;
      progress.set((t * pxPerMs) % length);
    }
  });

  const x = useTransform(progress, (v) => pathRef.current?.getPointAtLength(v).x);
  const y = useTransform(progress, (v) => pathRef.current?.getPointAtLength(v).y);

  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`;

  return (
    <div className={cn("relative overflow-hidden p-[2px]", className)} style={{ borderRadius }}>
      {/* Moving border */}
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <rect ref={pathRef} fill="none" width="100%" height="100%" rx={borderRadius} ry={borderRadius} />
      </svg>
      <motion.div style={{ transform }} className="pointer-events-none absolute top-0 left-0 h-20 w-20 bg-[radial-gradient(theme(colors.purple.500)_40%,transparent_60%)] opacity-75" />

      {/* content */}
      <div className="relative rounded-[inherit] bg-white">
        {children}
      </div>
    </div>
  );
} 