"use client";
import React, { useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  BrainCircuit,
  Paperclip,
  Podcast,
  Search,
  X,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { supabase } from "../../services/supabase";
import { useUser } from "@clerk/nextjs";
import { v4 as uuid } from "uuid";

function ChatInputBox() {
  const [userSearchInput, setUserSearchInput] = useState();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [resultsSummary, setResultsSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const handleSearch = async (searchQuery) => {
    try {
      // Always use AI-powered semantic search
      const apiUrl = `http://localhost:8000/ai-search?q=${encodeURIComponent(searchQuery)}`;

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

    // If summary is already showing, close it
    if (showSummary) {
      setShowSummary(false);
      setResultsSummary(null);
      return;
    }

    setLoadingSummary(true);
    setShowSummary(true);
    
    try {
      // Real API call to backend
      const response = await fetch(`http://localhost:8000/summarize-results`, {
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
      
      // Fallback to mock data if API fails
      setTimeout(() => {
        setResultsSummary({
          summary: `API Error: ${error.message}. Showing fallback summary: Based on ${searchResults.length} articles found for "${userSearchInput}", this would normally contain AI-generated insights from GPT-4.1-mini analyzing all the search results.`,
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
    <div className="flex flex-col h-screen items-center justify-center w-full">
      <Image src="/logo.png" alt="logo" width={300} height={250} />
      <div className="p-2 w-full max-w-2xl border rounded-2xl -mt-2">
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
            <Button variant="ghost">
              <Paperclip />
            </Button>
            {/* Brain icon - shows only when there are search results */}
            {searchResults.length > 0 && (
              <Button 
                variant="ghost"
                onClick={handleSummarizeAllResults}
                title="Summarize all search results"
              >
                {showSummary ? (
                  <X size={18} />
                ) : (
                  <BrainCircuit size={18} />
                )}
              </Button>
            )}
            <Button onClick={onSearchQuery}>
              {!userSearchInput ? (
                <Podcast className="rounded-full color-primary" />
              ) : (
                <ArrowRight className='text-white' disabled={loading}/>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Display AI summary of all results */}
      {showSummary && (
        <div className="w-full max-w-2xl mt-4 rounded-lg border p-4 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-2 mb-3">
            <BrainCircuit size={20} className="text-blue-600" />
            <h3 className="font-semibold text-lg">AI Summary of Search Results</h3>
          </div>
          
          {loadingSummary ? (
            <div className="space-y-2">
              <p className="text-sm italic text-gray-600">Analyzing {searchResults.length} articles and generating comprehensive summary...</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
            </div>
          ) : resultsSummary ? (
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                Query: <span className="font-medium">"{resultsSummary.query}"</span> • 
                Articles analyzed: <span className="font-medium">{resultsSummary.article_count}</span>
              </div>
              
              {/* Display themes if available */}
              {resultsSummary.themes && resultsSummary.themes.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {resultsSummary.themes.map((theme, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="bg-white p-4 rounded-md border">
                <h4 className="font-medium text-sm mb-2 text-gray-700">🤖 AI-Generated Summary</h4>
                <p className="text-sm leading-relaxed">{resultsSummary.summary}</p>
              </div>
            </div>
          ) : null}
        </div>
      )}
      
      {/* Display search results */}
      {showResults && (
        <div className="w-full max-w-2xl mt-4 rounded-lg border p-4 overflow-y-auto max-h-[60vh]">
          <h3 className="font-medium mb-2">{searchResults.length > 0 ? `Found ${searchResults.length} results` : 'No results found'}</h3>
          
          {searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map((result) => (
                <div key={result.id} className="border-b pb-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold">{result.title}</h4>
                  </div>
                  
                  <p className="text-sm text-gray-600">{result.company} - {new Date(result.published_date).toLocaleDateString()}</p>
                  <p className="text-sm mt-1 line-clamp-2">{result.content?.substring(0, 150)}...</p>
                  <a 
                    href={result.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm mt-1 inline-block"
                  >
                    Read more
                  </a>
                  <p className="text-xs text-gray-500 mt-1">Similarity: {(result.similarity * 100).toFixed(1)}%</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Try another search query.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ChatInputBox;
