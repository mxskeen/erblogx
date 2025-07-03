"use client";
import { useState, useRef, useId, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import { BookmarkPlus, BookmarkCheck } from "lucide-react";

export default function ExpandableCardList({ items = [], savedIds = [], onToggleSave }) {
  const [active, setActive] = useState(null);
  const ref = useRef(null);
  const id = useId();

  // escape to close & body scroll
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") setActive(null);
    }
    if (active) document.body.style.overflow = "hidden"; else document.body.style.overflow = "auto";
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 bg-black/20 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && (
          <div className="fixed inset-0 grid place-items-center z-20 p-4">
            <motion.div
              layoutId={`card-${active.id}-${id}`}
              ref={ref}
              className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <motion.img
                layoutId={`image-${active.id}-${id}`}
                src={active.image}
                alt={active.title}
                className="w-full h-60 object-cover"
              />
              <div className="p-4 space-y-3 overflow-auto">
                <motion.h3 layoutId={`title-${active.id}-${id}`} className="font-bold text-neutral-800 dark:text-neutral-100">
                  {active.title}
                </motion.h3>
                <motion.p layoutId={`description-${active.id}-${id}`} className="text-neutral-600 dark:text-neutral-400 text-sm">
                  {active.subtitle}
                </motion.p>
                <p className="text-neutral-700 dark:text-neutral-300 text-sm whitespace-pre-wrap">
                  {active.content}
                </p>
                <a href={active.url} target="_blank" className="inline-block px-4 py-2 bg-purple-600 text-white rounded-full text-sm">Read full</a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ul className="max-w-2xl mx-auto w-full divide-y divide-neutral-200 dark:divide-neutral-700">
        {items.map((item) => (
          <motion.li
            key={item.id}
            layoutId={`card-${item.id}-${id}`}
            onClick={() => setActive(item)}
            className="p-4 flex justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
          >
            <div className="flex gap-4 items-center">
              <motion.img
                layoutId={`image-${item.id}-${id}`}
                src={item.image}
                alt={item.title}
                className="h-14 w-14 rounded-lg object-cover"
              />
              <div>
                <motion.h3 layoutId={`title-${item.id}-${id}`} className="font-medium text-neutral-800 dark:text-neutral-200">
                  {item.title}
                </motion.h3>
                <motion.p layoutId={`description-${item.id}-${id}`} className="text-neutral-600 dark:text-neutral-400 text-sm">
                  {item.subtitle}
                </motion.p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={(e)=>{e.stopPropagation(); onToggleSave?.(item.id)}}
                className="p-2 rounded-full hover:bg-purple-100"
              >
                {savedIds.includes(item.id) ? (
                  <BookmarkCheck className="h-5 w-5 text-purple-600" />
                ) : (
                  <BookmarkPlus className="h-5 w-5 text-gray-500" />
                )}
              </button>
              <motion.button layoutId={`button-${item.id}-${id}`} className="px-4 py-2 bg-gray-100 text-black rounded-full text-sm hover:bg-purple-600 hover:text-white">
                Read
              </motion.button>
            </div>
          </motion.li>
        ))}
      </ul>
    </>
  );
} 