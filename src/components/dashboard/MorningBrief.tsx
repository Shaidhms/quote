"use client";

import { ContentPost, Quote } from "@/types";
import { format } from "date-fns";
import Link from "next/link";
import {
  Sun,
  Calendar,
  AlertTriangle,
  Flame,
  BookOpen,
  Clock,
  CheckCircle2,
  Newspaper,
  TrendingUp,
} from "lucide-react";

interface MorningBriefProps {
  todayQuote?: Quote;
  todayPosts: ContentPost[];
  overduePosts: ContentPost[];
  queuedNewsCount: number;
  postsThisWeek: number;
  quotesPostedCount: number;
  postingStreak: number;
  totalQuotes: number;
}

const TARGET_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  instagram_meshaid: "@meshaid",
  instagram_ai360withshaid: "@ai360",
};

export default function MorningBrief({
  todayQuote,
  todayPosts,
  overduePosts,
  queuedNewsCount,
  postsThisWeek,
  quotesPostedCount,
  postingStreak,
  totalQuotes,
}: MorningBriefProps) {
  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  })();

  return (
    <div className="space-y-4">
      {/* Greeting */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Sun className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">{greeting}!</h2>
          <p className="text-xs text-slate-500">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
      </div>

      {/* Overdue Alert */}
      {overduePosts.length > 0 && (
        <Link
          href="/content-hub"
          className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors"
        >
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              {overduePosts.length} overdue post
              {overduePosts.length > 1 ? "s" : ""}
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              {overduePosts.slice(0, 2).map((p, i) => (
                <span key={p.id}>
                  {i > 0 && ", "}
                  {p.caption.slice(0, 30)}
                  {p.caption.length > 30 ? "..." : ""} ({p.scheduledDate})
                </span>
              ))}
              {overduePosts.length > 2 &&
                ` +${overduePosts.length - 2} more`}
            </p>
          </div>
        </Link>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Today's Quote */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-500/20">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-indigo-200" />
            <span className="text-xs font-medium text-indigo-200">
              Today&apos;s Quote
            </span>
          </div>
          {todayQuote ? (
            <>
              <p className="text-sm font-medium leading-relaxed line-clamp-3 mb-2">
                &ldquo;{todayQuote.quote_text}&rdquo;
              </p>
              <p className="text-xs text-indigo-200">
                — {todayQuote.author}
              </p>
              <div className="mt-3 flex items-center gap-2">
                {todayQuote.is_posted ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Posted
                  </span>
                ) : (
                  <Link
                    href={`/quote/${todayQuote.id}`}
                    className="text-[10px] font-bold bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
                  >
                    Open Quote →
                  </Link>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-indigo-200">No quote scheduled today</p>
          )}
        </div>

        {/* Today's Scheduled Posts */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-semibold text-slate-700">
              Today&apos;s Posts
            </span>
          </div>
          {todayPosts.length > 0 ? (
            <div className="space-y-2">
              {todayPosts.slice(0, 3).map((post) => (
                <div
                  key={post.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-slate-50"
                >
                  <Clock className="w-3 h-3 text-blue-500 flex-shrink-0" />
                  <p className="text-xs text-slate-700 truncate flex-1">
                    {post.caption.slice(0, 40) || "No caption"}
                    {post.caption.length > 40 ? "..." : ""}
                  </p>
                  <div className="flex gap-0.5">
                    {post.targets.map((t) => (
                      <span
                        key={t}
                        className="text-[8px] font-bold bg-blue-100 text-blue-700 px-1 rounded"
                      >
                        {t === "linkedin"
                          ? "in"
                          : t === "instagram_meshaid"
                          ? "@m"
                          : "@a"}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {todayPosts.length > 3 && (
                <p className="text-[10px] text-slate-400">
                  +{todayPosts.length - 3} more
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 gap-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              <p className="text-xs text-slate-500">All clear for today!</p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-semibold text-slate-700">
              Quick Stats
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center px-2 py-2.5 rounded-xl bg-orange-50">
              <div className="flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-xl font-bold text-orange-700">
                  {postingStreak}
                </span>
              </div>
              <p className="text-[10px] text-orange-600 mt-0.5">Day Streak</p>
            </div>
            <div className="text-center px-2 py-2.5 rounded-xl bg-blue-50">
              <span className="text-xl font-bold text-blue-700">
                {postsThisWeek}
              </span>
              <p className="text-[10px] text-blue-600 mt-0.5">
                Posts This Week
              </p>
            </div>
            <div className="text-center px-2 py-2.5 rounded-xl bg-indigo-50">
              <span className="text-xl font-bold text-indigo-700">
                {quotesPostedCount}/{totalQuotes}
              </span>
              <p className="text-[10px] text-indigo-600 mt-0.5">
                Quotes Posted
              </p>
            </div>
            <div className="text-center px-2 py-2.5 rounded-xl bg-amber-50">
              <div className="flex items-center justify-center gap-1">
                <Newspaper className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xl font-bold text-amber-700">
                  {queuedNewsCount}
                </span>
              </div>
              <p className="text-[10px] text-amber-600 mt-0.5">
                News Queued
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
