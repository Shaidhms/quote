"use client";

import { Quote } from "@/types";
import { BookOpen, CheckCircle2, Clock, CalendarDays } from "lucide-react";

interface StatsCardsProps {
  postedCount: number;
  totalCount: number;
  todayQuote: Quote | undefined;
}

export default function StatsCards({ postedCount, totalCount, todayQuote }: StatsCardsProps) {
  const percentage = totalCount > 0 ? Math.round((postedCount / totalCount) * 100) : 0;
  const remaining = totalCount - postedCount;

  const stats = [
    {
      label: "Total Quotes",
      value: totalCount,
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Posted",
      value: postedCount,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Remaining",
      value: remaining,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Progress",
      value: `${percentage}%`,
      icon: CalendarDays,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`${stat.bg} p-2 rounded-lg`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-700">Posting Progress</span>
          <span className="text-sm text-slate-500">
            {postedCount} / {totalCount}
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Today's quote highlight */}
      {todayQuote && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 text-white shadow-md">
          <p className="text-xs font-medium uppercase tracking-wider opacity-80 mb-2">
            Today&apos;s Quote
          </p>
          <p className="text-lg font-medium leading-relaxed mb-2">
            &ldquo;{todayQuote.quote_text}&rdquo;
          </p>
          <p className="text-sm opacity-80">
            — {todayQuote.author}, {todayQuote.book_name}
          </p>
          {todayQuote.is_posted && (
            <div className="mt-3 inline-flex items-center gap-1 bg-white/20 rounded-full px-3 py-1 text-xs">
              <CheckCircle2 className="w-3 h-3" /> Posted
            </div>
          )}
        </div>
      )}
    </div>
  );
}
