"use client";

import { useQuotes } from "@/hooks/useQuotes";
import { useContentPosts } from "@/hooks/useContentPosts";
import CalendarView from "@/components/calendar/CalendarView";
import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft, CalendarDays, Loader2, AlertTriangle } from "lucide-react";

export default function CalendarPage() {
  const { allQuotes, loading } = useQuotes();
  const { allPosts } = useContentPosts();

  const today = new Date().toISOString().slice(0, 10);
  const overduePosts = useMemo(
    () => allPosts.filter((p) => p.status === "scheduled" && p.scheduledDate && p.scheduledDate < today),
    [allPosts, today]
  );

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
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Calendar</h1>
              <p className="text-xs text-slate-500">
                Quotes & posts per platform
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Overdue Banner */}
      {overduePosts.length > 0 && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-xs font-medium text-red-700">
              {overduePosts.length} overdue post{overduePosts.length > 1 ? "s" : ""} — scheduled date has passed without being marked as posted
            </p>
          </div>
        </div>
      )}

      <main className="max-w-2xl mx-auto px-4 py-6">
        <CalendarView quotes={allQuotes} posts={allPosts} />
      </main>
    </div>
  );
}
