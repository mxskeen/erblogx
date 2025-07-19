"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";
import CardSpotlight from "../../components/ui/CardSpotlight";
import ExpandableCardList from "../../components/ui/ExpandableCardList";
import { BrainCircuit } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { MultiStepLoader } from "../../components/ui/MultiStepLoader";
import { getApiUrl } from "../../lib/config";

// Helper function to strip HTML tags
function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "");
}

export default function LibraryPage() {
  const { user } = useUser();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const loadingStatesSummary = [
    { text: "Fetching articles" },
    { text: "Analyzing content" },
    { text: "Generating summary" },
  ];

  useEffect(() => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    const fetchSavedArticles = async () => {
      try {
        const { data, error } = await supabase
          .from("saved_articles")
          .select(`
            article_id,
            articles (
              id,
              title,
              company,
              published_date,
              content,
              url,
              image_url
            )
          `)
          .eq("user_email", user.primaryEmailAddress.emailAddress);

        if (error) throw error;
        setArticles(data?.map((item) => item.articles).filter(Boolean) || []);
      } catch (error) {
        console.error("Error fetching saved articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedArticles();
  }, [user]);

  const summarizeLibrary = async () => {
    if (articles.length === 0) return;
    if (summary) {
      setSummary(null);
      return;
    }
    setLoadingSummary(true);
    const response = await fetch(getApiUrl('/summarize-results'), {
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
      <div className="flex flex-col w-full px-4 py-6 items-center min-h-screen">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">My Library</h2>
          {articles.length > 0 && (
            <button
              onClick={summarizeLibrary}
              className="p-2 rounded-full hover:bg-purple-100 transition-colors"
              title="Summarize saved articles"
            >
              <BrainCircuit className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          )}
        </div>

        {/* Article count */}
        {!loading && (
          <p className="text-sm sm:text-base text-gray-600 mb-4 text-center">
            {articles.length === 0 
              ? "No saved articles yet. Start searching and save articles to build your library!" 
              : `${articles.length} saved article${articles.length > 1 ? 's' : ''}`
            }
          </p>
        )}

        {/* Loading state */}
        {loading && (
          <div className="w-full max-w-2xl">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Summary */}
        {summary && (
          <CardSpotlight className="w-full max-w-2xl mb-6 p-3 sm:p-4">
            {loadingSummary ? (
              <p className="text-sm sm:text-base">Generating summary...</p>
            ) : (
              <div>
                <h4 className="font-medium text-sm sm:text-base mb-2 text-gray-800">🤖 Library Summary</h4>
                <div className="prose prose-sm max-w-none text-sm sm:text-base">
                  <ReactMarkdown>{summary.summary}</ReactMarkdown>
                </div>
              </div>
            )}
          </CardSpotlight>
        )}

        {/* Desktop view */}
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

        {/* Mobile view - improved */}
        <div className="md:hidden w-full max-w-2xl space-y-3">
          {articles.map((a) => (
            <CardSpotlight key={a.id} className="p-3 sm:p-4">
              <h4 className="font-bold text-sm sm:text-base leading-tight mb-2">{a.title}</h4>
              <p className="text-xs sm:text-sm text-gray-600 mb-2">
                {a.company} - {new Date(a.published_date).toLocaleDateString()}
              </p>
              <p className="text-xs sm:text-sm mt-1 line-clamp-2 text-gray-700 mb-2">
                {stripHtml(a.content)}
              </p>
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-xs sm:text-sm inline-block"
              >
                Read more →
              </a>
            </CardSpotlight>
          ))}
        </div>
      </div>
    </>
  );
} 