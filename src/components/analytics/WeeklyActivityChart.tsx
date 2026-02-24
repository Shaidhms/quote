"use client";

import { DayActivity } from "@/types";
import { format, parseISO } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface WeeklyActivityChartProps {
  weeklyActivity: DayActivity[];
}

export default function WeeklyActivityChart({
  weeklyActivity,
}: WeeklyActivityChartProps) {
  const chartData = weeklyActivity.map((d) => ({
    name: format(parseISO(d.date), "EEE"),
    Posts: d.count,
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
      <h3 className="text-xs font-semibold text-slate-700 mb-4">
        Weekly Activity (Last 7 Days)
      </h3>
      <div className="w-full h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
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
            <Area
              type="monotone"
              dataKey="Posts"
              stroke="#6366f1"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPosts)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
