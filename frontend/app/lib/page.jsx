"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "../../services/supabase";
import ExpandableCardList from "../../components/ui/ExpandableCardList";
import { BrainCircuit } from "lucide-react";
import CardSpotlight from "../../components/ui/CardSpotlight";
import ReactMarkdown from "react-markdown";
import { MultiStepLoader } from "../../components/ui/MultiStepLoader";

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "");
}

export default function LibraryPage() {
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const [articles, setArticles] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const loadingStatesSummary = [
    { text: "Fetching articles" },
    { text: "Analyzing content" },
    { text: "Generating summary" },
  ];

  // Fetch saved articles
  useEffect(() => {
    if (!userEmail) return;
    const fetchSavedArticles = async () => {
      const { data: saved, error } = await supabase
        .from("saved_articles")
        .select("article_id")
        .eq("user_email", userEmail);
      if (error) return;
      const ids = saved.map((s) => s.article_id);
      if (ids.length === 0) {
        setArticles([]);
        return;
      }
      const { data: articlesData } = await supabase
        .from("articles")
        .select("*")
        .in("id", ids);
      setArticles(articlesData || []);
    };
    fetchSavedArticles();
  }, [userEmail]);

  const summarizeLibrary = async () => {
    if (articles.length === 0) return;
    if (summary) {
      setSummary(null);
      return;
    }
    setLoadingSummary(true);
    const response = await fetch("http://localhost:8000/summarize-results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "library_summary",
        article_ids: articles.map((a) => a.id),
      }),
    });
    const data = await response.json();
    setSummary(data);
    setLoadingSummary(false);
  };

  return (
    <>
      <MultiStepLoader
        loadingStates={loadingStatesSummary}
        loading={loadingSummary}
      />
      <div className="flex flex-col w-full p-4 items-center">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-2xl font-bold">Library</h2>
          {articles.length > 0 && (
            <button
              onClick={summarizeLibrary}
              className="p-2 rounded-full hover:bg-purple-100"
              title="Summarize saved articles"
            >
              <BrainCircuit className="h-6 w-6" />
            </button>
          )}
        </div>

        {summary && (
          <CardSpotlight className="w-full max-w-2xl mb-4 p-4">
            {loadingSummary ? (
              <p>Generating summary...</p>
            ) : (
              <ReactMarkdown>{summary.summary}</ReactMarkdown>
            )}
          </CardSpotlight>
        )}

        <div className="hidden md:block w-full px-4">
          <ExpandableCardList
            items={articles.map((a) => ({
              id: a.id,
              title: a.title,
              subtitle: a.company,
              image: a.image_url || "/logo.png",
              content: stripHtml(a.content).slice(0, 400) + "...",
              url: a.url,
            }))}
            savedIds={articles.map((a) => a.id)}
          />
        </div>

        {/* Mobile */}
        <div className="md:hidden w-full max-w-2xl space-y-4">
          {articles.map((a) => (
            <CardSpotlight key={a.id} className="p-4">
              <h4 className="font-bold">{a.title}</h4>
              <p className="text-sm text-gray-600">
                {a.company} - {new Date(a.published_date).toLocaleDateString()}
              </p>
              <p className="text-sm mt-1 line-clamp-2">{stripHtml(a.content)}</p>
              <a
                href={a.url}
                target="_blank"
                className="text-blue-600 hover:underline text-sm mt-1 inline-block"
              >
                Read more
              </a>
            </CardSpotlight>
          ))}
        </div>
      </div>
    </>
  );
} 