"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { BookmarkPlus, BookmarkCheck } from "lucide-react";
import InspectionSheetModal from "./InspectionSheetModal";

export default function ExpandableCardList({ items = [], savedIds = [], onToggleSave }) {
  const [active, setActive] = useState(null);

  const getCompanyInitial = (subtitle = "") => {
    const clean = subtitle.replace(/^(by|from)\s+/i, "").trim();
    return clean ? clean.charAt(0).toUpperCase() : "E";
  };

  const getCompanyClean = (subtitle = "") => {
    return subtitle ? subtitle.split(/[-·|]/)[0].trim() : "Engineering Article";
  };

  return (
    <>
      {/* Detail Inspection Modal */}
      <InspectionSheetModal
        article={active}
        isOpen={!!active}
        onClose={() => setActive(null)}
        isSaved={active ? savedIds.includes(active.id) : false}
        onToggleSave={onToggleSave}
      />

      {/* Search Results List Stack (Apple Table View) */}
      <div className="max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="font-mono text-[10.5px] uppercase tracking-wider text-stone-500">
            {items.length} Articles Located
          </span>
          <span className="font-mono text-[10px] text-stone-400">
            Semantic Index
          </span>
        </div>

        <ul className="bg-white/95 backdrop-blur-md border border-stone-200/80 rounded-2xl shadow-sm divide-y divide-stone-100 overflow-hidden">
          {items.map((item) => (
            <li
              key={item.id}
              onClick={() => setActive(item)}
              className="p-4 sm:p-4.5 flex justify-between items-center gap-4 hover:bg-stone-50/80 transition-colors cursor-pointer group"
            >
              <div className="flex gap-3.5 items-center min-w-0">
                {/* Architectural Monogram Stamp */}
                <div className="w-10 h-10 rounded-xl bg-stone-900 text-stone-100 flex items-center justify-center font-mono font-bold text-xs border border-stone-800 shadow-sm shrink-0 group-hover:bg-amber-900 group-hover:border-amber-800 transition-colors">
                  {getCompanyInitial(item.subtitle)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-amber-700 font-medium truncate block">
                      {getCompanyClean(item.subtitle)}
                    </span>
                  </div>

                  <h3 className="font-serif text-[15px] sm:text-base font-normal text-stone-900 leading-snug group-hover:text-amber-900 transition-colors line-clamp-1">
                    {item.title}
                  </h3>

                  <p className="text-stone-500 text-xs line-clamp-1 font-sans mt-0.5">
                    {item.content}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSave?.(item.id);
                  }}
                  className="p-2 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-200/60 transition-colors cursor-pointer"
                  title={savedIds.includes(item.id) ? "Saved in library" : "Save article"}
                >
                  {savedIds.includes(item.id) ? (
                    <BookmarkCheck className="h-4 w-4 text-amber-700" />
                  ) : (
                    <BookmarkPlus className="h-4 w-4 text-stone-400" />
                  )}
                </button>

                <button 
                  className="px-3.5 py-1.5 bg-stone-100 text-stone-800 group-hover:bg-stone-900 group-hover:text-stone-50 rounded-full text-xs font-medium border border-stone-200/80 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Read</span>
                  <span className="text-[10px] opacity-70">&rarr;</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}