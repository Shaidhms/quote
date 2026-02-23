"use client";

import { useState, useCallback, useEffect } from "react";
import { getSupabase } from "@/lib/supabase";
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(row: any): NewsPostDecision {
  return {
    articleId: row.article_id,
    article: row.article,
    status: row.status,
    decidedAt: row.decided_at,
    updatedAt: row.updated_at,
  };
}

function toRow(d: NewsPostDecision) {
  return {
    article_id: d.articleId,
    article: d.article,
    status: d.status,
    decided_at: d.decidedAt,
    updated_at: d.updatedAt,
  };
}

export function useNewsQueue() {
  const [decisions, setDecisions] = useState<NewsPostDecision[]>([]);
  const [filter, setFilter] = useState<NewsQueueFilter>("all");
  const [useSupabase, setUseSupabase] = useState(false);

  useEffect(() => {
    async function init() {
      const sb = getSupabase();
      if (sb) {
        try {
          const { data, error } = await sb
            .from("news_queue")
            .select("*")
            .order("decided_at", { ascending: false });

          if (!error && data) {
            setDecisions(data.map(fromRow));
            setUseSupabase(true);
            return;
          }
        } catch {
          // fall through to localStorage
        }
      }
      setDecisions(loadFromStorage());
    }
    init();
  }, []);

  // Cross-tab sync (localStorage only)
  useEffect(() => {
    if (useSupabase) return;
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
  }, [useSupabase]);

  const setArticleStatus = useCallback(
    async (article: AINewsArticle, status: NewsPostStatus) => {
      const now = new Date().toISOString();

      setDecisions((prev) => {
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
        if (!useSupabase) saveToStorage(updated);
        return updated;
      });

      if (useSupabase) {
        const sb = getSupabase();
        if (sb) {
          await sb.from("news_queue").upsert(
            toRow({
              articleId: article.id,
              article,
              status,
              decidedAt: now,
              updatedAt: now,
            }),
            { onConflict: "article_id" }
          );
        }
      }
    },
    [useSupabase]
  );

  const removeDecision = useCallback(
    async (articleId: string) => {
      setDecisions((prev) => {
        const updated = prev.filter((d) => d.articleId !== articleId);
        if (!useSupabase) saveToStorage(updated);
        return updated;
      });

      if (useSupabase) {
        const sb = getSupabase();
        if (sb) {
          await sb.from("news_queue").delete().eq("article_id", articleId);
        }
      }
    },
    [useSupabase]
  );

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
