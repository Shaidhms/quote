"use client";

import { Flame, TrendingUp, BookOpen } from "lucide-react";

interface PostingStreakCardProps {
  streak: number;
  postsThisWeek: number;
  quotesPostedCount: number;
  totalQuotes: number;
}

export default function PostingStreakCard({
  streak,
  postsThisWeek,
  quotesPostedCount,
  totalQuotes,
}: PostingStreakCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 mb-3">
          <Flame className="w-8 h-8 text-white" />
        </div>
        <div className="text-4xl font-black text-slate-900">{streak}</div>
        <p className="text-sm text-slate-500 font-medium">Day Streak</p>
        <p className="text-[10px] text-slate-400 mt-1">
          {streak > 0 ? "Keep the momentum going!" : "Start posting to build your streak"}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-100">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-blue-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-lg font-bold">{postsThisWeek}</span>
          </div>
          <p className="text-[10px] text-slate-500">This Week</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-indigo-600">
            <BookOpen className="w-3.5 h-3.5" />
            <span className="text-lg font-bold">
              {quotesPostedCount}/{totalQuotes}
            </span>
          </div>
          <p className="text-[10px] text-slate-500">Quotes</p>
        </div>
      </div>
    </div>
  );
}
