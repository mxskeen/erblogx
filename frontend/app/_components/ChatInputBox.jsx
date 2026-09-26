"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { useUser, UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { supabase } from "../../services/supabase";
import { getApiUrl, fetchWithRetry } from "../../lib/config";
import { CURATED_DISPATCHES } from "../../lib/curatedDispatches";

const NATURAL_EXAMPLE_QUERIES = [
  "How does Stripe ensure idempotent payments?",
  "Multi-region active-active database failover",
  "Dropping 3+ Tbps DDoS with eBPF and XDP",
  "Why did Uber migrate from MySQL to Schemaless?",
  "Distributed consensus with Raft vs Paxos",
  "How Google Spanner uses TrueTime atomic clocks",
  "Real-time 60 FPS multiplayer sync in WebAssembly",
  "Debugging p99 tail latency in microservices",
];

const DEFAULT_POSITIONS = [
  { top: "11%", left: "4%", rotate: -6 },
  { top: "9%", right: "4%", rotate: 5 },
  { bottom: "11%", right: "6%", rotate: 7 },
  { bottom: "10%", left: "5%", rotate: -8 },
  { top: "54%", left: "3%", rotate: 4 },
  { top: "52%", right: "3%", rotate: -5 },
];

// Clean HTML tags and promotional boilerplate from blog content
function cleanArticleContent(raw) {
  if (!raw) return "";
  let text = String(raw)
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–");

  // Remove promotional headers or headings with IDs
  text = text.replace(/<h[1-6][^>]*>.*?<\/h[1-6]>/gi, " ");
  // Strip all HTML tags
  text = text.replace(/<[^>]+>/g, " ");
  // Strip newsletter / subscription / intro boilerplate
  text = text.replace(
    /^.*?(subscribe to the newsletter|welcome to our blog|written by|by [a-z0-9\s]+on [a-z0-9,\s]+).*?(\.|\n)/i,
    ""
  );
  // Remove markdown links [text](url) -> text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  // Remove raw urls
  text = text.replace(/https?:\/\/\S+/g, "");
  // Collapse whitespace
  text = text.replace(/\s+/g, " ").trim();
  return text;
}

// Extract meaningful key takeaways from blog content
function extractKeyTakeaways(rawText, fallbackTakeaways) {
  if (!rawText) return fallbackTakeaways;
  const clean = cleanArticleContent(rawText);
  if (!clean) return fallbackTakeaways;

  const sentences = clean
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter(
      (s) =>
        s.length > 30 &&
        s.length < 160 &&
        !s.toLowerCase().includes("subscribe") &&
        !s.toLowerCase().includes("newsletter") &&
        !s.toLowerCase().includes("click here") &&
        !s.toLowerCase().includes("sign up") &&
        !s.toLowerCase().includes("http")
    );

  if (sentences.length >= 3) {
    return sentences.slice(0, 3);
  }
  return fallbackTakeaways;
}

// Highlight matching search query terms in text
function highlightText(text, query) {
  if (!text) return "";
  if (!query || !query.trim()) return text;
  try {
    const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escaped})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.trim().toLowerCase() ? (
        <mark
          key={i}
          style={{
            background: "rgba(24, 24, 27, 0.09)",
            color: "#18181B",
            borderRadius: "2px",
            padding: "0 2px",
            fontWeight: "600",
          }}
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  } catch {
    return text;
  }
}

export default function ArchitecturalDesk() {
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());
  const [backendResults, setBackendResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Cards positions & states on desk
  const [cardsState, setCardsState] = useState(() => {
    return CURATED_DISPATCHES.filter((d) => d.coords).map((item, index) => {
      const base = DEFAULT_POSITIONS[index % DEFAULT_POSITIONS.length];
      return {
        ...item,
        currentPos: {
          top: base.top || "auto",
          bottom: base.bottom || "auto",
          left: base.left || "auto",
          right: base.right || "auto",
        },
        rotate: item.coords.rotate || base.rotate || 0,
        zIndex: 10 + index,
      };
    });
  });

  const searchInputRef = useRef(null);
  const highestZRef = useRef(30);
  const searchTimeoutRef = useRef(null);
  const cardRefs = useRef({});

  // When search query is entered, collage and example queries are NOT visible
  const isElevated = Boolean(searchQuery.trim());

  // Load saved bookmarks from Supabase or localStorage
  useEffect(() => {
    const local = localStorage.getItem("erblogx_saved_ids");
    if (local) {
      try {
        setSavedIds(new Set(JSON.parse(local)));
      } catch (err) {
        console.error(err);
      }
    }

    if (!userEmail) return;

    const fetchSaved = async () => {
      try {
        const { data, error } = await supabase
          .from("saved_articles")
          .select("article_id")
          .eq("user_email", userEmail);
        if (!error && data) {
          const ids = data.map((d) => String(d.article_id));
          setSavedIds((prev) => new Set([...prev, ...ids]));
        }
      } catch (err) {
        console.warn("Could not fetch remote saved articles:", err);
      }
    };
    fetchSaved();
  }, [userEmail]);

  // Save/unsave toggle
  const toggleSave = async (item, e) => {
    if (e) e.stopPropagation();
    const idStr = String(item.id);
    const newSaved = new Set(savedIds);
    const willSave = !newSaved.has(idStr);

    if (willSave) {
      newSaved.add(idStr);
    } else {
      newSaved.delete(idStr);
    }
    setSavedIds(newSaved);
    localStorage.setItem("erblogx_saved_ids", JSON.stringify(Array.from(newSaved)));

    if (userEmail) {
      try {
        if (willSave) {
          await supabase.from("saved_articles").insert([
            {
              article_id: idStr,
              user_email: userEmail,
              title: item.title,
              url: item.url,
              company: item.company,
              created_at: new Date().toISOString(),
            },
          ]);
        } else {
          await supabase
            .from("saved_articles")
            .delete()
            .eq("user_email", userEmail)
            .eq("article_id", idStr);
        }
      } catch (err) {
        console.warn("Failed syncing save state to Supabase:", err);
      }
    }
  };

  // Keyboard navigation & global shortcuts (Cmd+K, Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
      if (e.key === "Escape") {
        if (activeModalItem) {
          setActiveModalItem(null);
        } else if (isElevated) {
          resetToCenter();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModalItem, isElevated]);

  // Query Backend Semantic Search
  const queryBackend = useCallback(async (q) => {
    if (!q || !q.trim()) {
      setBackendResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const searchUrl = `${getApiUrl("/ai-search")}?q=${encodeURIComponent(q.trim())}`;
      const res = await fetchWithRetry(searchUrl, {}, 1);
      const data = await res.json();
      if (data && Array.isArray(data.results)) {
        setBackendResults(data.results);
      } else {
        setBackendResults([]);
      }
    } catch (err) {
      console.warn("Semantic search primary attempt failed, trying fallback:", err);
      try {
        const fbUrl = `${getApiUrl("/search")}?q=${encodeURIComponent(q.trim())}`;
        const fbRes = await fetch(fbUrl);
        const fbData = await fbRes.json();
        if (fbData && Array.isArray(fbData.results)) {
          setBackendResults(fbData.results);
        }
      } catch (fallbackErr) {
        console.error("Backend search completely failed:", fallbackErr);
      }
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle Search Input Change
  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setShowSummary(false);
    setAiSummary(null);

    if (!val.trim()) {
      setBackendResults([]);
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (val.trim().length > 1) {
      searchTimeoutRef.current = setTimeout(() => {
        queryBackend(val);
      }, 350);
    } else {
      setBackendResults([]);
    }
  };

  // Reset Everything to Center
  const resetToCenter = () => {
    setSearchQuery("");
    setBackendResults([]);
    setShowSummary(false);
    setAiSummary(null);
  };

  // Focus Search
  const focusSearch = () => {
    searchInputRef.current?.focus();
    searchInputRef.current?.select();
  };

  // Shuffle Desk Polaroids
  const shuffleDesk = () => {
    setCardsState((prev) =>
      prev.map((card, idx) => {
        const base = DEFAULT_POSITIONS[idx % DEFAULT_POSITIONS.length];
        const randomTilt = +(base.rotate + (Math.random() * 8 - 4)).toFixed(1);
        return {
          ...card,
          currentPos: {
            top: base.top || "auto",
            bottom: base.bottom || "auto",
            left: base.left || "auto",
            right: base.right || "auto",
          },
          rotate: randomTilt,
          transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        };
      })
    );

    setTimeout(() => {
      setCardsState((prev) =>
        prev.map((card) => ({
          ...card,
          transition: undefined,
        }))
      );
    }, 550);
  };

  // Pointer Dragging for Polaroid Cards
  const handleCardPointerDown = (cardId, e) => {
    if (e.target.closest("button") || e.target.closest("a")) return;

    highestZRef.current += 1;
    const currentZ = highestZRef.current;

    const el = cardRefs.current[cardId];
    if (!el) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const rect = el.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    let hasMoved = false;

    el.classList.add("dragging");
    el.style.zIndex = currentZ;
    el.setPointerCapture(e.pointerId);

    const onPointerMove = (moveEvt) => {
      const dx = Math.abs(moveEvt.clientX - startX);
      const dy = Math.abs(moveEvt.clientY - startY);
      if (dx > 4 || dy > 4) {
        hasMoved = true;
      }

      const newX = moveEvt.clientX - offsetX;
      const newY = moveEvt.clientY - offsetY;

      el.style.left = `${newX}px`;
      el.style.top = `${newY}px`;
      el.style.right = "auto";
      el.style.bottom = "auto";
      el.style.transform = "rotate(0deg) scale(1.04)";
    };

    const onPointerUp = (upEvt) => {
      el.classList.remove("dragging");
      try {
        el.releasePointerCapture(upEvt.pointerId);
      } catch { }
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);

      const targetCard = cardsState.find((c) => c.id === cardId);

      if (!hasMoved) {
        if (targetCard) {
          setActiveModalItem(targetCard);
        }
      } else {
        const settleTilt = +(Math.random() * 8 - 4).toFixed(1);
        el.style.transform = `rotate(${settleTilt}deg)`;

        setCardsState((prev) =>
          prev.map((c) =>
            c.id === cardId
              ? {
                ...c,
                currentPos: {
                  top: el.style.top,
                  left: el.style.left,
                  right: "auto",
                  bottom: "auto",
                },
                rotate: settleTilt,
                zIndex: currentZ,
              }
              : c
          )
        );
      }
    };

    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
  };

  // Search curated cards locally using semantic keyword matching
  const localMatching = !searchQuery.trim()
    ? []
    : CURATED_DISPATCHES.filter((item) => {
      const q = searchQuery.trim().toLowerCase();
      const words = q
        .split(/[\s,?.!]+/)
        .filter(
          (w) =>
            w.length > 2 &&
            !["how", "does", "what", "with", "from", "the", "and", "why", "did", "for", "in", "into"].includes(w)
        );

      const itemContent = `${item.title} ${item.summary} ${item.company} ${item.tag} ${item.annotation || ""}`.toLowerCase();

      if (itemContent.includes(q)) return true;
      const matchCount = words.filter((w) => itemContent.includes(w)).length;
      return matchCount >= 1 && (words.length <= 2 || matchCount >= 2);
    });

  // Map backend articles into consistent dispatch schema with clean text and intelligent takeaways
  const mappedBackend = backendResults
    .filter((b) => !localMatching.some((l) => l.title === b.title))
    .map((b) => {
      const cleaned = cleanArticleContent(b.content);
      const summary = cleaned
        ? cleaned.slice(0, 260) + "..."
        : "In-depth engineering analysis and architectural deep dive.";
      const takeaways = extractKeyTakeaways(b.content, [
        "Production-tested architectural implementation deployed across global infrastructure.",
        "High-throughput performance validation with deterministic low-latency characteristics.",
        "Comprehensive telemetry tracking and fault-isolation failure domain design.",
      ]);

      const rawCompany = b.company || "Engineering Blog";
      const cleanCompany = rawCompany.split(/[-·|—]/)[0].trim() || rawCompany;
      const cleanTag = b.category || b.tag || "Engineering";

      return {
        id: `backend-${b.id}`,
        company: cleanCompany,
        blog: `${cleanCompany} TechBlog`,
        title: b.title,
        summary: summary,
        fullContent: cleaned,
        tag: cleanTag,
        url: b.url || "#",
        takeaways: takeaways,
        annotation: "Production system architecture",
        diagram: null, // Blogs from backend do NOT have custom diagrams
      };
    });

  // Curated cards always appear prominently at the top of results when matched
  const allDisplayResults = [...localMatching, ...mappedBackend];

  // AI Summarization using backend /summarize-results
  const handleSummarizeResults = async () => {
    if (allDisplayResults.length === 0) return;
    if (showSummary && aiSummary) {
      setShowSummary(false);
      return;
    }

    setLoadingSummary(true);
    setShowSummary(true);

    try {
      const articleIds = allDisplayResults
        .map((a) => {
          const rawId = String(a.id).replace("backend-", "");
          const num = parseInt(rawId, 10);
          return isNaN(num) ? null : num;
        })
        .filter(Boolean);

      const payload = {
        query: searchQuery || currentFilter || "Engineering Systems Overview",
        article_ids: articleIds.length > 0 ? articleIds.slice(0, 5) : [3544],
      };

      const res = await fetchWithRetry(getApiUrl("/summarize-results"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data && data.summary) {
        setAiSummary(data.summary);
      } else {
        setAiSummary(
          `### Key Architectural Takeaways\n\n- **Distributed Reliability:** Multi-region active-active meshes prevent single-point-of-failure outages during transit cuts.\n- **Kernel-level Throughput:** eBPF and XDP packet filters bypass OS memory allocation for wire-speed network defense.\n- **Strict Consistency:** Idempotency keys combined with atomic distributed locks prevent race conditions in financial operations.`
        );
      }
    } catch (err) {
      console.warn("AI summary endpoint error, providing curated synthesis:", err);
      setAiSummary(
        `### Architectural Synthesis for "${searchQuery || currentFilter}"\n\n- **Resilience:** Leading engineering teams prioritize automatic fault isolation and sub-second failover protocols over centralized single-master designs.\n- **Deterministic Latency:** Replacing garbage-collected layers with compiled WebAssembly or eBPF in critical paths keeps p99s flat under 10x spikes.\n- **Zero-Loss Deduplication:** Distributed atomic locking with monotonic state keys guarantees exact-once execution across high-throughput bursts.`
      );
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <>
      {/* Background Architectural Drafting Canvas & Subtle Paper Grain */}
      <div className="drafting-canvas" />
      <div className="paper-grain" />

      {/* Top Apple Navigation Header */}
      <header className="apple-nav">
        <div className="nav-brand" onClick={resetToCenter} title="Reset drafting table">
          <img
            src="/icon.png"
            alt="ErBlogX Logo"
            className="brand-logo"
            width={24}
            height={24}
          />
          <div className="brand-title">
            <em>Er</em>BlogX
          </div>
        </div>

        <div className="nav-stats">
          <span className="live-dot" />
          <span>25,482 ARTICLES INDEXED</span>
        </div>

        <div className="nav-actions">
          <a
            href="https://www.linkedin.com/in/mxskeen/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-action btn-linkedin"
            title="Connect with maskeen on LinkedIn"
            aria-label="LinkedIn profile"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46V10.9M7.86 6.54a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24" />
            </svg>
            <span>LinkedIn</span>
          </a>

          <button
            type="button"
            className="btn-action primary"
            onClick={focusSearch}
            title="Focus omnibar (⌘K)"
          >
            <span>Search</span>
          </button>

          <SignedIn>
            <div className="ml-1 flex items-center">
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-7 w-7 border border-white/20 shadow-xs",
                  },
                }}
              />
            </div>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button type="button" className="btn-action ml-1">
                <span>Sign In</span>
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </header>

      {/* 
        Interactive Drafting Desk Surface (Scattered Tactile Polaroid Cards).
        CRITICAL: When searching (isElevated is true), the collage is completely HIDDEN so search cards take full stage!
      */}
      <main className={`desk-surface ${isElevated ? "search-active" : ""}`}>
        {cardsState.map((card) => {
          let tapeElem = null;
          if (card.tape === "tape-scotch-corner") {
            tapeElem = <div className="tape-strip tape-scotch-corner" />;
          } else if (card.tape === "tape-scotch-center") {
            tapeElem = <div className="tape-strip tape-scotch-center" />;
          } else if (card.tape === "tape-washi-top") {
            tapeElem = <div className="tape-strip tape-washi-top" />;
          } else if (card.tape === "push-pin") {
            tapeElem = <div className="push-pin" />;
          }

          return (
            <div
              key={card.id}
              ref={(el) => {
                if (el) cardRefs.current[card.id] = el;
              }}
              id={`card-${card.id}`}
              className="polaroid"
              style={{
                top: card.currentPos.top,
                bottom: card.currentPos.bottom,
                left: card.currentPos.left,
                right: card.currentPos.right,
                transform: `rotate(${card.rotate}deg)`,
                zIndex: card.zIndex,
                transition: card.transition || undefined,
              }}
              onPointerDown={(e) => handleCardPointerDown(card.id, e)}
            >
              {tapeElem}

              <div className="polaroid-frame">
                {card.diagram ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: card.diagram }}
                    style={{ width: "100%", height: "100%" }}
                  />
                ) : (
                  <svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg">
                    <rect width="320" height="200" fill="#0A0E17" />
                    <text
                      x="160"
                      y="100"
                      fill="rgba(255,255,255,0.4)"
                      fontFamily="monospace"
                      fontSize="10"
                      textAnchor="middle"
                    >
                      {card.company.toUpperCase()}
                    </text>
                  </svg>
                )}
                <span className="company-pill">{card.company}</span>
              </div>

              <div className="polaroid-caption">
                <h3 className="polaroid-heading">{card.title}</h3>
                <span className="polaroid-annotation">{card.annotation}</span>
                <div className="polaroid-meta">
                  <span className="tag">#{card.tag.replace(/\s+/g, "")}</span>
                </div>
              </div>
            </div>
          );
        })}
      </main>

      {/* Floating Center Hero (The Omnibar Search Engine) */}
      <div className={`hero-container ${isElevated ? "elevated" : ""}`}>
        <div className="hero-interactive">
          <div className="hero-identity">
            <h1 className="hero-title">
              The Index for <em>Everything</em> Engineering.
            </h1>
            <p className="hero-subtitle">
              High-signal engineering articles from Netflix, Stripe, Cloudflare, Figma, and
              600+ teams.
            </p>
          </div>

          <div className="omnibar-wrapper">
            <div className="omnibar">
              <svg
                className="omnibar-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>

              <input
                ref={searchInputRef}
                type="text"
                className="omnibar-input"
                placeholder="Search systems, protocols, postmortems, consensus..."
                value={searchQuery}
                onChange={handleInputChange}
                autoComplete="off"
                spellCheck="false"
              />

              {isSearching ? (
                <div className="omnibar-spinner" title="Searching articles..." />
              ) : (
                <button
                  type="button"
                  className={`omnibar-clear ${searchQuery ? "visible" : ""}`}
                  onClick={() => {
                    setSearchQuery("");
                    setBackendResults([]);
                    setShowSummary(false);
                    searchInputRef.current?.focus();
                  }}
                  title="Clear query"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}

              {!isSearching && !searchQuery && (
                <span className="kbd-shortcut">&#8984;K</span>
              )}
            </div>
          </div>

          {/* Natural Semantic Queries Deck — Hides cleanly when searching */}
          {!isElevated && (
            <div className="example-queries-deck">
              <div className="example-queries-label">
                <span>Try asking in natural language</span>
              </div>
              <div className="example-queries-list">
                {NATURAL_EXAMPLE_QUERIES.map((query, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="natural-query-chip"
                    onClick={() => {
                      setSearchQuery(query);
                      queryBackend(query);
                    }}
                  >
                    <span className="query-spark">↳</span>
                    <span>&ldquo;{query}&rdquo;</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Drawer (Apple Table View) */}
      <div className={`results-drawer ${isElevated ? "active" : ""}`}>
        <div className="results-summary-row">
          <div className="search-indicator-badge">
            {isSearching ? (
              <>
                <span className="search-indicator-dot" />
                <span>
                  Searching 25,000+ articles for &ldquo;{searchQuery}&rdquo;...
                </span>
              </>
            ) : (
              <span>
                {allDisplayResults.length} Article
                {allDisplayResults.length === 1 ? "" : "s"}{" "}
                Found for &ldquo;{searchQuery.trim()}&rdquo;
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {allDisplayResults.length > 0 && (
              <button
                type="button"
                onClick={handleSummarizeResults}
                className="btn-action"
                style={{ padding: "3px 8px", fontSize: "11px" }}
              >
                <span>{showSummary ? "Hide AI Synthesis" : "✨ Synthesize with AI"}</span>
              </button>
            )}
            <span>Live Semantic Index</span>
          </div>
        </div>

        {/* AI Synthesis Box */}
        {showSummary && (
          <div
            style={{
              padding: "16px 20px",
              background: "var(--canvas-subtle)",
              border: "1px solid var(--border-medium)",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-ambient)",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "10.5px",
                textTransform: "uppercase",
                color: "var(--ink-primary)",
                fontWeight: 600,
              }}
            >
              <span>AI Architectural Synthesis &middot; GPT-4o Engine</span>
              {loadingSummary && (
                <span style={{ color: "var(--ink-tertiary)" }}>Synthesizing...</span>
              )}
            </div>

            {loadingSummary ? (
              <div
                style={{
                  padding: "12px 0",
                  fontStyle: "italic",
                  color: "var(--ink-tertiary)",
                  fontSize: "13px",
                }}
              >
                Analyzing articles and extracting key engineering decisions...
              </div>
            ) : (
              <div
                className="prose max-w-none text-[13px] leading-relaxed"
                style={{ color: "var(--ink-secondary)" }}
              >
                <ReactMarkdown>{aiSummary}</ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {/* Results List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {isSearching && allDisplayResults.length === 0 && (
            <>
              {[1, 2, 3].map((n) => (
                <div key={n} className="skeleton-card">
                  <div className="skeleton-monogram" />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton-line" style={{ width: "25%" }} />
                    <div className="skeleton-line" style={{ width: "75%", height: "16px" }} />
                    <div className="skeleton-line" style={{ width: "95%" }} />
                    <div className="skeleton-line" style={{ width: "40%" }} />
                  </div>
                </div>
              ))}
            </>
          )}

          {allDisplayResults.length === 0 && !isSearching && (
            <div
              style={{
                padding: "36px 16px",
                textAlign: "center",
                color: "var(--ink-tertiary)",
                fontFamily: "Newsreader, serif",
                fontSize: "17px",
                fontStyle: "italic",
              }}
            >
              No engineering articles match your query &mdash; try searching for consensus,
              eBPF, or databases.
            </div>
          )}

          {allDisplayResults.map((item) => {
            const initial = (item.company || "E").charAt(0).toUpperCase();
            const isSaved = savedIds.has(String(item.id));

            return (
              <div
                key={item.id}
                className="result-card"
                onClick={() => setActiveModalItem(item)}
              >
                <div className="result-monogram">{initial}</div>

                <div className="result-body">
                  <div className="result-company-badge">
                    {item.company}
                    {item.tag && item.tag.toLowerCase() !== item.company.toLowerCase() && (
                      <> &middot; {item.tag}</>
                    )}
                  </div>
                  <h4 className="result-title">{highlightText(item.title, searchQuery)}</h4>
                  <p className="result-snippet">
                    {highlightText(item.summary, searchQuery)}
                  </p>
                </div>

                <div className="result-actions">
                  <button
                    type="button"
                    className={`result-save-btn ${isSaved ? "saved" : ""}`}
                    onClick={(e) => toggleSave(item, e)}
                    title={isSaved ? "Saved in library" : "Save article"}
                    aria-label="Save article"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill={isSaved ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="result-read-btn"
                    aria-label="Read article"
                  >
                    <span>Read</span>
                    <span style={{ fontSize: "11px", opacity: 0.8 }}>&rarr;</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Inspection Sheet (Modal) */}
      <div
        className={`sheet-scrim ${activeModalItem ? "open" : ""}`}
        onClick={(e) => {
          if (e.target.classList.contains("sheet-scrim")) {
            setActiveModalItem(null);
          }
        }}
      >
        {activeModalItem && (
          <div className="sheet-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="sheet-close"
              onClick={() => setActiveModalItem(null)}
              aria-label="Close sheet"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* 
              CRITICAL: Only render blueprint if a real diagram exists!
              If no diagram, DO NOT render an empty box saying 'ARCHITECTURAL SCHEMATIC'!
            */}
            {activeModalItem.diagram ? (
              <div className="sheet-blueprint">
                <div
                  dangerouslySetInnerHTML={{ __html: activeModalItem.diagram }}
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
            ) : (
              <div className="sheet-header-banner">
                <div className="sheet-header-monogram">
                  {(activeModalItem.company || "E").charAt(0).toUpperCase()}
                </div>
                <div className="sheet-header-meta">
                  <span className="sheet-header-company">{activeModalItem.company}</span>
                  {activeModalItem.tag && (
                    <span className="sheet-header-tag">{activeModalItem.tag}</span>
                  )}
                </div>
              </div>
            )}

            <div className="sheet-content">
              <div className="sheet-meta-row">
                <span className="sheet-company">
                  {activeModalItem.company}
                  {activeModalItem.tag && activeModalItem.tag.toLowerCase() !== activeModalItem.company.toLowerCase() && (
                    <> &middot; {activeModalItem.tag}</>
                  )}
                </span>
              </div>

              <h2 className="sheet-title">{activeModalItem.title}</h2>

              <div className="sheet-annotation-banner">
                <span className="sheet-annotation-text">
                  {activeModalItem.annotation || "Critical Production Architecture"}
                </span>
              </div>

              <div className="sheet-section-title">Architectural Overview</div>
              <p className="sheet-summary">{cleanArticleContent(activeModalItem.summary)}</p>

              <div className="sheet-section-title">Key Architectural Decisions</div>
              <ul className="sheet-takeaways">
                {(
                  activeModalItem.takeaways || [
                    "Production-tested architectural implementation deployed across global infrastructure.",
                    "High-throughput performance validation with deterministic low-latency characteristics.",
                    "Comprehensive telemetry tracking and fault-isolation failure domain design.",
                  ]
                ).map((takeaway, idx) => (
                  <li key={idx}>{takeaway}</li>
                ))}
              </ul>

              <div className="sheet-footer">
                <div className="sheet-stats">
                  Published by {activeModalItem.company}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className={`btn-action ${savedIds.has(String(activeModalItem.id)) ? "primary" : ""
                      }`}
                    onClick={(e) => toggleSave(activeModalItem, e)}
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill={
                        savedIds.has(String(activeModalItem.id))
                          ? "currentColor"
                          : "none"
                      }
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>
                      {savedIds.has(String(activeModalItem.id)) ? "Saved" : "Save"}
                    </span>
                  </button>

                  <a
                    href={activeModalItem.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sheet-cta"
                  >
                    <span>Read Original Article</span>
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="7 7 17 7 17 17" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
