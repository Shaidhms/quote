"use client";

import { BestTimeCell } from "@/types";
import { Clock } from "lucide-react";

interface BestTimeHeatmapProps {
  cells: BestTimeCell[];
  summary: string;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6am to 10pm

export default function BestTimeHeatmap({
  cells,
  summary,
}: BestTimeHeatmapProps) {
  const cellMap = new Map<string, number>();
  cells.forEach((c) => cellMap.set(`${c.day}-${c.hour}`, c.count));
  const maxCount = Math.max(...cells.map((c) => c.count), 1);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-slate-700 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-500" />
          Best Time to Post
        </h3>
        <p className="text-xs text-slate-500">
          Peak: <span className="font-semibold text-indigo-600">{summary}</span>
        </p>
      </div>

      {cells.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-xs text-slate-400">
            Mark posts as posted to see your posting patterns
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Hour labels */}
            <div className="flex">
              <div className="w-10 flex-shrink-0" />
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="flex-1 text-center text-[9px] text-slate-400 pb-1"
                >
                  {hour % 3 === 0
                    ? `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? "p" : "a"}`
                    : ""}
                </div>
              ))}
            </div>

            {/* Grid rows */}
            {DAY_LABELS.map((dayLabel, dayIndex) => (
              <div key={dayLabel} className="flex items-center gap-0.5 mb-0.5">
                <div className="w-10 flex-shrink-0 text-[10px] text-slate-500 text-right pr-2">
                  {dayLabel}
                </div>
                {HOURS.map((hour) => {
                  const count = cellMap.get(`${dayIndex}-${hour}`) ?? 0;
                  const intensity = count > 0 ? Math.max(0.15, count / maxCount) : 0;
                  return (
                    <div
                      key={hour}
                      className="flex-1 aspect-square rounded-sm min-w-[20px] max-w-[28px] transition-colors"
                      style={{
                        backgroundColor:
                          count > 0
                            ? `rgba(99, 102, 241, ${intensity})`
                            : "#f8fafc",
                      }}
                      title={
                        count > 0
                          ? `${dayLabel} ${hour > 12 ? hour - 12 : hour}${hour >= 12 ? "pm" : "am"}: ${count} post${count > 1 ? "s" : ""}`
                          : `${dayLabel} ${hour > 12 ? hour - 12 : hour}${hour >= 12 ? "pm" : "am"}: No posts`
                      }
                    />
                  );
                })}
              </div>
            ))}

            {/* Legend */}
            <div className="flex items-center justify-end gap-1.5 mt-3">
              <span className="text-[9px] text-slate-400">Less</span>
              {[0, 0.15, 0.35, 0.6, 1].map((opacity, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-sm"
                  style={{
                    backgroundColor:
                      opacity === 0
                        ? "#f8fafc"
                        : `rgba(99, 102, 241, ${opacity})`,
                  }}
                />
              ))}
              <span className="text-[9px] text-slate-400">More</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
