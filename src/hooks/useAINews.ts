"use client";

import { useState, useCallback } from "react";
import { AINewsArticle, FetchAINewsResponse } from "@/types";

export function useAINews() {
  const [articles, setArticles] = useState<AINewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] =
    useState<AINewsArticle | null>(null);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/fetch-ai-news");
      const data: FetchAINewsResponse = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Failed to load news");
      } else {
        setArticles(data.articles);
        setFetchedAt(data.fetchedAt);
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    articles,
    loading,
    error,
    fetchedAt,
    selectedArticle,
    setSelectedArticle,
    fetchNews,
  };
}
