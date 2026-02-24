"use client";

import { PostingGap, UserSettings } from "@/types";
import { formatDistanceToNow, parseISO } from "date-fns";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

interface PostingGapAlertsProps {
  postingGaps: PostingGap[];
  settings: UserSettings;
}

const PLATFORM_ICONS: Record<string, { bg: string; icon: React.ReactNode }> = {
  linkedin: {
    bg: "bg-[#0A66C2]",
    icon: (
      <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  instagram_meshaid: {
    bg: "bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400",
    icon: (
      <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  instagram_ai360withshaid: {
    bg: "bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400",
    icon: (
      <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
};

function getPlatformName(target: string, settings: UserSettings): string {
  if (target === "linkedin") return settings.linkedin_handle ? `@${settings.linkedin_handle}` : "LinkedIn";
  if (target === "instagram_meshaid") return `@${settings.instagram_personal_handle || "meshaid"}`;
  return `@${settings.instagram_ai_handle || "ai360withshaid"}`;
}

function getSeverity(days: number | null): "ok" | "warning" | "critical" | "never" {
  if (days === null) return "never";
  if (days > 7) return "critical";
  if (days > 3) return "warning";
  return "ok";
}

const SEVERITY_STYLES = {
  ok: { border: "border-emerald-200", bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle2 },
  warning: { border: "border-amber-200", bg: "bg-amber-50", text: "text-amber-700", icon: Clock },
  critical: { border: "border-red-200", bg: "bg-red-50", text: "text-red-700", icon: AlertCircle },
  never: { border: "border-slate-200", bg: "bg-slate-50", text: "text-slate-500", icon: AlertCircle },
};

export default function PostingGapAlerts({ postingGaps, settings }: PostingGapAlertsProps) {
  const hasAlerts = postingGaps.some((g) => {
    const sev = getSeverity(g.daysSinceLastPost);
    return sev !== "ok";
  });

  if (!hasAlerts) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
      <h3 className="text-xs font-semibold text-slate-700 mb-3 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-500" />
        Posting Gap Alerts
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {postingGaps.map((gap) => {
          const severity = getSeverity(gap.daysSinceLastPost);
          const styles = SEVERITY_STYLES[severity];
          const Icon = styles.icon;
          const platformIcon = PLATFORM_ICONS[gap.target];

          return (
            <div
              key={gap.target}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${styles.border} ${styles.bg}`}
            >
              <div className={`w-7 h-7 rounded-lg ${platformIcon.bg} flex items-center justify-center flex-shrink-0`}>
                {platformIcon.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold ${styles.text}`}>
                  {getPlatformName(gap.target, settings)}
                </p>
                <p className={`text-[10px] ${styles.text} opacity-70`}>
                  {gap.daysSinceLastPost === null
                    ? "Never posted"
                    : gap.daysSinceLastPost === 0
                    ? "Posted today"
                    : `${gap.daysSinceLastPost}d ago`}
                </p>
              </div>
              <Icon className={`w-4 h-4 ${styles.text} flex-shrink-0`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
