"use client";

import { PlatformMonthCount } from "@/types";
import { format, parseISO } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface PlatformChartProps {
  monthCounts: PlatformMonthCount[];
}

export default function PlatformChart({ monthCounts }: PlatformChartProps) {
  const chartData = monthCounts.map((m) => ({
    name: format(parseISO(m.month + "-01"), "MMM"),
    LinkedIn: m.linkedin,
    "@meshaid": m.instagram_meshaid,
    "@ai360": m.instagram_ai360withshaid,
  }));

  const hasData = chartData.some(
    (d) => d.LinkedIn > 0 || d["@meshaid"] > 0 || d["@ai360"] > 0
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
      <h3 className="text-xs font-semibold text-slate-700 mb-4">
        Posts per Platform (Last 6 Months)
      </h3>
      {!hasData ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-xs text-slate-400">
            Start creating posts to see platform trends
          </p>
        </div>
      ) : (
        <div className="w-full h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  fontSize: "12px",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "11px" }}
              />
              <Bar
                dataKey="LinkedIn"
                fill="#0A66C2"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="@meshaid"
                fill="#ec4899"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="@ai360"
                fill="#9333ea"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
