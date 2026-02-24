"use client";

import { MonthlyReportData } from "@/types";
import { FileText } from "lucide-react";

interface MonthlyReportProps {
  report: MonthlyReportData;
}

const PLATFORM_ROWS: {
  key: keyof MonthlyReportData;
  label: string;
  color: string;
  dot: string;
}[] = [
  { key: "linkedin", label: "LinkedIn", color: "text-[#0A66C2]", dot: "bg-[#0A66C2]" },
  { key: "instagram_meshaid", label: "@meshaid", color: "text-pink-600", dot: "bg-pink-500" },
  { key: "instagram_ai360withshaid", label: "@ai360withshaid", color: "text-purple-600", dot: "bg-purple-500" },
];

export default function MonthlyReport({ report }: MonthlyReportProps) {
  const totalPosts =
    report.linkedin +
    report.instagram_meshaid +
    report.instagram_ai360withshaid;

  return (
    <div className="bg-gradient-to-br from-white to-indigo-50/30 rounded-2xl border border-slate-200/80 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <FileText className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            {report.month} Report
          </h3>
          <p className="text-[10px] text-slate-500">
            Monthly content summary
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Platform counts */}
        {PLATFORM_ROWS.map((row) => (
          <div key={row.key} className="bg-white rounded-xl px-4 py-3 border border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${row.dot}`} />
              <span className="text-[10px] text-slate-500">{row.label}</span>
            </div>
            <span className={`text-2xl font-bold ${row.color}`}>
              {report[row.key] as number}
            </span>
            <p className="text-[10px] text-slate-400">posts</p>
          </div>
        ))}

        {/* Total */}
        <div className="bg-white rounded-xl px-4 py-3 border border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-slate-400" />
            <span className="text-[10px] text-slate-500">Total Posts</span>
          </div>
          <span className="text-2xl font-bold text-slate-900">
            {totalPosts}
          </span>
          <p className="text-[10px] text-slate-400">this month</p>
        </div>
      </div>

      {/* Additional stats */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
        <div className="text-center">
          <span className="text-lg font-bold text-amber-600">
            {report.quotesPosted}
          </span>
          <p className="text-[10px] text-slate-500">Quotes Posted</p>
        </div>
        <div className="text-center">
          <span className="text-lg font-bold text-emerald-600">
            {report.newsPosted}
          </span>
          <p className="text-[10px] text-slate-500">News Published</p>
        </div>
        <div className="text-center">
          <span className="text-lg font-bold text-blue-600">
            {report.newsQueued}
          </span>
          <p className="text-[10px] text-slate-500">News Queued</p>
        </div>
      </div>
    </div>
  );
}
