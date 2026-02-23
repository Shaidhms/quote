"use client";

import { useState, useCallback, useEffect } from "react";
import { getSupabase } from "@/lib/supabase";
import { UserSettings } from "@/types";

const SETTINGS_KEY = "linkedin_user_settings";

const defaultSettings: UserSettings = {
  id: "1",
  profile_image_url: "",
  display_name: "",
  linkedin_handle: "",
  instagram_personal_handle: "meshaid",
  instagram_ai_handle: "ai360withshaid",
};

function loadFromStorage(): UserSettings {
  if (typeof window === "undefined") return defaultSettings;
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
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
