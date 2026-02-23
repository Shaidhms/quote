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
