"use client";

import { useState, useCallback, useEffect } from "react";
import {
  NewsPostDecision,
  NewsPostStatus,
  NewsQueueFilter,
  AINewsArticle,
} from "@/types";

const STORAGE_KEY = "linkedin_news_queue";

function loadFromStorage(): NewsPostDecision[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

function saveToStorage(data: NewsPostDecision[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useNewsQueue() {
  const [decisions, setDecisions] = useState<NewsPostDecision[]>(loadFromStorage);
  const [filter, setFilter] = useState<NewsQueueFilter>("all");

  // Cross-tab sync
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        setDecisions(loadFromStorage());
      }
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setDecisions(JSON.parse(e.newValue));
        } catch {
          /* ignore */
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("storage", handleStorage);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const setArticleStatus = useCallback(
    (article: AINewsArticle, status: NewsPostStatus) => {
      setDecisions((prev) => {
        const now = new Date().toISOString();
        const existing = prev.find((d) => d.articleId === article.id);
        let updated: NewsPostDecision[];
        if (existing) {
          updated = prev.map((d) =>
            d.articleId === article.id ? { ...d, status, updatedAt: now } : d
          );
        } else {
          updated = [
            ...prev,
            {
              articleId: article.id,
              article,
              status,
              decidedAt: now,
              updatedAt: now,
            },
          ];
        }
        saveToStorage(updated);
        return updated;
      });
    },
    []
  );

  const removeDecision = useCallback((articleId: string) => {
    setDecisions((prev) => {
      const updated = prev.filter((d) => d.articleId !== articleId);
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const getStatus = useCallback(
    (articleId: string): NewsPostStatus | null => {
      const found = decisions.find((d) => d.articleId === articleId);
      return found ? found.status : null;
    },
    [decisions]
  );

  const filteredDecisions = decisions.filter((d) => {
    if (filter === "all") return true;
    return d.status === filter;
  });

  const counts = {
    all: decisions.length,
    queued: decisions.filter((d) => d.status === "queued").length,
    posted: decisions.filter((d) => d.status === "posted").length,
    declined: decisions.filter((d) => d.status === "declined").length,
  };

  return {
    decisions: filteredDecisions,
    allDecisions: decisions,
    filter,
    setFilter,
    setArticleStatus,
    removeDecision,
    getStatus,
    counts,
  };
}
