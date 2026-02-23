"use client";

import { useState, useCallback, useEffect } from "react";
import { getSupabase } from "@/lib/supabase";
import { ContentIdea, Platform } from "@/types";

const STORAGE_KEY = "linkedin_content_ideas";

function loadFromStorage(): ContentIdea[] {
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

function saveToStorage(data: ContentIdea[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(row: any): ContentIdea {
  return {
    id: row.id,
    text: row.text,
    tags: row.tags ?? [],
    platform: row.platform ?? undefined,
    convertedToPostId: row.converted_to_post_id ?? undefined,
    createdAt: row.created_at,
  };
}

function toRow(idea: ContentIdea) {
  return {
    id: idea.id,
    text: idea.text,
    tags: idea.tags ?? [],
    platform: idea.platform ?? null,
    converted_to_post_id: idea.convertedToPostId ?? null,
    created_at: idea.createdAt,
  };
}

export function useIdeas() {
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [useSupabase, setUseSupabase] = useState(false);

  useEffect(() => {
    async function init() {
      const sb = getSupabase();
      if (sb) {
        try {
          const { data, error } = await sb
            .from("content_ideas")
            .select("*")
            .order("created_at", { ascending: false });

          if (!error && data) {
            setIdeas(data.map(fromRow));
            setUseSupabase(true);
            return;
          }
        } catch {
          // fall through to localStorage
        }
      }
      setIdeas(loadFromStorage());
    }
    init();
  }, []);

  // Cross-tab sync (localStorage only)
  useEffect(() => {
    if (useSupabase) return;
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        setIdeas(loadFromStorage());
      }
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setIdeas(JSON.parse(e.newValue));
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

  const addIdea = useCallback(
    async (text: string, tags?: string[], platform?: Platform) => {
      const newIdea: ContentIdea = {
        id: crypto.randomUUID(),
        text,
        tags,
        platform,
        createdAt: new Date().toISOString(),
      };

      setIdeas((prev) => {
        const updated = [newIdea, ...prev];
        if (!useSupabase) saveToStorage(updated);
        return updated;
      });

      if (useSupabase) {
        const sb = getSupabase();
        if (sb) {
          await sb.from("content_ideas").insert(toRow(newIdea));
        }
      }
    },
    [useSupabase]
  );

  const updateIdea = useCallback(
    async (id: string, changes: Partial<Omit<ContentIdea, "id" | "createdAt">>) => {
      setIdeas((prev) => {
        const updated = prev.map((idea) =>
          idea.id === id ? { ...idea, ...changes } : idea
        );
        if (!useSupabase) saveToStorage(updated);
        return updated;
      });

      if (useSupabase) {
        const sb = getSupabase();
        if (sb) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const row: any = {};
          if (changes.text !== undefined) row.text = changes.text;
          if (changes.tags !== undefined) row.tags = changes.tags;
          if (changes.platform !== undefined) row.platform = changes.platform;
          if (changes.convertedToPostId !== undefined) row.converted_to_post_id = changes.convertedToPostId;
          await sb.from("content_ideas").update(row).eq("id", id);
        }
      }
    },
    [useSupabase]
  );

  const deleteIdea = useCallback(
    async (id: string) => {
      setIdeas((prev) => {
        const updated = prev.filter((idea) => idea.id !== id);
        if (!useSupabase) saveToStorage(updated);
        return updated;
      });

      if (useSupabase) {
        const sb = getSupabase();
        if (sb) {
          await sb.from("content_ideas").delete().eq("id", id);
        }
      }
    },
    [useSupabase]
  );

  const markConverted = useCallback(
    async (id: string, postId: string) => {
      setIdeas((prev) => {
        const updated = prev.map((idea) =>
          idea.id === id ? { ...idea, convertedToPostId: postId } : idea
        );
        if (!useSupabase) saveToStorage(updated);
        return updated;
      });

      if (useSupabase) {
        const sb = getSupabase();
        if (sb) {
          await sb
            .from("content_ideas")
            .update({ converted_to_post_id: postId })
            .eq("id", id);
        }
      }
    },
    [useSupabase]
  );

  const filteredIdeas = ideas.filter((idea) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      idea.text.toLowerCase().includes(q) ||
      idea.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  return {
    ideas: filteredIdeas,
    allIdeas: ideas,
    searchQuery,
    setSearchQuery,
    addIdea,
    updateIdea,
    deleteIdea,
    markConverted,
  };
}
