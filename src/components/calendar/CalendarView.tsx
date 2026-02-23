"use client";

import { Quote } from "@/types";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  parseISO,
  isSameDay,
  addMonths,
} from "date-fns";
import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarViewProps {
  quotes: Quote[];
}

const START_DATE = new Date("2026-02-23");

export default function CalendarView({ quotes }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(START_DATE);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  const today = new Date();

  const getQuoteForDate = (date: Date): Quote | undefined => {
    const dateStr = format(date, "yyyy-MM-dd");
    return quotes.find((q) => q.scheduled_date === dateStr);
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentMonth((m) => addMonths(m, -1))}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h2 className="text-lg font-bold text-slate-800">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <button
          onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-slate-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for padding */}
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {days.map((date) => {
          const quote = getQuoteForDate(date);
          const isToday = isSameDay(date, today);

          return (
            <div key={date.toISOString()} className="aspect-square p-0.5">
              {quote ? (
                <Link
                  href={`/quote/${quote.id}`}
                  className={`w-full h-full rounded-lg flex flex-col items-center justify-center text-xs transition-all hover:scale-105 ${
                    quote.is_posted
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      : isToday
                      ? "bg-blue-100 text-blue-700 border-2 border-blue-400"
                      : "bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100"
                  }`}
                >
                  <span className="font-bold text-sm">
                    {format(date, "d")}
                  </span>
                  <span className="text-[9px] mt-0.5 opacity-70">
                    {quote.is_posted ? "Done" : `Day ${quote.day_number}`}
                  </span>
                </Link>
              ) : (
                <div
                  className={`w-full h-full rounded-lg flex items-center justify-center text-sm ${
                    isToday
                      ? "bg-slate-100 text-slate-800 font-bold border-2 border-slate-300"
                      : "text-slate-400"
                  }`}
                >
                  {format(date, "d")}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 pt-4 border-t border-slate-100 justify-center">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200" />
          Posted
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <div className="w-3 h-3 rounded bg-blue-100 border-2 border-blue-400" />
          Today
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <div className="w-3 h-3 rounded bg-blue-50 border border-blue-100" />
          Scheduled
        </div>
      </div>
    </div>
  );
}
