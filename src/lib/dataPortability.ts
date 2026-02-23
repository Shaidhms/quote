const STORAGE_KEYS = [
  "linkedin_quotes_data",
  "linkedin_user_settings",
  "linkedin_news_queue",
  "linkedin_content_posts",
  "linkedin_content_ideas",
] as const;

interface ExportPayload {
  version: number;
  exportedAt: string;
  data: Record<string, unknown>;
}

interface ImportResult {
  success: boolean;
  error?: string;
  counts: Record<string, number>;
}

export function exportAllData(): string {
  const data: Record<string, unknown> = {};
  for (const key of STORAGE_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        data[key] = JSON.parse(raw);
      } catch {
        data[key] = raw;
      }
    }
  }
  const payload: ExportPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  };
  return JSON.stringify(payload, null, 2);
}

export function importAllData(json: string): ImportResult {
  const counts: Record<string, number> = {};
  try {
    const payload = JSON.parse(json) as ExportPayload;
    if (!payload.version || !payload.data) {
      return { success: false, error: "Invalid backup file format", counts };
    }
    for (const key of STORAGE_KEYS) {
      const value = payload.data[key];
      if (value !== undefined && value !== null) {
        // For settings, preserve existing profile_image_url (large base64)
        if (key === "linkedin_user_settings") {
          const existingRaw = localStorage.getItem(key);
          if (existingRaw) {
            try {
              const existing = JSON.parse(existingRaw);
              const incoming = value as Record<string, unknown>;
              if (existing.profile_image_url && !incoming.profile_image_url) {
                incoming.profile_image_url = existing.profile_image_url;
              }
              localStorage.setItem(key, JSON.stringify(incoming));
            } catch {
              localStorage.setItem(key, JSON.stringify(value));
            }
          } else {
            localStorage.setItem(key, JSON.stringify(value));
          }
        } else {
          localStorage.setItem(key, JSON.stringify(value));
        }
        counts[key] = Array.isArray(value) ? value.length : 1;
      }
    }
    return { success: true, counts };
  } catch {
    return { success: false, error: "Failed to parse backup file", counts };
  }
}

export interface SyncProgress {
  step: string;
  done: boolean;
  error?: string;
}

export async function syncToSupabase(
  onProgress: (p: SyncProgress) => void
): Promise<{ success: boolean; error?: string }> {
  // Dynamic import to avoid bundling supabase in non-cloud paths
  const { getSupabase } = await import("@/lib/supabase");
  const sb = getSupabase();
  if (!sb) {
    return { success: false, error: "Supabase not configured" };
  }

  // 1. Sync user settings
  onProgress({ step: "Syncing settings...", done: false });
  const settingsRaw = localStorage.getItem("linkedin_user_settings");
  if (settingsRaw) {
    try {
      const settings = JSON.parse(settingsRaw);
      const { error } = await sb.from("user_settings").upsert({
        id: settings.id && settings.id !== "1" ? settings.id : "00000000-0000-0000-0000-000000000001",
        profile_image_url: settings.profile_image_url ?? "",
        display_name: settings.display_name ?? "",
        linkedin_handle: settings.linkedin_handle ?? "",
        instagram_personal_handle: settings.instagram_personal_handle ?? "meshaid",
        instagram_ai_handle: settings.instagram_ai_handle ?? "ai360withshaid",
      });
      if (error) return { success: false, error: `Settings: ${error.message}` };
    } catch {
      // skip
    }
  }

  // 2. Sync news queue
  onProgress({ step: "Syncing news queue...", done: false });
  const newsRaw = localStorage.getItem("linkedin_news_queue");
  if (newsRaw) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const decisions = JSON.parse(newsRaw) as any[];
      if (decisions.length > 0) {
        const rows = decisions.map((d) => ({
          article_id: d.articleId,
          article: d.article,
          status: d.status,
          decided_at: d.decidedAt,
          updated_at: d.updatedAt,
        }));
        const { error } = await sb
          .from("news_queue")
          .upsert(rows, { onConflict: "article_id" });
        if (error) return { success: false, error: `News queue: ${error.message}` };
      }
    } catch {
      // skip
    }
  }

  // 3. Sync content posts
  onProgress({ step: "Syncing content posts...", done: false });
  const postsRaw = localStorage.getItem("linkedin_content_posts");
  if (postsRaw) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const posts = JSON.parse(postsRaw) as any[];
      if (posts.length > 0) {
        const rows = posts.map((p) => ({
          id: p.id,
          caption: p.caption ?? "",
          images: p.images ?? [],
          attachments: p.attachments ?? [],
          scheduled_date: p.scheduledDate ?? null,
          status: p.status ?? "draft",
          targets: p.targets ?? ["linkedin"],
          source: p.source ?? null,
          created_at: p.createdAt,
          updated_at: p.updatedAt,
        }));
        const { error } = await sb
          .from("content_posts")
          .upsert(rows, { onConflict: "id" });
        if (error) return { success: false, error: `Content posts: ${error.message}` };
      }
    } catch {
      // skip
    }
  }

  // 4. Sync content ideas
  onProgress({ step: "Syncing ideas...", done: false });
  const ideasRaw = localStorage.getItem("linkedin_content_ideas");
  if (ideasRaw) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ideas = JSON.parse(ideasRaw) as any[];
      if (ideas.length > 0) {
        const rows = ideas.map((i) => ({
          id: i.id,
          text: i.text,
          tags: i.tags ?? [],
          platform: i.platform ?? null,
          converted_to_post_id: i.convertedToPostId ?? null,
          created_at: i.createdAt,
        }));
        const { error } = await sb
          .from("content_ideas")
          .upsert(rows, { onConflict: "id" });
        if (error) return { success: false, error: `Ideas: ${error.message}` };
      }
    } catch {
      // skip
    }
  }

  onProgress({ step: "Done! All data synced to cloud.", done: true });
  return { success: true };
}

export function downloadAsFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
