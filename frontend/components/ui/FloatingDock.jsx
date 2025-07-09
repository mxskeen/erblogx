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
        "flex fixed bottom-4 sm:bottom-6 left-1/2 h-12 sm:h-14 md:h-16 w-fit items-end gap-2 sm:gap-3 md:gap-4 rounded-xl sm:rounded-2xl bg-gray-50/70 backdrop-blur-lg px-2 sm:px-3 md:px-4 pb-2 sm:pb-3 shadow-lg dark:bg-neutral-900/80 z-30 transform-gpu",
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

  const widthSync = useTransform(distance, [-150, 0, 150], [40, 60, 40]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  // Mobile responsive sizing
  const mobileWidth = useTransform(distance, [-150, 0, 150], [32, 40, 32]);
  const responsiveWidth = typeof window !== "undefined" && window.innerWidth < 640 ? mobileWidth : width;

  return (
    <motion.div
      ref={ref}
      style={{ width: responsiveWidth }}
      className="aspect-square rounded-lg bg-gray-200 dark:bg-neutral-800 flex items-center justify-center relative"
    >
      <a
        href={href}
        className="w-full h-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        title={title}
      >
        <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6">
          {icon}
        </div>
      </a>
    </motion.div>
  );
} 