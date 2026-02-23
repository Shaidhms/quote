"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuotes } from "@/hooks/useQuotes";
import { useUserSettings } from "@/hooks/useUserSettings";
import StatsCards from "@/components/dashboard/StatsCards";
import QuoteList from "@/components/dashboard/QuoteList";
import ProfileSettings from "@/components/ProfileSettings";
import Link from "next/link";
import { CalendarDays, Settings, BookOpen, Loader2, Newspaper, LayoutGrid, LogOut } from "lucide-react";

export default function Dashboard() {
  const {
    quotes,
    filter,
    setFilter,
    togglePosted,
    loading,
    postedCount,
    totalCount,
    todayQuote,
  } = useQuotes();

  const { settings, updateSettings, setProfileImage } = useUserSettings();
  const [showSettings, setShowSettings] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                LinkedIn Quote Generator
              </h1>
              <p className="text-xs text-slate-500">
                60 days of book wisdom for your feed
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/ai-news"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200/60"
            >
              <Newspaper className="w-4 h-4" />
              AI News
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </Link>
            <Link
              href="/content-hub"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200/60"
            >
              <LayoutGrid className="w-4 h-4" />
              Content Hub
            </Link>
            <Link
              href="/calendar"
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <CalendarDays className="w-4 h-4" />
              Calendar
            </Link>
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              {settings.profile_image_url ? (
                <img
                  src={settings.profile_image_url}
                  alt=""
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <Settings className="w-4 h-4" />
              )}
              {settings.display_name || "Settings"}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <StatsCards
          postedCount={postedCount}
          totalCount={totalCount}
          todayQuote={todayQuote}
        />
        <QuoteList
          quotes={quotes}
          filter={filter}
          setFilter={setFilter}
          onTogglePosted={togglePosted}
        />
      </main>

      {/* Profile settings modal */}
      <ProfileSettings
        settings={settings}
        onUpdate={updateSettings}
        onSetImage={setProfileImage}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}
