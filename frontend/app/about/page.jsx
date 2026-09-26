import React from "react";

export default function AboutPage() {
  return (
    <div className="min-h-screen drafting-canvas py-12 px-4 flex justify-center">
      <div className="max-w-2xl w-full bg-white/95 border border-stone-200/90 rounded-2xl p-6 sm:p-8 shadow-sm text-stone-900 space-y-6">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-stone-500 font-semibold block mb-1">
            Architecture Archive
          </span>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-stone-900">
            About ErBlogX
          </h1>
        </div>

        <div className="space-y-4 text-stone-600 text-sm sm:text-base leading-relaxed font-sans">
          <p>
            ErBlogX is a semantic search engine over engineering blogs and articles. It indexes over 25,000 in-depth engineering articles, architecture breakdowns, and incident postmortems published by engineering teams at companies like Netflix, Stripe, Google, Uber, Cloudflare, and Figma.
          </p>

          <div className="border-t border-stone-100 pt-4">
            <h2 className="font-mono text-xs uppercase tracking-wider text-stone-400 font-semibold mb-2">
              Why ErBlogX Was Built
            </h2>
            <p className="mb-3">
              When building real-world systems, engineers want to learn from how other teams solved difficult scaling, database, and reliability problems in production.
            </p>
            <p>
              Standard search engines often prioritize basic tutorials, marketing articles, or SEO spam over deep technical writeups. ErBlogX was built to remove that friction. It gives developers a focused index to explore proven distributed system designs, consensus trade-offs, network architectures, and postmortems without the noise.
            </p>
          </div>

          <div className="border-t border-stone-100 pt-4">
            <h2 className="font-mono text-xs uppercase tracking-wider text-stone-400 font-semibold mb-2">
              Creator and Connect
            </h2>
            <p className="mb-4">
              ErBlogX was designed and built by Maskeen.
            </p>

            <div className="flex flex-wrap gap-2.5">
              <a
                href="https://maskeen.site/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-action"
                style={{ textDecoration: "none", color: "var(--ink-primary)", fontWeight: 500 }}
              >
                <span>Website: maskeen.site</span>
                <span style={{ opacity: 0.6 }}>&rarr;</span>
              </a>

              <a
                href="https://www.linkedin.com/in/mxskeen/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-action btn-linkedin"
                style={{ textDecoration: "none" }}
              >
                <span>LinkedIn Profile</span>
                <span style={{ opacity: 0.6 }}>&rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}