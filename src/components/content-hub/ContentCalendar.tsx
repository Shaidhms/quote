"use client";

import { useState } from "react";
import { ContentPost } from "@/types";
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
  ImageIcon,
} from "lucide-react";

interface ContentCalendarProps {
  posts: ContentPost[];
  onSelectDate: (date: string) => void;
  onSelectPost: (post: ContentPost) => void;
}

const STATUS_COLORS = {
  draft: { bg: "bg-slate-100", border: "border-slate-200", text: "text-slate-600", dot: "bg-slate-400" },
  scheduled: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", dot: "bg-indigo-500" },
  posted: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
};

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

  const getPostsForDate = (date: Date): ContentPost[] => {
    const dateStr = format(date, "yyyy-MM-dd");
    return posts.filter((p) => p.scheduledDate === dateStr);
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
          const datePosts = getPostsForDate(date);
          const isToday = isSameDay(date, today);
          const dateStr = format(date, "yyyy-MM-dd");
          const hasPosts = datePosts.length > 0;

          return (
            <div key={date.toISOString()} className="aspect-square p-0.5">
              {hasPosts ? (
                <button
                  onClick={() =>
                    datePosts.length === 1
                      ? onSelectPost(datePosts[0])
                      : onSelectPost(datePosts[0])
                  }
                  className={`w-full h-full rounded-xl flex flex-col items-center justify-center transition-all hover:scale-105 relative ${
                    isToday ? "ring-2 ring-indigo-400 ring-offset-1" : ""
                  } ${STATUS_COLORS[datePosts[0].status].bg} ${STATUS_COLORS[datePosts[0].status].border} border`}
                >
                  <span className={`font-bold text-sm ${STATUS_COLORS[datePosts[0].status].text}`}>
                    {format(date, "d")}
                  </span>
                  {/* Post indicators */}
                  <div className="flex gap-0.5 mt-0.5">
                    {datePosts.map((p) => (
                      <span
                        key={p.id}
                        className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[p.status].dot}`}
                      />
                    ))}
                  </div>
                  {/* Image indicator */}
                  {datePosts.some((p) => p.images.length > 0) && (
                    <ImageIcon className="w-2.5 h-2.5 text-slate-400 absolute bottom-1 right-1" />
                  )}
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
      <div className="flex gap-4 mt-4 pt-4 border-t border-slate-100 justify-center flex-wrap">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
          Draft
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          Scheduled
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          Posted
        </div>
      </div>
    </div>
  );
}
