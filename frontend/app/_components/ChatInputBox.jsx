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
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { supabase } from "../../services/supabase";
import { useUser } from "@clerk/nextjs";
import { v4 as uuid } from "uuid";
import CardSpotlight from '../../components/ui/CardSpotlight';
import ExpandableCard from '../../components/ui/ExpandableCard';
import { useSidebar } from '../../components/ui/sidebar';
import ExpandableCardList from '../../components/ui/ExpandableCardList';
import MovingBorderContainer from '../../components/ui/MovingBorderContainer';
import { MultiStepLoader } from "../../components/ui/MultiStepLoader";
import { getApiUrl } from "../../lib/config";

// Helper function to strip HTML tags
function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "");
}

function ChatInputBox() {
  const [userSearchInput, setUserSearchInput] = useState();
  const { user } = useUser();
  const { setOpen } = useSidebar();
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [resultsSummary, setResultsSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const expanded = !!userSearchInput;
  const hasResultsOrSummary = showResults || showSummary;
  const [savedIds, setSavedIds] = useState([]);
  const userEmail = user?.primaryEmailAddress?.emailAddress;

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
    if (!userEmail) return;
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
      // Always use AI-powered semantic search
      const apiUrl = `${getApiUrl('/ai-search')}?q=${encodeURIComponent(searchQuery)}`;

      const response = await fetch(apiUrl);
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
      return [];
    }
  };

  const onSearchQuery = async () => {
    if (!userSearchInput) return;
    
    setLoading(true);
    
    try {
      await handleSearch(userSearchInput);
      
      const libId = uuid();
      const { data, error } = await supabase.from("Library").insert([
        {
          searchInput: userSearchInput,
          userEmail: user?.primaryEmailAddress?.emailAddress,
          type: "semantic",
          libId: libId,
        },
      ]);
    } catch (error) {
      console.error("Error in search:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSummarizeAllResults = async () => {
    if (!searchResults || searchResults.length === 0) return;

    if (showSummary) {
      setShowSummary(false);
      setResultsSummary(null);
      return;
    }

    setLoadingSummary(true);
    setShowSummary(true);
    
    try {
      const response = await fetch(getApiUrl('/summarize-results'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: userSearchInput,
          article_ids: searchResults.map(r => r.id)
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setResultsSummary(data);
      setLoadingSummary(false);
      
    } catch (error) {
      console.error("Error getting results summary:", error);
      setLoadingSummary(false);
      
      setTimeout(() => {
        setResultsSummary({
          summary: `API Error: ${error.message}. Showing fallback summary...`,
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

  return (
    <>
      <MultiStepLoader
        loadingStates={loading ? loadingStatesSearch : loadingStatesSummary}
        loading={loading || loadingSummary}
      />
      <div className={`flex flex-col w-full p-4 items-center ${hasResultsOrSummary ? 'pt-6' : 'h-screen justify-center'}`}>
        <a href="/">
          <Image src="/logo.png" alt="logo" width={300} height={250} />
        </a>
        <MovingBorderContainer className={`transition-all duration-300 ${expanded ? 'w-[40rem]' : 'w-[32rem]' }`}>
          <div className="p-2 w-full rounded-2xl -mt-2 bg-white relative">
            <div className="flex justify-between items-end">
              <div className="w-full relative flex items-center">
                <Search className="absolute left-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search Over Engineering Blogs"
                  onChange={(e) => setUserSearchInput(e.target.value)}
                  className="w-full p-4 pl-12 outline-none"
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div className="flex gap-2.5 items-center rounded-full color-primary">
                {searchResults.length > 0 && (
                  <Button 
                    variant="ghost"
                    onClick={handleSummarizeAllResults}
                    title="Summarize all search results"
                  >
                    {showSummary ? <X size={18} /> : <BrainCircuit size={18} />}
                  </Button>
                )}
                <Button onClick={onSearchQuery} disabled={loading || !userSearchInput}>
                  <ArrowRight className='text-white'/>
                </Button>
              </div>
            </div>
          </div>
        </MovingBorderContainer>
        
        {showSummary && (
          <CardSpotlight className="w-full max-w-2xl mt-4 p-4 overflow-y-auto max-h-[60vh]">
            {loadingSummary ? (
              <p>Loading AI summary of articles...</p>
            ) : resultsSummary ? (
              <>
                <div className="text-sm text-gray-500 mb-3">
                  Query: <span className="font-medium">"{resultsSummary.query}"</span> • 
                  Articles analyzed: <span className="font-medium">{resultsSummary.article_count}</span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  {resultsSummary.themes.map((theme, index) => (
                    <span key={index} className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {theme}
                    </span>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <h4 className="font-medium text-base mb-2 text-gray-800">🤖 AI-Generated Summary</h4>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{resultsSummary.summary}</ReactMarkdown>
                  </div>
                </div>
              </>
            ) : null}
          </CardSpotlight>
        )}
        
        {showResults && !showSummary && (
          <>
            {/* Mobile list */}
            <div className="w-full max-w-2xl mt-4 overflow-y-auto max-h-[60vh] md:hidden">
              <h3 className="font-medium mb-2">{searchResults.length > 0 ? `Found ${searchResults.length} results` : 'No results found'}</h3>
              {searchResults.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.map((result) => (
                    <CardSpotlight key={result.id} className="mb-2 relative">
                      <h4 className="font-bold">{result.title}</h4>
                      <p className="text-sm text-gray-600">{result.company} - {new Date(result.published_date).toLocaleDateString()}</p>
                      <p className="text-sm mt-1 line-clamp-2">{stripHtml(result.content)}</p>
                      <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm mt-1 inline-block">Read more</a>
                      <button
                        onClick={() => toggleSave(result.id)}
                        className="absolute top-2 right-2 p-1 rounded-full hover:bg-purple-100"
                      >
                        {savedIds.includes(result.id) ? (
                          <BookmarkCheck className="h-5 w-5 text-purple-600" />
                        ) : (
                          <BookmarkPlus className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                    </CardSpotlight>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Try another search query.</p>
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
                savedIds={savedIds}
                onToggleSave={toggleSave}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default ChatInputBox;
