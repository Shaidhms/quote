"use client";

import { useState, useCallback, useEffect } from "react";
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

export function useIdeas() {
  const [ideas, setIdeas] = useState<ContentIdea[]>(loadFromStorage);
  const [searchQuery, setSearchQuery] = useState("");

  // Cross-tab sync
  useEffect(() => {
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
  }, []);

  const addIdea = useCallback(
    (text: string, tags?: string[], platform?: Platform) => {
      setIdeas((prev) => {
        const newIdea: ContentIdea = {
          id: crypto.randomUUID(),
          text,
          tags,
          platform,
          createdAt: new Date().toISOString(),
        };
        const updated = [newIdea, ...prev];
        saveToStorage(updated);
        return updated;
      });
    },
    []
  );

  const updateIdea = useCallback(
    (id: string, changes: Partial<Omit<ContentIdea, "id" | "createdAt">>) => {
      setIdeas((prev) => {
        const updated = prev.map((idea) =>
          idea.id === id ? { ...idea, ...changes } : idea
        );
        saveToStorage(updated);
        return updated;
      });
    },
    []
  );

  const deleteIdea = useCallback((id: string) => {
    setIdeas((prev) => {
      const updated = prev.filter((idea) => idea.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const markConverted = useCallback((id: string, postId: string) => {
    setIdeas((prev) => {
      const updated = prev.map((idea) =>
        idea.id === id ? { ...idea, convertedToPostId: postId } : idea
      );
      saveToStorage(updated);
      return updated;
    });
  }, []);

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
