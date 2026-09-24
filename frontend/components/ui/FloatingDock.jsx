"use client";

import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { useRef, useState } from "react";
import { useSidebar } from "./sidebar";

export default function FloatingDock({ items = [], className = "" }) {
  // Desktop dock with hover enlarge effect
  const mouseX = useMotionValue(Infinity);

  // Adjust position based on sidebar state (desktop)
  const { state, isMobile } = useSidebar();

  const translate = !isMobile && state === "expanded"
    ? "calc(-50% + var(--sidebar-width)/2)"
    : "-50%";

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "flex fixed bottom-5 sm:bottom-6 left-1/2 h-13 sm:h-14 md:h-16 w-fit items-end gap-2 sm:gap-3 md:gap-4 rounded-2xl bg-white/85 backdrop-blur-xl border border-stone-200/80 px-2.5 sm:px-3 md:px-4 pb-2.5 sm:pb-3 shadow-xl dark:bg-stone-900/90 dark:border-stone-800 z-30 transform-gpu",
        className
      )}
      style={{ transform: `translateX(${translate})` }}
    >
      {items.map((item) => (
        <IconContainer key={item.title} mouseX={mouseX} {...item} />
      ))}
    </motion.div>
  );
}

function IconContainer({ mouseX, title, icon, href }) {
  const ref = useRef(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-150, 0, 150], [40, 58, 40]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  // Mobile responsive sizing
  const mobileWidth = useTransform(distance, [-150, 0, 150], [32, 40, 32]);
  const responsiveWidth = typeof window !== "undefined" && window.innerWidth < 640 ? mobileWidth : width;

  return (
    <motion.div
      ref={ref}
      style={{ width: responsiveWidth }}
      className="aspect-square rounded-xl bg-stone-100 hover:bg-stone-200/80 border border-stone-200/60 dark:bg-stone-800 flex items-center justify-center relative transition-colors"
    >
      <a
        href={href}
        className="w-full h-full flex items-center justify-center text-stone-700 hover:text-stone-950 dark:text-stone-300 dark:hover:text-stone-50 transition-colors"
        title={title}
      >
        <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6">
          {icon}
        </div>
      </a>
    </motion.div>
  );
} 