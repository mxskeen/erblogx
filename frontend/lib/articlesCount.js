"use client";

import { useState, useEffect } from "react";
import {
  DEFAULT_ARTICLE_COUNT,
  fetchArticleCount,
  formatArticleCount,
  formatArticleCountPlus,
} from "./articlesCountCore";

export {
  DEFAULT_ARTICLE_COUNT,
  fetchArticleCount,
  formatArticleCount,
  formatArticleCountPlus,
};

/**
 * React hook to retrieve and automatically update live article count across components.
 */
export function useArticleCount(initialCount = DEFAULT_ARTICLE_COUNT) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    let isMounted = true;

    fetchArticleCount().then((fetchedCount) => {
      if (isMounted && typeof fetchedCount === "number") {
        setCount(fetchedCount);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    count,
    formattedCount: formatArticleCount(count),
    formattedCountPlus: formatArticleCountPlus(count),
  };
}
