"use client";

import { useState } from "react";
import { Quote, ContentPost, PostTarget } from "@/types";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  addMonths,
} from "date-fns";
import Link from "next/link";
import { ChevronLeft, ChevronRight, BookOpen, X } from "lucide-react";

interface CalendarViewProps {
  quotes: Quote[];
  posts: ContentPost[];
  onSelectPost?: (post: ContentPost) => void;
}

const HANDLE_CONFIG: Record<
  PostTarget,
  { label: string; short: string; icon: "linkedin" | "instagram" }
> = {
  linkedin: { label: "LinkedIn", short: "in", icon: "linkedin" },
  instagram_meshaid: { label: "@meshaid", short: "@m", icon: "instagram" },
  instagram_ai360withshaid: { label: "@ai360", short: "@a", icon: "instagram" },
};

function getHandleStyle(posted: boolean, status: string) {
  if (posted)
    return "bg-emerald-100 text-emerald-700 border-emerald-300";
  if (status === "scheduled")
    return "bg-blue-100 text-blue-700 border-blue-300";
  return "bg-slate-100 text-slate-500 border-slate-300";
}

export default function CalendarView({
  quotes,
  posts,
  onSelectPost,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);
  const today = new Date();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDataForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const dayPosts = posts.filter((p) => p.scheduledDate === dateStr);
    const dayQuote = quotes.find((q) => q.scheduled_date === dateStr);

    // Collect per-handle info from all posts on this day
    const handles: {
      target: PostTarget;
      posted: boolean;
      status: string;
      post: ContentPost;
    }[] = [];

    dayPosts.forEach((p) => {
      p.targets.forEach((t) => {
        handles.push({
          target: t,
          posted: (p.postedTargets ?? []).includes(t),
          status: p.status,
          post: p,
        });
      });
    });

    return { dayPosts, dayQuote, handles, dateStr };
  };

  const selectedData = selectedDate
    ? getDataForDate(new Date(selectedDate + "T00:00:00"))
    : null;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setCurrentMonth((m) => addMonths(m, -1))}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="text-base font-bold text-slate-800">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <button
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Week headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {days.map((date) => {
            const { handles, dayQuote, dateStr } = getDataForDate(date);
            const isToday = isSameDay(date, today);
            const hasContent = handles.length > 0 || dayQuote;
            const isSelected = selectedDate === dateStr;

            return (
              <div key={date.toISOString()} className="aspect-square p-0.5">
                <button
                  onClick={() =>
                    setSelectedDate(isSelected ? null : dateStr)
                  }
                  className={`w-full h-full rounded-xl flex flex-col items-center justify-center transition-all hover:scale-105 relative ${
                    isSelected
                      ? "ring-2 ring-indigo-500 ring-offset-1 bg-indigo-50"
                      : isToday
                      ? "ring-2 ring-indigo-400 ring-offset-1 bg-white"
                      : hasContent
                      ? "bg-slate-50 hover:bg-slate-100"
                      : "text-slate-400 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`font-bold text-sm leading-none ${
                      isToday ? "text-indigo-700" : hasContent ? "text-slate-800" : "text-slate-400"
                    }`}
                  >
                    {format(date, "d")}
                  </span>

                  {/* Handle indicators */}
                  {(handles.length > 0 || dayQuote) && (
                    <div className="flex flex-wrap gap-0.5 mt-1 justify-center max-w-full px-0.5">
                      {handles.map((h, i) => (
                        <span
                          key={`${h.target}-${i}`}
                          className={`text-[7px] font-bold px-1 py-0 rounded border leading-relaxed ${getHandleStyle(
                            h.posted,
                            h.status
                          )}`}
                        >
                          {HANDLE_CONFIG[h.target].short}
                        </span>
                      ))}
                      {dayQuote && (
                        <span
                          className={`text-[7px] font-bold px-1 py-0 rounded border leading-relaxed ${
                            dayQuote.is_posted
                              ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                              : "bg-amber-100 text-amber-700 border-amber-300"
                          }`}
                        >
                          Q
                        </span>
                      )}
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100 justify-center flex-wrap">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <span className="px-1.5 py-0.5 rounded border text-[8px] font-bold bg-emerald-100 text-emerald-700 border-emerald-300">
              in
            </span>
            Posted
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <span className="px-1.5 py-0.5 rounded border text-[8px] font-bold bg-blue-100 text-blue-700 border-blue-300">
              in
            </span>
            Scheduled
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <span className="px-1.5 py-0.5 rounded border text-[8px] font-bold bg-slate-100 text-slate-500 border-slate-300">
              in
            </span>
            Draft
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <span className="px-1.5 py-0.5 rounded border text-[8px] font-bold bg-amber-100 text-amber-700 border-amber-300">
              Q
            </span>
            Quote
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <span className="font-bold">in</span>=LinkedIn
            <span className="font-bold ml-1">@m</span>=@meshaid
            <span className="font-bold ml-1">@a</span>=@ai360
          </div>
        </div>
      </div>

      {/* Selected day detail panel */}
      {selectedData && (selectedData.handles.length > 0 || selectedData.dayQuote) && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800">
              {format(new Date(selectedDate! + "T00:00:00"), "EEEE, MMMM d")}
            </h3>
            <button
              onClick={() => setSelectedDate(null)}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="space-y-2">
            {/* Per-handle details */}
            {selectedData.handles.map((h, i) => (
              <button
                key={`${h.target}-${i}`}
                onClick={() => onSelectPost?.(h.post)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors text-left"
              >
                {/* Platform icon */}
                {h.target === "linkedin" ? (
                  <span className="w-7 h-7 rounded-lg bg-[#0A66C2] flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </span>
                ) : (
                  <span className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  </span>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800">
                    {HANDLE_CONFIG[h.target].label}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {h.post.caption.slice(0, 60) || "No caption"}
                    {h.post.caption.length > 60 ? "..." : ""}
                  </p>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                    h.posted
                      ? "bg-emerald-100 text-emerald-700"
                      : h.status === "scheduled"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {h.posted ? "Posted" : h.status === "scheduled" ? "Scheduled" : "Draft"}
                </span>
              </button>
            ))}

            {/* Quote detail */}
            {selectedData.dayQuote && (
              <Link
                href={`/quote/${selectedData.dayQuote.id}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <span className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-3.5 h-3.5 text-white" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800">
                    Quote — {selectedData.dayQuote.author}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {selectedData.dayQuote.quote_text.slice(0, 60)}...
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                    selectedData.dayQuote.is_posted
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {selectedData.dayQuote.is_posted ? "Posted" : `Day ${selectedData.dayQuote.day_number}`}
                </span>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
