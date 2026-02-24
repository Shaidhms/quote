"use client";

import { useQuotes } from "@/hooks/useQuotes";
import { useContentPosts } from "@/hooks/useContentPosts";
import CalendarView from "@/components/calendar/CalendarView";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Loader2 } from "lucide-react";

export default function CalendarPage() {
  const { allQuotes, loading } = useQuotes();
  const { allPosts } = useContentPosts();

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

      <main className="max-w-2xl mx-auto px-4 py-6">
        <CalendarView quotes={allQuotes} posts={allPosts} />
      </main>
    </div>
  );
}
