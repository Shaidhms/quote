"use client";

import { useState, useCallback, useEffect } from "react";
import { getSupabase } from "@/lib/supabase";
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(row: any): ContentPost {
  return {
    id: row.id,
    caption: row.caption ?? "",
    images: row.images ?? [],
    attachments: row.attachments ?? [],
    scheduledDate: row.scheduled_date ?? null,
    status: row.status ?? "draft",
    targets: row.targets ?? ["linkedin"],
    source: row.source ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(p: ContentPost) {
  return {
    id: p.id,
    caption: p.caption,
    images: p.images,
    attachments: p.attachments ?? [],
    scheduled_date: p.scheduledDate,
    status: p.status,
    targets: p.targets,
    source: p.source ?? null,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  };
}

export function useContentPosts() {
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [filter, setFilter] = useState<ContentHubFilter>("all");
  const [useSupabase, setUseSupabase] = useState(false);

  useEffect(() => {
    async function init() {
      const sb = getSupabase();
      if (sb) {
        try {
          const { data, error } = await sb
            .from("content_posts")
            .select("*")
            .order("created_at", { ascending: false });

          if (!error && data) {
            setPosts(data.map(fromRow));
            setUseSupabase(true);
            return;
          }
        } catch {
          // fall through to localStorage
        }
      }
      setPosts(loadFromStorage());
    }
    init();
  }, []);

  // Cross-tab sync (localStorage only)
  useEffect(() => {
    if (useSupabase) return;
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
  }, [useSupabase]);

  const addPost = useCallback(
    async (post: Omit<ContentPost, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      const newPost: ContentPost = {
        ...post,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };

      setPosts((prev) => {
        const updated = [newPost, ...prev];
        if (!useSupabase) saveToStorage(updated);
        return updated;
      });

      if (useSupabase) {
        const sb = getSupabase();
        if (sb) {
          await sb.from("content_posts").insert(toRow(newPost));
        }
      }
    },
    [useSupabase]
  );

  const updatePost = useCallback(
    async (id: string, changes: Partial<Omit<ContentPost, "id" | "createdAt">>) => {
      const now = new Date().toISOString();

      setPosts((prev) => {
        const updated = prev.map((p) =>
          p.id === id ? { ...p, ...changes, updatedAt: now } : p
        );
        if (!useSupabase) saveToStorage(updated);
        return updated;
      });

      if (useSupabase) {
        const sb = getSupabase();
        if (sb) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const row: any = { updated_at: now };
          if (changes.caption !== undefined) row.caption = changes.caption;
          if (changes.images !== undefined) row.images = changes.images;
          if (changes.attachments !== undefined) row.attachments = changes.attachments;
          if (changes.scheduledDate !== undefined) row.scheduled_date = changes.scheduledDate;
          if (changes.status !== undefined) row.status = changes.status;
          if (changes.targets !== undefined) row.targets = changes.targets;
          if (changes.source !== undefined) row.source = changes.source;
          await sb.from("content_posts").update(row).eq("id", id);
        }
      }
    },
    [useSupabase]
  );

  const deletePost = useCallback(
    async (id: string) => {
      setPosts((prev) => {
        const updated = prev.filter((p) => p.id !== id);
        if (!useSupabase) saveToStorage(updated);
        return updated;
      });

      if (useSupabase) {
        const sb = getSupabase();
        if (sb) {
          await sb.from("content_posts").delete().eq("id", id);
        }
      }
    },
    [useSupabase]
  );

  const updateStatus = useCallback(
    async (id: string, status: ContentPostStatus) => {
      const now = new Date().toISOString();

      setPosts((prev) => {
        const updated = prev.map((p) =>
          p.id === id ? { ...p, status, updatedAt: now } : p
        );
        if (!useSupabase) saveToStorage(updated);
        return updated;
      });

      if (useSupabase) {
        const sb = getSupabase();
        if (sb) {
          await sb
            .from("content_posts")
            .update({ status, updated_at: now })
            .eq("id", id);
        }
      }
    },
    [useSupabase]
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
