"use client";

import { useState, useEffect, useCallback } from "react";
import { UserSettings } from "@/types";

const SETTINGS_KEY = "linkedin_user_settings";

const defaultSettings: UserSettings = {
  id: "1",
  profile_image_url: "",
  display_name: "",
  linkedin_handle: "",
};

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch {
        // keep defaults
      }
    }
  }, []);

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
