"use client";
import React, { useState, useEffect } from "react";
import { CURATED_DISPATCHES } from "../../lib/curatedDispatches";
import ExpandableCardList from "../../components/ui/ExpandableCardList";
import { supabase } from "../../services/supabase";
import { useUser } from "@clerk/nextjs";

export default function DiscoveryPage() {
  const { user } = useUser();
  const [savedIds, setSavedIds] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const userEmail = user?.primaryEmailAddress?.emailAddress;

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
    try {
      if (savedIds.includes(articleId)) {
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
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const categories = [
    { id: "all", label: "#All" },
    { id: "Distributed", label: "#Distributed" },
    { id: "API", label: "#APIDesign" },
    { id: "Kernel", label: "#Kernel/eBPF" },
    { id: "Databases", label: "#Databases" },
    { id: "Graphics", label: "#Realtime" },
  ];

  const filteredDispatches = activeCategory === "all"
    ? CURATED_DISPATCHES
    : CURATED_DISPATCHES.filter((d) => d.tag.toLowerCase().includes(activeCategory.toLowerCase()));

  return (
    <div className="flex flex-col w-full px-4 py-8 items-center min-h-screen drafting-canvas">
      <div className="w-full max-w-2xl text-center mb-6">
        <h1 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900 tracking-tight mb-2">
          Curated Architectural Dispatches
        </h1>
        <p className="font-mono text-xs uppercase tracking-wider text-stone-500 mb-5">
          Benchmark engineering decisions from foundational technology teams
        </p>

        {/* Category Filter Chips */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`washi-chip ${activeCategory === cat.id ? "active" : ""}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full max-w-2xl">
        <ExpandableCardList
          items={filteredDispatches.map((d) => ({
            id: d.id,
            title: d.title,
            subtitle: `${d.company} · ${d.tag}`,
            content: d.summary,
            url: d.url,
            diagram: d.diagram,
            annotation: d.annotation,
            takeaways: d.takeaways,
            readingTime: d.readingTime,
            level: d.level,
            company: d.company,
            tag: d.tag,
          }))}
          savedIds={savedIds}
          onToggleSave={toggleSave}
        />
      </div>
    </div>
  );
}