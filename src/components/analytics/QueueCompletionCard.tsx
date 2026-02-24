"use client";

import { CheckCircle2, Clock, XCircle } from "lucide-react";

interface QueueCompletionCardProps {
  rate: number;
  posted: number;
  queued: number;
  declined: number;
}

export default function QueueCompletionCard({
  rate,
  posted,
  queued,
  declined,
}: QueueCompletionCardProps) {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - rate * circumference;
  const percentage = Math.round(rate * 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
      <h3 className="text-xs font-semibold text-slate-700 mb-4 text-center">
        Queue Completion
      </h3>
      <div className="flex justify-center mb-4">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24" viewBox="0 0 96 96">
            <circle
              r="36"
              cx="48"
              cy="48"
              stroke="#f1f5f9"
              strokeWidth="8"
              fill="none"
            />
            <circle
              r="36"
              cx="48"
              cy="48"
              stroke="#10b981"
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 48 48)"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-slate-900">
              {percentage}%
            </span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center px-2 py-1.5 rounded-lg bg-emerald-50">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 mx-auto" />
          <span className="text-sm font-bold text-emerald-700">{posted}</span>
          <p className="text-[9px] text-emerald-600">Posted</p>
        </div>
        <div className="text-center px-2 py-1.5 rounded-lg bg-amber-50">
          <Clock className="w-3 h-3 text-amber-600 mx-auto" />
          <span className="text-sm font-bold text-amber-700">{queued}</span>
          <p className="text-[9px] text-amber-600">Queued</p>
        </div>
        <div className="text-center px-2 py-1.5 rounded-lg bg-slate-50">
          <XCircle className="w-3 h-3 text-slate-500 mx-auto" />
          <span className="text-sm font-bold text-slate-600">{declined}</span>
          <p className="text-[9px] text-slate-500">Declined</p>
        </div>
      </div>
    </div>
  );
}
