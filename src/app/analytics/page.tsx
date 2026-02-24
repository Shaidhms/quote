"use client";

import { useQuotes } from "@/hooks/useQuotes";
import { useContentPosts } from "@/hooks/useContentPosts";
import { useNewsQueue } from "@/hooks/useNewsQueue";
import { useStats } from "@/hooks/useStats";
import PostingStreakCard from "@/components/analytics/PostingStreakCard";
import QueueCompletionCard from "@/components/analytics/QueueCompletionCard";
import ContentMixChart from "@/components/analytics/ContentMixChart";
import PlatformChart from "@/components/analytics/PlatformChart";
import WeeklyActivityChart from "@/components/analytics/WeeklyActivityChart";
import BestTimeHeatmap from "@/components/analytics/BestTimeHeatmap";
import MonthlyReport from "@/components/analytics/MonthlyReport";
import Link from "next/link";
import { ArrowLeft, BarChart3, Loader2 } from "lucide-react";

export default function AnalyticsPage() {
  const { allQuotes, loading, totalCount } = useQuotes();
  const { allPosts } = useContentPosts();
  const newsQueue = useNewsQueue();

  const stats = useStats(allPosts, allQuotes, newsQueue.allDecisions);

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
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Analytics</h1>
              <p className="text-xs text-slate-500">
                Your content performance at a glance
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Top row: Streak, Queue, Content Mix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PostingStreakCard
            streak={stats.postingStreak}
            postsThisWeek={stats.postsThisWeek}
            quotesPostedCount={stats.quotesPostedCount}
            totalQuotes={totalCount}
          />
          <QueueCompletionCard
            rate={stats.queueCompletionRate}
            posted={newsQueue.counts.posted}
            queued={newsQueue.counts.queued}
            declined={newsQueue.counts.declined}
          />
          <ContentMixChart mix={stats.contentMix} />
        </div>

        {/* Platform Chart */}
        <PlatformChart monthCounts={stats.platformMonthCounts} />

        {/* Weekly Activity + Best Time row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WeeklyActivityChart weeklyActivity={stats.weeklyActivity} />
          <BestTimeHeatmap
            cells={stats.bestTimeCells}
            summary={stats.bestTimeSummary}
          />
        </div>

        {/* Monthly Report */}
        <MonthlyReport report={stats.monthlyReport} />
      </main>
    </div>
  );
}
