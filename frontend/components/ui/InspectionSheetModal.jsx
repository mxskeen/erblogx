"use client";
import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookmarkPlus, BookmarkCheck, ExternalLink, X } from "lucide-react";
import { useOutsideClick } from "../../hooks/useOutsideClick";

export default function InspectionSheetModal({
  article,
  isOpen,
  onClose,
  isSaved = false,
  onToggleSave,
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  useOutsideClick(modalRef, () => {
    if (isOpen) onClose();
  });

  if (!article) return null;

  const getCompanyInitial = (name = "") => {
    const clean = name.replace(/^(by|from)\s+/i, "").trim();
    return clean ? clean.charAt(0).toUpperCase() : "E";
  };

  const getCompanyClean = (name = "") => {
    return name ? name.split(/[-·|]/)[0].trim() : "Engineering Article";
  };

  const companyName = article.company || getCompanyClean(article.subtitle || "");
  const companyInitial = getCompanyInitial(companyName);
  const tag = article.tag || "Production Systems";
  const level = article.level || "Principal Infrastructure";
  const annotation = article.annotation || "Critical Production Architecture";
  const summary = article.summary || article.content || "";
  const takeaways = article.takeaways || [
    "Eliminated cascading failure propagation across distributed boundaries.",
    "Deterministic latency profile maintained under 10x traffic multiplier.",
    "Zero data-loss failover protocol verified in continuous fault-injection tests."
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-stone-950/50 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            ref={modalRef}
            className="w-full max-w-xl bg-[#FAF8F5] border border-stone-200/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative text-stone-900"
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {/* Technical Blueprint Header Banner */}
            <div className="bg-[#0B101D] text-stone-100 relative overflow-hidden border-b border-stone-800 shrink-0">
              {/* Drafting Grid Texture */}
              <div 
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                  backgroundSize: "20px 20px"
                }}
              />

              {/* Close Button Top-Right */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close detail modal"
              >
                <X size={15} />
              </button>

              {/* SVG Schematic Diagram if provided */}
              {article.diagram ? (
                <div 
                  className="w-full h-44 sm:h-52 overflow-hidden flex items-center justify-center bg-[#090E18]"
                  dangerouslySetInnerHTML={{ __html: article.diagram }}
                />
              ) : (
                <div className="p-5 sm:p-6 relative z-10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center font-mono font-bold text-amber-400 text-sm shadow-sm">
                    {companyInitial}
                  </div>
                  <div>
                    <span className="font-mono text-xs uppercase tracking-wider text-amber-400 font-medium block">
                      {companyName}
                    </span>
                    <span className="font-mono text-[9.5px] text-stone-400 uppercase tracking-widest block">
                      Archival Engineering Article
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-7 space-y-4 overflow-y-auto">
              {/* Metadata Row */}
              <div className="flex items-center justify-between font-mono text-[10.5px]">
                <span className="text-amber-800 font-semibold uppercase tracking-wider">
                  {companyName} · {tag}
                </span>
                <span className="text-stone-400">
                  {level}
                </span>
              </div>

              {/* Serif Title */}
              <h2 className="font-serif text-xl sm:text-2xl font-normal leading-snug text-stone-900 tracking-tight">
                {article.title}
              </h2>

              {/* Annotation Banner */}
              <div className="flex items-center gap-2 p-2.5 bg-amber-50/70 border-l-3 border-amber-600 rounded-r text-xs text-amber-900 font-serif italic">
                <span>{annotation}</span>
              </div>

              {/* Overview & Content */}
              <div className="border-t border-stone-200/70 pt-3 space-y-2">
                <h4 className="font-mono text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                  Architectural Overview
                </h4>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {summary}
                </p>
              </div>

              {/* Key Decisions / Takeaways */}
              {takeaways && takeaways.length > 0 && (
                <div className="border-t border-stone-200/70 pt-3 space-y-2">
                  <h4 className="font-mono text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                    Key Architectural Decisions
                  </h4>
                  <ul className="space-y-1.5 text-xs text-stone-600 font-sans pl-1">
                    {takeaways.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-700 font-mono text-[11px] select-none">—</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Footer Meta & Actions */}
              <div className="border-t border-stone-200/70 pt-5 flex items-center justify-between gap-3 flex-wrap">
                <span className="font-mono text-[10.5px] text-stone-400">
                  Published by {companyName}
                </span>

                <div className="flex items-center gap-2 ml-auto">
                  {onToggleSave && (
                    <button
                      onClick={() => onToggleSave(article.id)}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-medium transition-colors cursor-pointer"
                    >
                      {isSaved ? (
                        <>
                          <BookmarkCheck size={14} className="text-amber-700" />
                          <span>Saved in Library</span>
                        </>
                      ) : (
                        <>
                          <BookmarkPlus size={14} className="text-stone-500" />
                          <span>Save Article</span>
                        </>
                      )}
                    </button>
                  )}

                  {article.url && (
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-lg text-xs font-medium transition-all shadow-sm group"
                    >
                      <span>Read Original Article</span>
                      <ExternalLink size={13} className="text-stone-400 group-hover:text-stone-100 transition-colors" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
