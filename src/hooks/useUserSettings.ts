"use client";

import { useState, useCallback } from "react";
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

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>(() => {
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
  });

  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

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

  return { settings, updateSettings, setProfileImage };
}
