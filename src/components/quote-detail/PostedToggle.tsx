"use client";

import { Quote } from "@/types";
import { CheckCircle2, Circle } from "lucide-react";
import { format, parseISO } from "date-fns";

interface PostedToggleProps {
  quote: Quote;
  onToggle: () => void;
}

export default function PostedToggle({ quote, onToggle }: PostedToggleProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">Post Status</h3>
          <p className="text-xs text-slate-500 mt-1">
            {quote.is_posted
              ? `Posted on ${format(parseISO(quote.posted_at!), "MMM dd, yyyy 'at' h:mm a")}`
              : `Scheduled for ${format(parseISO(quote.scheduled_date), "EEEE, MMM dd, yyyy")}`}
          </p>
        </div>
        <button
          onClick={onToggle}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            quote.is_posted
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
              : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
          }`}
        >
          {quote.is_posted ? (
            <>
              <CheckCircle2 className="w-4 h-4" /> Posted
            </>
          ) : (
            <>
              <Circle className="w-4 h-4" /> Mark as Posted
            </>
          )}
        </button>
      </div>
    </div>
  );
}
