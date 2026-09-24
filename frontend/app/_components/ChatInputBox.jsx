"use client";
import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from 'react-markdown';
import {
  Search,
  X,
  BookmarkPlus,
  BookmarkCheck,
  Lock,
  Sparkles,
  Shuffle,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../components/ui/button";
import { supabase } from "../../services/supabase";
import { useUser, SignInButton } from "@clerk/nextjs";
import { v4 as uuid } from "uuid";
import CardSpotlight from '../../components/ui/CardSpotlight';
import { useSidebar } from '../../components/ui/sidebar';
import ExpandableCardList from '../../components/ui/ExpandableCardList';
import InspectionSheetModal from '../../components/ui/InspectionSheetModal';
import { MultiStepLoader } from "../../components/ui/MultiStepLoader";
import { getApiUrl, fetchWithRetry } from "../../lib/config";
import { CURATED_DISPATCHES, EDITORIAL_SUGGESTIONS } from "../../lib/curatedDispatches";

// Helper to strip HTML tags
function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "");
}

const CATEGORIES = [
  { id: "all", label: "#All" },
  { id: "Distributed Systems", label: "#Distributed" },
  { id: "API Design", label: "#APIDesign" },
  { id: "Kernel / eBPF", label: "#Kernel/eBPF" },
  { id: "Graphics / Realtime", label: "#Realtime" },
  { id: "Databases", label: "#Databases" },
  { id: "Consensus", label: "#Consensus" },
];

export default function ChatInputBox() {
  const [userSearchInput, setUserSearchInput] = useState("");
  const { user } = useUser();
  const { setOpen } = useSidebar();
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [resultsSummary, setResultsSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [savedIds, setSavedIds] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeModalArticle, setActiveModalArticle] = useState(null);
  const [deskCards, setDeskCards] = useState(
    CURATED_DISPATCHES.filter((d) => d.coords)
  );

  const searchInputRef = useRef(null);
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const hasResultsOrSummary = showResults || showSummary;

  // Global ⌘K / Ctrl+K keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch saved articles for user
  useEffect(() => {
    if (!userEmail) return;
    const fetchSaved = async () => {
      const { data, error } = await supabase
        .from("saved_articles")
        .select("article_id")
        .eq("user_email", userEmail);
      if (!error && data) {
        setSavedIds(data.map((d) => d.article_id));
      }
    };
    fetchSaved();
  }, [userEmail]);

  // Toggle article bookmarking
  const toggleSave = async (articleId) => {
    if (!userEmail) {
      setShowAuthPrompt(true);
      return;
    }

    try {
      if (savedIds.includes(articleId)) {
        const { error } = await supabase
          .from("saved_articles")
          .delete()
          .eq("user_email", userEmail)
          .eq("article_id", articleId);

        if (!error) {
          setSavedIds((prev) => prev.filter((id) => id !== articleId));
        }
      } else {
        const { error } = await supabase.from("saved_articles").insert({
          user_email: userEmail,
          article_id: parseInt(articleId) || articleId,
        });

        if (!error) {
          setSavedIds((prev) => [...prev, articleId]);
        }
      }
    } catch (error) {
      console.error("Error in toggleSave:", error);
    }
  };

  // Semantic & keyword search
  const handleSearch = async (searchQuery) => {
    setOpen(false);
    try {
      const apiUrl = `${getApiUrl('/ai-search')}?q=${encodeURIComponent(searchQuery)}`;
      const response = await fetchWithRetry(apiUrl);
      const data = await response.json();

      let results = data.results || [];

      if (results.length === 0) {
        try {
          const fallbackUrl = `${getApiUrl('/search')}?q=${encodeURIComponent(searchQuery)}`;
          const fbResponse = await fetch(fallbackUrl);
          const fbData = await fbResponse.json();
          if (fbData.results && fbData.results.length > 0) {
            results = fbData.results;
          }
        } catch (fbErr) {
          console.warn("Fallback keyword search failed:", fbErr);
        }
      }

      setSearchResults(results);
      setShowResults(true);
      setShowSummary(false);
      setResultsSummary(null);
      return results;
    } catch (error) {
      console.error("Search error:", error);
      try {
        const fallbackUrl = `${getApiUrl('/search')}?q=${encodeURIComponent(searchQuery)}`;
        const fbResponse = await fetch(fallbackUrl);
        const fbData = await fbResponse.json();
        if (fbData.results && fbData.results.length > 0) {
          setSearchResults(fbData.results);
          setShowResults(true);
          setShowSummary(false);
          setResultsSummary(null);
          return fbData.results;
        }
      } catch (fbErr) {
        console.warn("Fallback failed:", fbErr);
      }
      setSearchResults([]);
      return [];
    }
  };

  const onSearchQuery = async () => {
    if (!userSearchInput.trim()) return;

    setLoading(true);
    setShowSuggestions(false);

    try {
      await handleSearch(userSearchInput);

      if (user) {
        const libId = uuid();
        await supabase.from("Library").insert([
          {
            searchInput: userSearchInput,
            userEmail: user?.primaryEmailAddress?.emailAddress,
            type: "semantic",
            libId: libId,
          },
        ]);
      }
    } catch (error) {
      console.error("Search execution error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = async (suggestionText) => {
    setUserSearchInput(suggestionText);
    setShowSuggestions(false);
    setLoading(true);

    try {
      await handleSearch(suggestionText);

      if (user) {
        const libId = uuid();
        await supabase.from("Library").insert([
          {
            searchInput: suggestionText,
            userEmail: user?.primaryEmailAddress?.emailAddress,
            type: "semantic",
            libId: libId,
          },
        ]);
      }
    } catch (error) {
      console.error("Suggestion search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSummarizeAllResults = async () => {
    if (!searchResults || searchResults.length === 0) return;

    if (!user) {
      setShowAuthPrompt(true);
      return;
    }

    if (showSummary) {
      setShowSummary(false);
      setResultsSummary(null);
      return;
    }

    setLoadingSummary(true);
    setShowSummary(true);

    try {
      const response = await fetchWithRetry(getApiUrl('/summarize-results'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userSearchInput,
          article_ids: searchResults.map((r) => r.id),
        }),
      });

      const data = await response.json();
      setResultsSummary(data);
    } catch (error) {
      console.error("AI summarization error:", error);
      setResultsSummary({
        summary: "Architecture service is currently warming up. Please re-trigger synthesis.",
        query: userSearchInput,
        article_count: searchResults.length,
        themes: ["Distributed Systems", "Infrastructure"],
      });
    } finally {
      setLoadingSummary(false);
    }
  };

  // Shuffle polaroid card rotations & coordinates
  const shuffleDesk = () => {
    setDeskCards((prev) =>
      prev.map((card) => {
        const baseRotate = card.coords?.rotate || 0;
        const randomRotate = baseRotate + (Math.random() * 8 - 4);
        return {
          ...card,
          coords: {
            ...card.coords,
            rotate: parseFloat(randomRotate.toFixed(1)),
          },
        };
      })
    );
  };

  // Filter desk cards by category
  const filteredDeskCards = selectedCategory === "all"
    ? deskCards
    : deskCards.filter((card) => card.tag.toLowerCase().includes(selectedCategory.toLowerCase()));

  const loadingStatesSearch = [
    { text: "Scanning index of 25,000+ dispatches" },
    { text: "Ranking semantic embeddings" },
    { text: "Formatting architectural response" },
  ];

  const loadingStatesSummary = [
    { text: "Reading retrieved dispatch contents" },
    { text: "Synthesizing consensus tradeoffs" },
    { text: "Drafting executive architectural briefing" },
  ];

  return (
    <>
      <MultiStepLoader
        loadingStates={loading ? loadingStatesSearch : loadingStatesSummary}
        loading={loading || loadingSummary}
      />

      {/* Unified Apple Detail Inspection Modal */}
      <InspectionSheetModal
        article={activeModalArticle}
        isOpen={!!activeModalArticle}
        onClose={() => setActiveModalArticle(null)}
        isSaved={activeModalArticle ? savedIds.includes(activeModalArticle.id) : false}
        onToggleSave={toggleSave}
      />

      {/* Main Drafting Workspace */}
      <div className="min-h-screen w-full relative overflow-x-hidden drafting-canvas flex flex-col items-center pt-5 sm:pt-7 pb-24 px-3 sm:px-6">
        
        {/* Top Architectural Navigation Bar */}
        <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-2 mb-6 sm:mb-8 border-b border-stone-200/60 pb-3">
          {/* Brand & Wordmark */}
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-stone-900 text-stone-100 flex items-center justify-center font-mono font-bold text-xs shadow-sm border border-stone-800">
                E
              </div>
              <span className="font-serif text-lg sm:text-xl font-normal text-stone-900 tracking-tight group-hover:text-amber-900 transition-colors">
                ErBlogX
              </span>
            </a>

            {/* Pulse Indicator */}
            <div className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-stone-100/90 border border-stone-200/80 font-mono text-[10px] text-stone-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>25,482 DISPATCHES INDEXED</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={shuffleDesk}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-200/80 bg-white/90 hover:bg-stone-100 text-stone-700 text-xs font-mono transition-colors shadow-xs cursor-pointer"
              title="Shuffle desk polaroids"
            >
              <Shuffle size={12} className="text-stone-500" />
              <span className="hidden xs:inline">Shuffle</span>
            </button>
          </div>
        </header>

        {/* Central Omnibar Container */}
        <div className={`w-full max-w-xl transition-all duration-300 z-30 ${hasResultsOrSummary ? 'mb-6' : 'my-auto'}`}>
          <div className="relative">
            {/* Apple Glassmorphism Omnibar */}
            <div className="relative flex items-center w-full bg-white/90 backdrop-blur-xl border border-stone-200/90 rounded-full shadow-lg hover:shadow-xl focus-within:shadow-xl focus-within:border-stone-400 px-4 py-2.5 transition-all">
              <Search className="w-4 h-4 text-stone-400 shrink-0 mr-2.5" />
              
              <input
                ref={searchInputRef}
                type="text"
                value={userSearchInput}
                onChange={(e) => setUserSearchInput(e.target.value)}
                onFocus={() => {
                  if (!userSearchInput) setShowSuggestions(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSearchQuery();
                }}
                placeholder="Search consensus, eBPF, multi-region failover..."
                className="w-full bg-transparent text-sm sm:text-base font-sans text-stone-900 placeholder:text-stone-400 outline-none"
              />

              {userSearchInput ? (
                <button
                  onClick={() => {
                    setUserSearchInput("");
                    setShowResults(false);
                    setShowSummary(false);
                    setSearchResults([]);
                  }}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors mr-1 cursor-pointer"
                  aria-label="Clear input"
                >
                  <X size={14} />
                </button>
              ) : (
                <span className="hidden sm:inline-block font-mono text-[10px] text-stone-400 px-1.5 py-0.5 rounded border border-stone-200 bg-stone-50/80 select-none mr-1">
                  ⌘K
                </span>
              )}

              <button
                onClick={onSearchQuery}
                disabled={!userSearchInput.trim() || loading}
                className="w-8 h-8 rounded-full bg-stone-900 hover:bg-stone-800 disabled:opacity-30 disabled:hover:bg-stone-900 text-stone-50 flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-sm"
                aria-label="Submit search"
              >
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Editorial Suggestions Tray */}
            {showSuggestions && !userSearchInput && (
              <div 
                className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-stone-200 rounded-2xl shadow-xl p-3 z-40"
                onMouseDown={(e) => e.preventDefault()}
              >
                <div className="font-mono text-[10px] uppercase tracking-wider text-stone-400 font-semibold px-2 py-1 mb-1">
                  Editorial Architecture Inquiries
                </div>
                <div className="space-y-1">
                  {EDITORIAL_SUGGESTIONS.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSuggestionClick(item.text)}
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-stone-100/80 transition-colors cursor-pointer text-xs font-sans text-stone-800 group"
                    >
                      <span className="group-hover:text-amber-900 transition-colors">{item.text}</span>
                      <span className="font-mono text-[10px] text-amber-800/80 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50">
                        #{item.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Washi Chips Categories */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-3.5 overflow-x-auto pb-1 no-scrollbar justify-center flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  if (cat.id !== "all") {
                    setUserSearchInput(cat.id);
                    handleSearch(cat.id);
                  } else {
                    setUserSearchInput("");
                    setShowResults(false);
                    setShowSummary(false);
                    setSearchResults([]);
                  }
                }}
                className={`washi-chip ${selectedCategory === cat.id ? "active" : ""}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* ─── SCENARIO A: Idle Desk with Interactive Polaroids ─── */}
        {!hasResultsOrSummary && (
          <div className="w-full max-w-6xl mx-auto flex-1 relative min-h-[460px] sm:min-h-[540px] my-4">
            
            {/* Desktop Canvas View: Spatial Draggable Cards */}
            <div className="hidden lg:block w-full h-full relative">
              {filteredDeskCards.map((card) => {
                const coords = card.coords || {};
                return (
                  <motion.div
                    key={card.id}
                    drag
                    dragConstraints={{ left: -140, right: 140, top: -140, bottom: 140 }}
                    dragElastic={0.15}
                    whileHover={{ scale: 1.04, y: -6, zIndex: 30 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveModalArticle(card)}
                    style={{
                      position: "absolute",
                      top: coords.top || "auto",
                      left: coords.left || "auto",
                      right: coords.right || "auto",
                      bottom: coords.bottom || "auto",
                      transform: `rotate(${coords.rotate || 0}deg)`,
                      width: 250,
                    }}
                    className="polaroid-card cursor-grab active:cursor-grabbing group relative select-none"
                  >
                    {/* Washi Tape */}
                    <div className="tape-top" />

                    {/* SVG Diagram Frame */}
                    <div 
                      className="w-full h-32 rounded bg-[#090E18] overflow-hidden mb-2.5 border border-stone-800 pointer-events-none"
                      dangerouslySetInnerHTML={{ __html: card.diagram }}
                    />

                    {/* Content Details */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between font-mono text-[9px] text-stone-400 uppercase tracking-wider">
                        <span className="text-amber-800 font-semibold">{card.company}</span>
                        <span>{card.readingTime}</span>
                      </div>

                      <h4 className="font-serif text-[13.5px] font-normal text-stone-900 leading-tight group-hover:text-amber-900 transition-colors line-clamp-2">
                        {card.title}
                      </h4>

                      <p className="font-serif italic text-amber-900/80 text-[11px] leading-tight pt-0.5">
                        "{card.annotation}"
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Mobile / Tablet Responsive Stack */}
            <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-4">
              {filteredDeskCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => setActiveModalArticle(card)}
                  className="bg-white/95 border border-stone-200/90 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                  <div 
                    className="w-full h-36 rounded-xl bg-[#090E18] overflow-hidden mb-3 border border-stone-800"
                    dangerouslySetInnerHTML={{ __html: card.diagram }}
                  />
                  <div className="flex items-center justify-between font-mono text-[10px] text-stone-400 uppercase tracking-wider mb-1">
                    <span className="text-amber-800 font-semibold">{card.company}</span>
                    <span>{card.readingTime}</span>
                  </div>
                  <h4 className="font-serif text-base font-normal text-stone-900 leading-snug group-hover:text-amber-900 transition-colors mb-1.5">
                    {card.title}
                  </h4>
                  <p className="font-serif italic text-xs text-amber-900/80 mb-2">
                    "{card.annotation}"
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                    <span className="font-mono text-[10px] text-stone-400">{card.level}</span>
                    <span className="font-medium text-stone-800 group-hover:text-amber-800 flex items-center gap-1">
                      Inspect &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Drafting Canvas Footer Note */}
            <div className="text-center font-mono text-[10.5px] text-stone-400 uppercase tracking-widest mt-10">
              Drafting Canvas &middot; Click any dispatch to inspect architecture
            </div>
          </div>
        )}

        {/* ─── SCENARIO B: Active Search Results Drawer ─────────── */}
        {hasResultsOrSummary && (
          <div className="w-full max-w-2xl mx-auto space-y-4">
            
            {/* AI Summarization Action Pill */}
            {searchResults.length > 0 && (
              <div className="flex items-center justify-between bg-white/80 backdrop-blur-md border border-stone-200/80 rounded-xl px-4 py-2.5">
                <span className="font-mono text-xs text-stone-600">
                  Analyze {searchResults.length} technical dispatches with AI
                </span>
                
                <button
                  onClick={handleSummarizeAllResults}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-medium transition-colors cursor-pointer"
                >
                  <Sparkles size={13} className="text-amber-400" />
                  <span>{showSummary ? "Hide Summary" : "Synthesize Summary"}</span>
                </button>
              </div>
            )}

            {/* AI Summary Prose Card */}
            {showSummary && (
              <div className="w-full bg-white/95 border border-stone-200 rounded-2xl p-5 shadow-sm space-y-3">
                {loadingSummary ? (
                  <p className="font-mono text-xs text-stone-500">Synthesizing architectural decisions across results...</p>
                ) : resultsSummary ? (
                  <>
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <h4 className="font-mono text-[11px] uppercase tracking-wider text-amber-800 font-semibold">
                        Architectural Summary
                      </h4>
                      <span className="font-mono text-[10px] text-stone-400">
                        {resultsSummary.article_count} Dispatches Analyzed
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {resultsSummary.themes?.map((theme, idx) => (
                        <span key={idx} className="bg-stone-100 text-stone-700 border border-stone-200 text-xs font-mono px-2.5 py-0.5 rounded-full">
                          {theme}
                        </span>
                      ))}
                    </div>

                    <div className="prose prose-sm max-w-none text-xs sm:text-sm text-stone-700 leading-relaxed font-sans pt-1">
                      <ReactMarkdown>{resultsSummary.summary}</ReactMarkdown>
                    </div>
                  </>
                ) : null}
              </div>
            )}

            {/* Desktop Expandable List */}
            <div className="hidden md:block w-full">
              <ExpandableCardList
                items={searchResults.map((r) => ({
                  id: r.id,
                  title: r.title,
                  subtitle: r.company,
                  content: stripHtml(r.content).slice(0, 360) + "...",
                  url: r.url,
                }))}
                savedIds={savedIds}
                onToggleSave={toggleSave}
              />
            </div>

            {/* Mobile Search Result Cards */}
            <div className="md:hidden space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="font-mono text-[10px] uppercase tracking-wider text-stone-500">
                  {searchResults.length} Dispatches Located
                </span>
                <span className="font-mono text-[10px] text-stone-400">Semantic Index</span>
              </div>

              {searchResults.map((result) => (
                <div
                  key={result.id}
                  onClick={() => setActiveModalArticle(result)}
                  className="p-4 bg-white/95 border border-stone-200/80 rounded-xl shadow-xs relative cursor-pointer group"
                >
                  <div className="pr-8">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-amber-700 font-medium block mb-1">
                      {result.company} &middot; {new Date(result.published_date || Date.now()).toLocaleDateString()}
                    </span>
                    <h4 className="font-serif text-base font-normal leading-snug text-stone-900 group-hover:text-amber-900 transition-colors mb-2">
                      {result.title}
                    </h4>
                  </div>

                  <p className="text-xs line-clamp-2 text-stone-600 font-sans mb-3">
                    {stripHtml(result.content)}
                  </p>

                  <div className="flex items-center justify-between">
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-stone-100 hover:bg-stone-900 text-stone-800 hover:text-stone-50 rounded-full text-xs font-medium border border-stone-200 transition-colors"
                    >
                      <span>Read</span>
                      <span className="text-[10px]">&rarr;</span>
                    </a>
                  </div>

                  {user && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSave(result.id);
                      }}
                      className="absolute top-3.5 right-3.5 p-1.5 rounded-full hover:bg-stone-100 transition-colors"
                    >
                      {savedIds.includes(result.id) ? (
                        <BookmarkCheck className="h-4 w-4 text-amber-700" />
                      ) : (
                        <BookmarkPlus className="h-4 w-4 text-stone-400" />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Authentication Prompt Modal */}
        {showAuthPrompt && (
          <div className="fixed inset-0 bg-stone-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <CardSpotlight className="w-full max-w-sm p-6 text-center bg-[#FAF8F5] border border-stone-200 rounded-2xl shadow-2xl relative">
              <div className="flex items-center justify-center mb-3">
                <Lock className="h-9 w-9 text-stone-800" />
              </div>
              <h3 className="font-serif text-xl font-normal text-stone-900 mb-2">
                Sign in to save articles
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm font-sans mb-5 leading-relaxed">
                Sign in to bookmark articles to your personal library and unlock AI architectural briefings.
              </p>
              <div className="flex items-center justify-center gap-3">
                <SignInButton mode="modal">
                  <Button className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-lg text-xs font-medium cursor-pointer">
                    Sign In
                  </Button>
                </SignInButton>
                <Button
                  variant="outline"
                  onClick={() => setShowAuthPrompt(false)}
                  className="px-5 py-2 border-stone-200 text-stone-700 hover:bg-stone-100 rounded-lg text-xs cursor-pointer"
                >
                  Cancel
                </Button>
              </div>
            </CardSpotlight>
          </div>
        )}
      </div>
    </>
  );
}
