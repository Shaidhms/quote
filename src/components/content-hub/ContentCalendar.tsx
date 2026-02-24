"use client";

import { useState } from "react";
import { ContentPost, PostTarget } from "@/types";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  addMonths,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";

interface ContentCalendarProps {
  posts: ContentPost[];
  onSelectDate: (date: string) => void;
  onSelectPost: (post: ContentPost) => void;
}

const HANDLE_SHORT: Record<PostTarget, string> = {
  linkedin: "in",
  instagram_meshaid: "@m",
  instagram_ai360withshaid: "@a",
};

function getHandleStyle(posted: boolean, status: string) {
  if (posted)
    return "bg-emerald-100 text-emerald-700 border-emerald-300";
  if (status === "scheduled")
    return "bg-blue-100 text-blue-700 border-blue-300";
  return "bg-slate-100 text-slate-500 border-slate-300";
}

export default function ContentCalendar({
  posts,
  onSelectDate,
  onSelectPost,
}: ContentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);
  const today = new Date();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDataForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const dayPosts = posts.filter((p) => p.scheduledDate === dateStr);

    const handles: { target: PostTarget; posted: boolean; status: string }[] = [];
    dayPosts.forEach((p) => {
      p.targets.forEach((t) => {
        handles.push({
          target: t,
          posted: (p.postedTargets ?? []).includes(t),
          status: p.status,
        });
      });
    });

    return { dayPosts, handles, dateStr };
  };

  return (
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
          const { dayPosts, handles, dateStr } = getDataForDate(date);
          const isToday = isSameDay(date, today);
          const hasPosts = dayPosts.length > 0;

          return (
            <div key={date.toISOString()} className="aspect-square p-0.5">
              {hasPosts ? (
                <button
                  onClick={() => onSelectPost(dayPosts[0])}
                  className={`w-full h-full rounded-xl flex flex-col items-center justify-center transition-all hover:scale-105 relative ${
                    isToday ? "ring-2 ring-indigo-400 ring-offset-1" : ""
                  } bg-slate-50 hover:bg-slate-100`}
                >
                  <span className="font-bold text-sm text-slate-800">
                    {format(date, "d")}
                  </span>
                  {/* Per-handle indicators */}
                  <div className="flex flex-wrap gap-0.5 mt-0.5 justify-center max-w-full px-0.5">
                    {handles.map((h, i) => (
                      <span
                        key={`${h.target}-${i}`}
                        className={`text-[7px] font-bold px-1 py-0 rounded border leading-relaxed ${getHandleStyle(
                          h.posted,
                          h.status
                        )}`}
                      >
                        {HANDLE_SHORT[h.target]}
                      </span>
                    ))}
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => onSelectDate(dateStr)}
                  className={`w-full h-full rounded-xl flex flex-col items-center justify-center text-sm transition-all group ${
                    isToday
                      ? "bg-indigo-50 text-indigo-800 font-bold ring-2 ring-indigo-400 ring-offset-1"
                      : "text-slate-400 hover:bg-indigo-50/50"
                  }`}
                >
                  {format(date, "d")}
                  <Plus className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
                </button>
              )}
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
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <span className="font-bold">in</span>=LinkedIn
          <span className="font-bold ml-1">@m</span>=@meshaid
          <span className="font-bold ml-1">@a</span>=@ai360
        </div>
      </div>
    </div>
  );
}
