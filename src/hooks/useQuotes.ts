"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabase } from "@/lib/supabase";
import { quotes as seedQuotes } from "@/data/quotes";
import { Quote, FilterType } from "@/types";
import { format } from "date-fns";

const STORAGE_KEY = "linkedin_quotes_data";

function loadFromStorage(): Quote[] {
  if (typeof window === "undefined") return seedQuotes;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return seedQuotes;
    }
  }
  return seedQuotes;
}

function saveToStorage(data: Quote[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useQuotes() {
  const [allQuotes, setAllQuotes] = useState<Quote[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [useSupabaseState, setUseSupabaseState] = useState(false);

  useEffect(() => {
    async function init() {
      const sb = getSupabase();
      if (sb) {
        try {
          const { data, error } = await sb
            .from("quotes")
            .select("*")
            .order("day_number");

          if (!error && data && data.length > 0) {
            setAllQuotes(data);
            setUseSupabaseState(true);
            setLoading(false);
            return;
          }
        } catch {
          // fall through to localStorage
        }
      }
      setAllQuotes(loadFromStorage());
      setLoading(false);
    }
    init();
  }, []);

  // Sync quotes when navigating back (picks up changes made on other pages)
  useEffect(() => {
    if (useSupabaseState) return; // Supabase handles its own sync

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        setAllQuotes(loadFromStorage());
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setAllQuotes(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("storage", handleStorage);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("storage", handleStorage);
    };
  }, [useSupabaseState]);

  const togglePosted = useCallback(
    async (id: number) => {
      setAllQuotes((prev) => {
        const updated = prev.map((q) =>
          q.id === id
            ? {
                ...q,
                is_posted: !q.is_posted,
                posted_at: !q.is_posted ? new Date().toISOString() : null,
              }
            : q
        );
        if (!useSupabaseState) saveToStorage(updated);
        return updated;
      });

      if (useSupabaseState) {
        const sb = getSupabase();
        const quote = allQuotes.find((q) => q.id === id);
        if (sb && quote) {
          await sb
            .from("quotes")
            .update({
              is_posted: !quote.is_posted,
              posted_at: !quote.is_posted ? new Date().toISOString() : null,
            })
            .eq("id", id);
        }
      }
    },
    [allQuotes, useSupabaseState]
  );

  const updateTemplate = useCallback(
    async (id: number, template: string) => {
      setAllQuotes((prev) => {
        const updated = prev.map((q) =>
          q.id === id ? { ...q, card_template: template } : q
        );
        if (!useSupabaseState) saveToStorage(updated);
        return updated;
      });

      if (useSupabaseState) {
        const sb = getSupabase();
        if (sb) {
          await sb
            .from("quotes")
            .update({ card_template: template })
            .eq("id", id);
        }
      }
    },
    [useSupabaseState]
  );

  const updateQuoteText = useCallback(
    async (id: number, newText: string, newAuthor?: string, newBook?: string) => {
      setAllQuotes((prev) => {
        const updated = prev.map((q) =>
          q.id === id
            ? {
                ...q,
                quote_text: newText,
                ...(newAuthor && { author: newAuthor }),
                ...(newBook && { book_name: newBook }),
              }
            : q
        );
        if (!useSupabaseState) saveToStorage(updated);
        return updated;
      });

      if (useSupabaseState) {
        const sb = getSupabase();
        if (sb) {
          const updates: Record<string, string> = { quote_text: newText };
          if (newAuthor) updates.author = newAuthor;
          if (newBook) updates.book_name = newBook;
          await sb.from("quotes").update(updates).eq("id", id);
        }
      }
    },
    [useSupabaseState]
  );

  const today = format(new Date(), "yyyy-MM-dd");

  const filteredQuotes = allQuotes.filter((q) => {
    switch (filter) {
      case "today":
        return q.scheduled_date === today;
      case "posted":
        return q.is_posted;
      case "not_posted":
        return !q.is_posted;
      default:
        return true;
    }
  });

  const postedCount = allQuotes.filter((q) => q.is_posted).length;
  const totalCount = allQuotes.length;
  const todayQuote = allQuotes.find((q) => q.scheduled_date === today);

  return {
    quotes: filteredQuotes,
    allQuotes,
    filter,
    setFilter,
    togglePosted,
    updateTemplate,
    updateQuoteText,
    loading,
    postedCount,
    totalCount,
    todayQuote,
  };
}
