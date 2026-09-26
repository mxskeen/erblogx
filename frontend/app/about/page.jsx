import React from "react";

export default function AboutPage() {
  return (
    <div className="min-h-screen drafting-canvas py-12 px-4 flex justify-center">
      <div className="max-w-2xl w-full bg-white/95 border border-stone-200/90 rounded-2xl p-6 sm:p-8 shadow-sm text-stone-900 space-y-6">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-amber-800 font-semibold block mb-1">
            Archival Engineering Index
          </span>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-stone-900">
            About ErBlogX
          </h1>
        </div>

        <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-sans">
          ErBlogX is an architectural intelligence engine indexing 25,000+ technical articles from foundational software engineering organizations including Netflix, Stripe, Google, Cloudflare, Figma, and Uber.
        </p>

        <div className="border-t border-stone-100 pt-4 space-y-3">
          <h2 className="font-mono text-xs uppercase tracking-wider text-stone-400 font-semibold">
            Architectural Capabilities
          </h2>
          <ul className="space-y-2 text-xs sm:text-sm text-stone-700 font-sans">
            <li className="flex items-start gap-2">
              <span className="text-amber-700 font-mono select-none">—</span>
              <span><strong>Semantic Discovery:</strong> Query distributed system patterns, kernel optimizations, and failure postmortems without sign-up.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-700 font-mono select-none">—</span>
              <span><strong>AI Synthesis:</strong> Generate executive consensus briefings and trade-off summaries from retrieved articles.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-700 font-mono select-none">—</span>
              <span><strong>Personal Library:</strong> Curate, annotate, and archive production benchmarks in a personal vault.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-700 font-mono select-none">—</span>
              <span><strong>Live Pipeline:</strong> Bi-weekly ingestion of leading engineering articles across 600+ vetted sources.</span>
            </li>
          </ul>
        </div>

        <div className="border-t border-stone-100 pt-4 space-y-3">
          <h2 className="font-mono text-xs uppercase tracking-wider text-stone-400 font-semibold">
            Archival Trajectory
          </h2>
          <ul className="space-y-2 text-xs sm:text-sm text-stone-700 font-sans">
            <li className="flex items-start gap-2">
              <span className="text-stone-400 font-mono select-none">&bull;</span>
              <span>Interactive dialogue with individual engineering whitepapers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-stone-400 font-mono select-none">&bull;</span>
              <span>Synthesized audio briefings and distributed system telemetry graphs</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-stone-400 font-mono select-none">&bull;</span>
              <span>Automated cross-company consensus cluster mapping</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}