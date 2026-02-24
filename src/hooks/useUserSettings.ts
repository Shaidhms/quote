"use client";

import { useState, useCallback, useEffect } from "react";
import { getSupabase } from "@/lib/supabase";
import { UserSettings } from "@/types";

const SETTINGS_KEY = "linkedin_user_settings";

// Fixed UUID for the single-user settings row
const SETTINGS_UUID = "00000000-0000-0000-0000-000000000001";

const defaultSettings: UserSettings = {
  id: SETTINGS_UUID,
  profile_image_url: "",
  display_name: "",
  linkedin_handle: "",
  instagram_personal_handle: "meshaid",
  instagram_ai_handle: "ai360withshaid",
  brand_colors: ["#2563eb", "#10b981"],
  brand_font: "Inter",
  watermark_image_url: "",
  watermark_position: "bottom-right",
  watermark_opacity: 0.7,
};

function loadFromStorage(): UserSettings {
  if (typeof window === "undefined") return defaultSettings;
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Migrate old id "1" to proper UUID
      if (parsed.id === "1") parsed.id = SETTINGS_UUID;
      return parsed;
    } catch {
      return defaultSettings;
    }
  }
  return defaultSettings;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(row: any): UserSettings {
  return {
    id: row.id,
    profile_image_url: row.profile_image_url ?? "",
    display_name: row.display_name ?? "",
    linkedin_handle: row.linkedin_handle ?? "",
    instagram_personal_handle: row.instagram_personal_handle ?? "meshaid",
    instagram_ai_handle: row.instagram_ai_handle ?? "ai360withshaid",
    brand_colors: row.brand_colors ?? ["#2563eb", "#10b981"],
    brand_font: row.brand_font ?? "Inter",
    watermark_image_url: row.watermark_image_url ?? "",
    watermark_position: row.watermark_position ?? "bottom-right",
    watermark_opacity: row.watermark_opacity ?? 0.7,
  };
}

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [useSupabase, setUseSupabase] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const sb = getSupabase();
      if (sb) {
        try {
          const { data, error } = await sb
            .from("user_settings")
            .select("*")
            .limit(1)
            .single();

          if (!error && data) {
            setSettings(fromRow(data));
            setUseSupabase(true);
            setLoading(false);
            return;
          }
        } catch {
          // fall through to localStorage
        }
      }
      setSettings(loadFromStorage());
      setLoading(false);
    }
    init();
  }, []);

  const updateSettings = useCallback(
    async (updates: Partial<UserSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...updates };
        if (!useSupabase) {
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
        }
        return next;
      });

      if (useSupabase) {
        const sb = getSupabase();
        if (sb) {
          await sb
            .from("user_settings")
            .update(updates)
            .eq("id", settings.id);
        }
      }
    },
    [useSupabase, settings.id]
  );

  const setProfileImage = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSettings({ profile_image_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    },
    [updateSettings]
  );

  return { settings, updateSettings, setProfileImage, loading };
}
