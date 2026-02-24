"use client";

import { useMemo } from "react";
import {
  format,
  subDays,
  startOfWeek,
  parseISO,
  getDay,
  getHours,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  subMonths,
} from "date-fns";
import {
  ContentPost,
  Quote,
  NewsPostDecision,
  PostTarget,
  StatsResult,
  PostingGap,
  BestTimeCell,
  DayActivity,
  PlatformMonthCount,
  ContentMixEntry,
  MonthlyReportData,
} from "@/types";

const ALL_TARGETS: PostTarget[] = [
  "linkedin",
  "instagram_meshaid",
  "instagram_ai360withshaid",
];

export function useStats(
  allPosts: ContentPost[],
  allQuotes: Quote[],
  allDecisions: NewsPostDecision[]
): StatsResult {
  return useMemo(() => {
    const now = new Date();
    const today = format(now, "yyyy-MM-dd");

    // --- Today's Posts (scheduled for today, not yet fully posted) ---
    const todayPosts = allPosts.filter(
      (p) => p.scheduledDate === today && p.status !== "posted"
    );

    // --- Overdue Posts ---
    const overduePosts = allPosts.filter(
      (p) => p.scheduledDate && p.scheduledDate < today && p.status !== "posted"
    );

    // --- Posting Gap Alerts ---
    const postingGaps: PostingGap[] = ALL_TARGETS.map((target) => {
      const postedThere = allPosts
        .filter((p) => (p.postedTargets ?? []).includes(target))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      if (postedThere.length === 0) {
        return { target, daysSinceLastPost: null, lastPostedAt: null };
      }
      const lastPost = postedThere[0];
      const lastDate = parseISO(lastPost.updatedAt);
      const daysDiff = Math.floor(
        (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return {
        target,
        daysSinceLastPost: daysDiff,
        lastPostedAt: lastPost.updatedAt,
      };
    });

    // --- Queued News Count ---
    const queuedNewsCount = allDecisions.filter(
      (d) => d.status === "queued"
    ).length;

    // --- Posting Streak (consecutive days before today) ---
    let streak = 0;
    let checkDate = subDays(now, 1);
    for (let i = 0; i < 365; i++) {
      const dateStr = format(checkDate, "yyyy-MM-dd");
      const hasPost = allPosts.some(
        (p) => p.status === "posted" && p.scheduledDate === dateStr
      );
      const hasQuote = allQuotes.some(
        (q) =>
          q.is_posted && q.posted_at && q.posted_at.startsWith(dateStr)
      );
      if (hasPost || hasQuote) {
        streak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }

    // --- Weekly Activity (last 7 days) ---
    const weeklyActivity: DayActivity[] = Array.from(
      { length: 7 },
      (_, i) => {
        const date = subDays(now, 6 - i);
        const dateStr = format(date, "yyyy-MM-dd");
        const count =
          allPosts.filter((p) => p.scheduledDate === dateStr).length +
          allQuotes.filter((q) => q.scheduled_date === dateStr).length;
        return { date: dateStr, count };
      }
    );

    // --- Posts this week ---
    const weekStart = format(startOfWeek(now), "yyyy-MM-dd");
    const postsThisWeek = allPosts.filter(
      (p) => p.scheduledDate && p.scheduledDate >= weekStart
    ).length;

    // --- Quotes Posted Count ---
    const quotesPostedCount = allQuotes.filter((q) => q.is_posted).length;

    // --- Platform counts per month (last 6 months) ---
    const platformMonthCounts: PlatformMonthCount[] = Array.from(
      { length: 6 },
      (_, i) => {
        const monthDate = subMonths(now, 5 - i);
        const monthStr = format(monthDate, "yyyy-MM");
        const mStart = startOfMonth(monthDate);
        const mEnd = endOfMonth(monthDate);
        const inMonth = allPosts.filter((p) => {
          if (!p.scheduledDate) return false;
          const d = parseISO(p.scheduledDate);
          return isWithinInterval(d, { start: mStart, end: mEnd });
        });
        return {
          month: monthStr,
          linkedin: inMonth.filter((p) => p.targets.includes("linkedin"))
            .length,
          instagram_meshaid: inMonth.filter((p) =>
            p.targets.includes("instagram_meshaid")
          ).length,
          instagram_ai360withshaid: inMonth.filter((p) =>
            p.targets.includes("instagram_ai360withshaid")
          ).length,
        };
      }
    );

    // --- Content Mix ---
    const totalPosts = allPosts.length;
    const mixMap: Record<"quote" | "news" | "custom", number> = {
      quote: 0,
      news: 0,
      custom: 0,
    };
    allPosts.forEach((p) => {
      const type = p.source?.type ?? "custom";
      mixMap[type]++;
    });
    const contentMix: ContentMixEntry[] = (
      Object.keys(mixMap) as Array<"quote" | "news" | "custom">
    ).map((type) => ({
      type,
      count: mixMap[type],
      percentage:
        totalPosts > 0 ? Math.round((mixMap[type] / totalPosts) * 100) : 0,
    }));

    // --- Best Time Heatmap ---
    const postedPosts = allPosts.filter((p) => p.status === "posted");
    const cellMap: Record<string, number> = {};
    postedPosts.forEach((p) => {
      const d = parseISO(p.updatedAt);
      const key = `${getDay(d)}-${getHours(d)}`;
      cellMap[key] = (cellMap[key] ?? 0) + 1;
    });
    const bestTimeCells: BestTimeCell[] = Object.entries(cellMap).map(
      ([key, count]) => {
        const [day, hour] = key.split("-").map(Number);
        return { day, hour, count };
      }
    );

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const topCells = [...bestTimeCells]
      .sort((a, b) => b.count - a.count)
      .slice(0, 2);
    const bestTimeSummary =
      topCells.length > 0
        ? topCells
            .map((c) => {
              const ampm = c.hour >= 12 ? "pm" : "am";
              const hour12 =
                c.hour === 0 ? 12 : c.hour > 12 ? c.hour - 12 : c.hour;
              return `${dayNames[c.day]} ${hour12}${ampm}`;
            })
            .join(", ")
        : "Not enough data yet";

    // --- Queue Completion Rate ---
    const newsPosted = allDecisions.filter(
      (d) => d.status === "posted"
    ).length;
    const totalDecided = allDecisions.filter(
      (d) => d.status !== "queued"
    ).length;
    const queueCompletionRate =
      totalDecided > 0 ? newsPosted / totalDecided : 0;

    // --- Monthly Report (current month) ---
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const thisMonthPosts = allPosts.filter((p) => {
      if (!p.scheduledDate) return false;
      const d = parseISO(p.scheduledDate);
      return isWithinInterval(d, {
        start: currentMonthStart,
        end: currentMonthEnd,
      });
    });
    const thisMonthDecisions = allDecisions.filter((d) => {
      const date = parseISO(d.decidedAt);
      return isWithinInterval(date, {
        start: currentMonthStart,
        end: currentMonthEnd,
      });
    });
    const thisMonthQuotes = allQuotes.filter(
      (q) =>
        q.is_posted &&
        q.posted_at &&
        isWithinInterval(parseISO(q.posted_at), {
          start: currentMonthStart,
          end: currentMonthEnd,
        })
    );
    const monthlyReport: MonthlyReportData = {
      month: format(now, "MMMM yyyy"),
      linkedin: thisMonthPosts.filter((p) => p.targets.includes("linkedin"))
        .length,
      instagram_meshaid: thisMonthPosts.filter((p) =>
        p.targets.includes("instagram_meshaid")
      ).length,
      instagram_ai360withshaid: thisMonthPosts.filter((p) =>
        p.targets.includes("instagram_ai360withshaid")
      ).length,
      quotesPosted: thisMonthQuotes.length,
      newsPosted: thisMonthDecisions.filter((d) => d.status === "posted")
        .length,
      newsQueued: thisMonthDecisions.filter((d) => d.status === "queued")
        .length,
    };

    return {
      todayPosts,
      overduePosts,
      overdueTotalCount: overduePosts.length,
      postingGaps,
      queuedNewsCount,
      postingStreak: streak,
      weeklyActivity,
      postsThisWeek,
      quotesPostedCount,
      platformMonthCounts,
      contentMix,
      bestTimeCells,
      bestTimeSummary,
      queueCompletionRate,
      monthlyReport,
    };
  }, [allPosts, allQuotes, allDecisions]);
}
