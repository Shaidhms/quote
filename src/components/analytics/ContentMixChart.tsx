"use client";

import { ContentMixEntry } from "@/types";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface ContentMixChartProps {
  mix: ContentMixEntry[];
}

const COLORS: Record<string, string> = {
  quote: "#f59e0b",
  news: "#10b981",
  custom: "#6366f1",
};

const LABELS: Record<string, string> = {
  quote: "Quotes",
  news: "AI News",
  custom: "Custom",
};

export default function ContentMixChart({ mix }: ContentMixChartProps) {
  const total = mix.reduce((sum, m) => sum + m.count, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
      <h3 className="text-xs font-semibold text-slate-700 mb-4 text-center">
        Content Mix
      </h3>
      {total === 0 ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-xs text-slate-400">No posts yet</p>
        </div>
      ) : (
        <>
          <div className="w-full h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mix.filter((m) => m.count > 0)}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  innerRadius={35}
                  strokeWidth={2}
                  stroke="#fff"
                >
                  {mix
                    .filter((m) => m.count > 0)
                    .map((entry) => (
                      <Cell
                        key={entry.type}
                        fill={COLORS[entry.type]}
                      />
                    ))}
                </Pie>
                <Tooltip
                  formatter={((value: number, name: string) => [
                    `${value} posts`,
                    LABELS[name] || name,
                  ]) as never}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {mix
              .filter((m) => m.count > 0)
              .map((entry) => (
                <div key={entry.type} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[entry.type] }}
                  />
                  <span className="text-[10px] text-slate-600">
                    {LABELS[entry.type]} ({entry.percentage}%)
                  </span>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
