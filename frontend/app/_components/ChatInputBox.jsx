"use client";
import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from 'react-markdown';
import Image from "next/image";
import {
  ArrowRight,
  BrainCircuit,
  Search,
  X,
  BookmarkPlus,
  BookmarkCheck,
  Lock,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { supabase } from "../../services/supabase";
import { useUser, SignInButton } from "@clerk/nextjs";
import { v4 as uuid } from "uuid";
import CardSpotlight from '../../components/ui/CardSpotlight';
import ExpandableCard from '../../components/ui/ExpandableCard';
import { useSidebar } from '../../components/ui/sidebar';
import ExpandableCardList from '../../components/ui/ExpandableCardList';
import MovingBorderContainer from '../../components/ui/MovingBorderContainer';
import { MultiStepLoader } from "../../components/ui/MultiStepLoader";
import { getApiUrl, fetchWithRetry } from "../../lib/config";

// Helper function to strip HTML tags
function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "");
}

function ChatInputBox() {
  const [userSearchInput, setUserSearchInput] = useState();
  const { user, isLoaded } = useUser();
  const { setOpen } = useSidebar();
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [resultsSummary, setResultsSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const expanded = !!userSearchInput;
  const hasResultsOrSummary = showResults || showSummary;
  const [savedIds, setSavedIds] = useState([]);
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  // Search suggestions
  const searchSuggestions = [
    "how Netflix scales video streaming",
    "microservices at Google",
    "AWS best practices",
    "React performance at Facebook",
    "Kubernetes at scale",
    "API design patterns",
    "database optimization techniques",
    "DevOps at startups",
    "AI engineering practices",
    "distributed systems design",
    "frontend architecture patterns",
    "monitoring and observability"
  ];

  // Loader states
  const loadingStatesSearch = [
    { text: "Analyzing query" },
    { text: "Searching database" },
    { text: "Compiling results" },
  ];
  const loadingStatesSummary = [
    { text: "Fetching articles" },
    { text: "Analyzing content" },
    { text: "Generating summary" },
  ];

  // Fetch saved articles for user on mount
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

  const toggleSave = async (articleId) => {
    if (!userEmail) {
      // Show auth prompt if user tries to save without being logged in
      setShowAuthPrompt(true);
      return;
    }
    if (savedIds.includes(articleId)) {
      // unsave
      await supabase
        .from("saved_articles")
        .delete()
        .eq("user_email", userEmail)
        .eq("article_id", articleId);
      setSavedIds((prev) => prev.filter((id) => id !== articleId));
    } else {
      await supabase.from("saved_articles").insert({
        user_email: userEmail,
        article_id: articleId,
      });
      setSavedIds((prev) => [...prev, articleId]);
    }
  };

  const handleSearch = async (searchQuery) => {
    // close sidebar if open on mobile
    setOpen(false);
    try {
      // Always use AI-powered semantic search with retry logic
      const apiUrl = `${getApiUrl('/ai-search')}?q=${encodeURIComponent(searchQuery)}`;

      const response = await fetchWithRetry(apiUrl);
      const data = await response.json();

      console.log("Search results:", data.results);

      setSearchResults(data.results || []);
      setShowResults(true);
      // Reset summary when new search is performed
      setShowSummary(false);
      setResultsSummary(null);
      return data.results;
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      
      // Show user-friendly error message
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        console.error("Backend is starting up, please try again in a moment...");
      }
      
      return [];
    }
  };

  const onSearchQuery = async () => {
    if (!userSearchInput) return;
    
    setLoading(true);
    
    try {
      await handleSearch(userSearchInput);
      
      // Only log to library if user is authenticated
      if (user) {
        const libId = uuid();
        const { data, error } = await supabase.from("Library").insert([
          {
            searchInput: userSearchInput,
            userEmail: user?.primaryEmailAddress?.emailAddress,
            type: "semantic",
            libId: libId,
          },
        ]);
      }
    } catch (error) {
      console.error("Error in search:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSummarizeAllResults = async () => {
    if (!searchResults || searchResults.length === 0) return;

    // Check authentication for summarization
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: userSearchInput,
          article_ids: searchResults.map(r => r.id)
        }),
      });
      
      const data = await response.json();
      setResultsSummary(data);
      setLoadingSummary(false);
      
    } catch (error) {
      console.error("Error getting results summary:", error);
      setLoadingSummary(false);
      
      let errorMessage = `API Error: ${error.message}`;
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        errorMessage = "Backend is starting up, please try again in a moment...";
      }
      
      setTimeout(() => {
        setResultsSummary({
          summary: errorMessage,
          query: userSearchInput,
          article_count: searchResults.length,
          themes: ["Engineering", "Technology"]
        });
        setLoadingSummary(false);
      }, 500);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSearchQuery();
    }
  };

  const handleInputFocus = () => {
    if (!userSearchInput) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleSuggestionClick = async (suggestion) => {
    setUserSearchInput(suggestion);
    setShowSuggestions(false);
    
    // Set loading and trigger search
    setLoading(true);
    try {
      await handleSearch(suggestion);
      
      // Only log to library if user is authenticated
      if (user) {
        const libId = uuid();
        const { data, error } = await supabase.from("Library").insert([
          {
            searchInput: suggestion,
            userEmail: user?.primaryEmailAddress?.emailAddress,
            type: "semantic",
            libId: libId,
          },
        ]);
      }
    } catch (error) {
      console.error("Error in suggestion search:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setUserSearchInput(e.target.value);
    if (e.target.value) {
      setShowSuggestions(false);
    }
  };

  return (
    <>
      <MultiStepLoader
        loadingStates={loading ? loadingStatesSearch : loadingStatesSummary}
        loading={loading || loadingSummary}
      />
      <div className={`flex flex-col w-full px-4 py-6 items-center ${hasResultsOrSummary ? 'pt-6' : 'min-h-screen justify-center'}`}>
        <a href="/">
          <Image 
            src="/logo.png" 
            alt="logo" 
            width={300} 
            height={250} 
            className="w-64 h-auto sm:w-72 md:w-80 lg:w-96"
          />
        </a>
        
        {/* Value Proposition - Only show when no results */}
        {!hasResultsOrSummary && (
          <div className="text-center mt-6 mb-8 max-w-xl">
            <p className="text-base sm:text-lg text-gray-600 mb-2">
              Search <span className="font-semibold text-gray-900">16,000+ engineering articles</span> from top tech companies
            </p>
            <p className="text-sm text-gray-500">
              Google • Netflix • Airbnb • Uber • Spotify • and 600+ more
            </p>
          </div>
        )}
        
        {/* Mobile-optimized search container */}
        <MovingBorderContainer className={`transition-all duration-300 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl ${expanded ? 'md:max-w-3xl' : ''}`}>
          <div className="p-2 w-full rounded-2xl -mt-2 bg-white relative">
            <div className="flex justify-between items-center gap-2">
              <div className="w-full relative flex items-center">
                <Search className="absolute left-3 text-gray-500 h-4 w-4 sm:h-5 sm:w-5" />
                <input
                  type="text"
                  placeholder="Search Engineering Blogs"
                  value={userSearchInput || ""}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  className="w-full p-3 pl-10 sm:p-4 sm:pl-12 outline-none text-sm sm:text-base"
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div className="flex gap-1 sm:gap-2 items-center">
                {searchResults.length > 0 && (
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={handleSummarizeAllResults}
                    title={user ? "Summarize all search results" : "Sign in to get AI summaries"}
                    className="h-8 w-8 sm:h-9 sm:w-9"
                  >
                    {showSummary ? <X size={16} className="sm:h-5 sm:w-5" /> : <BrainCircuit size={16} className="sm:h-5 sm:w-5" />}
                  </Button>
                )}
                <Button 
                  onClick={onSearchQuery} 
                  disabled={loading || !userSearchInput}
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9"
                >
                  <ArrowRight className='text-white' size={16} />
                </Button>
              </div>
            </div>
          </div>
        </MovingBorderContainer>

        {/* Authentication Prompt - Mobile optimized */}
        {showAuthPrompt && (
          <CardSpotlight className="w-full max-w-sm sm:max-w-md mt-4 p-4 sm:p-6 text-center mx-4">
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <Lock className="h-8 w-8 sm:h-12 sm:w-12 text-purple-500" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Sign in to save articles</h3>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
              Sign in to save articles to your library and get AI-powered summaries of your search results.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
              <SignInButton mode="modal">
                <Button className="w-full sm:w-auto px-6">Sign In</Button>
              </SignInButton>
              <Button 
                variant="outline" 
                onClick={() => setShowAuthPrompt(false)}
                className="w-full sm:w-auto px-6"
              >
                Cancel
              </Button>
            </div>
          </CardSpotlight>
        )}
        
        {/* AI Summary - Mobile optimized */}
        {showSummary && user && (
          <CardSpotlight className="w-full max-w-2xl mt-4 p-3 sm:p-4 overflow-y-auto max-h-[70vh] mx-4">
            {loadingSummary ? (
              <p className="text-sm sm:text-base">Loading AI summary of articles...</p>
            ) : resultsSummary ? (
              <>
                <div className="text-xs sm:text-sm text-gray-500 mb-3">
                  Query: <span className="font-medium">"{resultsSummary.query}"</span> • 
                  Articles analyzed: <span className="font-medium">{resultsSummary.article_count}</span>
                </div>
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  {resultsSummary.themes.map((theme, index) => (
                    <span key={index} className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                      {theme}
                    </span>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <h4 className="font-medium text-sm sm:text-base mb-2 text-gray-800">🤖 AI-Generated Summary</h4>
                  <div className="prose prose-sm max-w-none text-sm sm:text-base">
                    <ReactMarkdown>{resultsSummary.summary}</ReactMarkdown>
                  </div>
                </div>
              </>
            ) : null}
          </CardSpotlight>
        )}
        
        {/* Search Results - Mobile optimized */}
        {showResults && !showSummary && (
          <>
            {/* Mobile list - improved */}
            <div className="w-full max-w-2xl mt-4 overflow-y-auto max-h-[70vh] md:hidden px-4">
              <h3 className="font-medium mb-3 text-sm sm:text-base">
                {searchResults.length > 0 ? `Found ${searchResults.length} results` : 'No results found'}
              </h3>
              {searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map((result) => (
                    <CardSpotlight key={result.id} className="p-3 sm:p-4 relative">
                      <h4 className="font-bold text-sm sm:text-base leading-tight mb-2 pr-8">{result.title}</h4>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2">
                        {result.company} - {new Date(result.published_date).toLocaleDateString()}
                      </p>
                      <p className="text-xs sm:text-sm mt-1 line-clamp-2 text-gray-700 mb-2">
                        {stripHtml(result.content)}
                      </p>
                      <a 
                        href={result.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline text-xs sm:text-sm inline-block"
                      >
                        Read more →
                      </a>
                      {user && (
                        <button
                          onClick={() => toggleSave(result.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-purple-100 transition-colors"
                        >
                          {savedIds.includes(result.id) ? (
                            <BookmarkCheck className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                          ) : (
                            <BookmarkPlus className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                          )}
                        </button>
                      )}
                    </CardSpotlight>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm sm:text-base">Try another search query.</p>
              )}
            </div>

            {/* Desktop expandable list */}
            <div className="hidden md:block w-full mt-4 px-4">
              <ExpandableCardList
                items={searchResults.map((r)=>(
                  ({
                    id:r.id,
                    title:r.title,
                    subtitle:r.company,
                    image:r.image_url||'/logo.png',
                    content: stripHtml(r.content).slice(0,400)+ '...',
                    url:r.url
                  })
                ))}
                savedIds={user ? savedIds : []}
                onToggleSave={user ? toggleSave : () => setShowAuthPrompt(true)}
              />
            </div>
          </>
        )}

        {/* Search Suggestions - Mobile optimized */}
        {showSuggestions && !userSearchInput && (
          <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl mt-4 p-3 sm:p-4 bg-white rounded-2xl shadow-lg mx-4 z-10 border border-gray-200">
            <h4 className="font-medium text-sm sm:text-base mb-3 text-gray-800">
            💡 Try Searching For:
            </h4>
            <div className="flex flex-wrap gap-2">
              {searchSuggestions.slice(0, 8).map((suggestion, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs sm:text-sm text-gray-700 hover:bg-purple-100 hover:text-purple-700 rounded-full px-3 py-1 border border-gray-200 transition-colors"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ChatInputBox;
