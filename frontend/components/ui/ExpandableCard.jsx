"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useOutsideClick } from "../../hooks/useOutsideClick";

export default function ExpandableCard({ title, subtitle, image, content, url }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, () => setOpen(false));

  return (
    <motion.div
      ref={ref}
      onClick={() => setOpen(!open)}
      layout
      transition={{ layout: { duration: 0.3, type: "spring" } }}
      className="relative w-64 cursor-pointer overflow-hidden rounded-3xl bg-gradient-to-b from-gray-100 to-gray-200 shadow-lg"
    >
      {image && (
        <Image src={image} alt={title} fill className="object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/60" />

      <div className="relative z-10 p-4 text-white">
        {subtitle && <p className="text-xs opacity-70 mb-1">{subtitle}</p>}
        <h3 className="font-semibold text-lg leading-snug line-clamp-2">
          {title}
        </h3>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="relative z-10 p-4 pt-0 text-sm text-white space-y-2 bg-black/70 backdrop-blur-md"
          >
            <p className="line-clamp-4">{content}</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-200 underline"
            >
              Read full article
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 