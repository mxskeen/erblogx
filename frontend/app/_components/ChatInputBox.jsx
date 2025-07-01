"use client";
import React, { useState } from "react";
import Image from "next/image";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  ArrowRight,
  BrainCircuit,
  FileSearch,
  Ghost,
  Paperclip,
  Podcast,
  Search,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { AiModelsOption } from "../../services/Shared";
import { supabase } from "../../services/supabase";
import { useUser } from "@clerk/nextjs";
import { v4 as uuid } from "uuid";

function ChatInputBox() {
  const [userSearchInput, setUserSearchInput] = useState();
  const { user } = useUser();
  const [searchType, setSearchType] = useState("search");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (searchQuery) => {
    try {
      // Use different endpoints based on search type
      const apiUrl = searchType === "Deep" 
        ? `http://127.0.0.1:8000/ai-search?q=${encodeURIComponent(searchQuery)}`
        : `http://127.0.0.1:8000/search?q=${encodeURIComponent(searchQuery)}`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      console.log(`Data from ${searchType === "Deep" ? "AI" : "regular"} search:`, data.results);

      setSearchResults(data.results || []);
      setShowResults(true);
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
          type: searchType,
          libId: libId,
        },
      ]);
    } catch (error) {
      console.error("Error in search:", error);
    } finally {
      setLoading(false);
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
          <Tabs defaultValue="Search" className="w-[400px]">
            <TabsContent value="Search">
              <input
                type="text"
                placeholder="Search Over Engineering Blogs"
                onChange={(e) => setUserSearchInput(e.target.value)}
                className="w-full p-4 outline-none"
                onKeyDown={handleKeyDown}
              ></input>
            </TabsContent>
            <TabsContent value="Deeper Search">
              <input
                type="text"
                placeholder="Deeper Search"
                onChange={(e) => setUserSearchInput(e.target.value)}
                className="w-full p-4 outline-none"
                onKeyDown={handleKeyDown}
              ></input>
            </TabsContent>
            <TabsList>
              <TabsTrigger
                value="Search"
                className={"text-primary"}
                onClick={() => setSearchType("Search")}
              >
                <Search />
                Search
              </TabsTrigger>
              <TabsTrigger
                value="Deeper Search"
                className={"text-primary"}
                onClick={() => setSearchType("Deep")}
              >
                <FileSearch />
                Deep Search
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex gap-2.5 items-center rounded-full color-primary">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost">
                  <BrainCircuit />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {AiModelsOption.map((model, index) => (
                  <DropdownMenuItem key={index}>
                    <div>
                      <h2 className="mb-1 text-bold">{model.name}</h2>
                      <p className="text-xs">{model.desc}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost">
              <Paperclip />
            </Button>
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
      
      {/* Display search results */}
      {showResults && (
        <div className="w-full max-w-2xl mt-4 rounded-lg border p-4 overflow-y-auto max-h-[60vh]">
          <h3 className="font-medium mb-2">{searchResults.length > 0 ? `Found ${searchResults.length} results` : 'No results found'}</h3>
          
          {searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map((result) => (
                <div key={result.id} className="border-b pb-2">
                  <h4 className="font-bold">{result.title}</h4>
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
                  {searchType === 'Deep' && (
                    <p className="text-xs text-gray-500 mt-1">Similarity: {(result.similarity * 100).toFixed(1)}%</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Try another search query or different search method.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ChatInputBox;
