"use client";

import { useState, useCallback, useEffect } from "react";
import {
  ContentPost,
  ContentPostStatus,
  ContentHubFilter,
  PostTarget,
} from "@/types";

const STORAGE_KEY = "linkedin_content_posts";

function loadFromStorage(): ContentPost[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parsed = JSON.parse(stored) as any[];
      // Backwards compat: migrate old platform/instagramHandle to targets[]
      return parsed.map((p) => {
        if (p.targets && p.targets.length > 0) return p as ContentPost;
        const targets: PostTarget[] = [];
        if (p.platform === "instagram") {
          if (p.instagramHandle === "ai360withshaid") {
            targets.push("instagram_ai360withshaid");
          } else {
            targets.push("instagram_meshaid");
          }
        } else {
          targets.push("linkedin");
        }
        return { ...p, targets } as ContentPost;
      });
    } catch {
      return [];
    }
  }
  return [];
}

function saveToStorage(data: ContentPost[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useContentPosts() {
  const [posts, setPosts] = useState<ContentPost[]>(loadFromStorage);
  const [filter, setFilter] = useState<ContentHubFilter>("all");

  // Cross-tab sync
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        setPosts(loadFromStorage());
      }
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setPosts(JSON.parse(e.newValue));
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

  const addPost = useCallback((post: Omit<ContentPost, "id" | "createdAt" | "updatedAt">) => {
    setPosts((prev) => {
      const now = new Date().toISOString();
      const newPost: ContentPost = {
        ...post,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      const updated = [newPost, ...prev];
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const updatePost = useCallback(
    (id: string, changes: Partial<Omit<ContentPost, "id" | "createdAt">>) => {
      setPosts((prev) => {
        const updated = prev.map((p) =>
          p.id === id
            ? { ...p, ...changes, updatedAt: new Date().toISOString() }
            : p
        );
        saveToStorage(updated);
        return updated;
      });
    },
    []
  );

  const deletePost = useCallback((id: string) => {
    setPosts((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const updateStatus = useCallback(
    (id: string, status: ContentPostStatus) => {
      setPosts((prev) => {
        const updated = prev.map((p) =>
          p.id === id
            ? { ...p, status, updatedAt: new Date().toISOString() }
            : p
        );
        saveToStorage(updated);
        return updated;
      });
    },
    []
  );

  const filteredPosts = posts.filter((p) => {
    if (filter === "all") return true;
    return p.status === filter;
  });

  const counts = {
    all: posts.length,
    draft: posts.filter((p) => p.status === "draft").length,
    scheduled: posts.filter((p) => p.status === "scheduled").length,
    posted: posts.filter((p) => p.status === "posted").length,
  };

  return {
    posts: filteredPosts,
    allPosts: posts,
    filter,
    setFilter,
    addPost,
    updatePost,
    deletePost,
    updateStatus,
    counts,
  };
}
