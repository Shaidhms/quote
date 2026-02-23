"use client";

import { Quote, FilterType } from "@/types";
import { format, parseISO } from "date-fns";
import { CheckCircle2, Circle, ExternalLink } from "lucide-react";
import Link from "next/link";

interface QuoteListProps {
  quotes: Quote[];
  filter: FilterType;
  setFilter: (f: FilterType) => void;
  onTogglePosted: (id: number) => void;
}

const filters: { label: string; value: FilterType }[] = [
  { label: "All", value: "all" },
  { label: "Today", value: "today" },
  { label: "Posted", value: "posted" },
  { label: "Not Posted", value: "not_posted" },
];

const categoryColors: Record<string, string> = {
  Productivity: "bg-blue-100 text-blue-700",
  Mindset: "bg-purple-100 text-purple-700",
  Leadership: "bg-indigo-100 text-indigo-700",
  Entrepreneurship: "bg-amber-100 text-amber-700",
  "Self-improvement": "bg-emerald-100 text-emerald-700",
  Innovation: "bg-cyan-100 text-cyan-700",
  Relationships: "bg-rose-100 text-rose-700",
};

export default function QuoteList({
  quotes,
  filter,
  setFilter,
  onTogglePosted,
}: QuoteListProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Filter tabs */}
      <div className="flex border-b border-slate-200 px-4 pt-4 gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              filter === f.value
                ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Quote list */}
      <div className="divide-y divide-slate-100">
        {quotes.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No quotes found for this filter.
          </div>
        ) : (
          quotes.map((quote) => (
            <div
              key={quote.id}
              className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 transition-colors group"
            >
              {/* Posted toggle */}
              <button
                onClick={() => onTogglePosted(quote.id)}
                className="flex-shrink-0"
              >
                {quote.is_posted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 group-hover:text-slate-400" />
                )}
              </button>

              {/* Date */}
              <div className="flex-shrink-0 w-16 text-center">
                <div className="text-xs text-slate-400">
                  {format(parseISO(quote.scheduled_date), "MMM")}
                </div>
                <div className="text-lg font-bold text-slate-700">
                  {format(parseISO(quote.scheduled_date), "dd")}
                </div>
              </div>

              {/* Quote content */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm leading-snug truncate ${
                    quote.is_posted ? "text-slate-400 line-through" : "text-slate-800"
                  }`}
                >
                  &ldquo;{quote.quote_text}&rdquo;
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500">
                    {quote.author} — {quote.book_name}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      categoryColors[quote.category] || "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {quote.category}
                  </span>
                </div>
              </div>

              {/* Day badge */}
              <div className="flex-shrink-0 text-xs text-slate-400 font-mono">
                Day {quote.day_number}
              </div>

              {/* Open detail */}
              <Link
                href={`/quote/${quote.id}`}
                className="flex-shrink-0 p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
