"use client";

import {
  NewsPostDecision,
  NewsPostStatus,
  NewsQueueFilter,
} from "@/types";
import { formatDistanceToNow, parseISO } from "date-fns";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Inbox,
  ExternalLink,
  ArrowRight,
  ListPlus,
  Undo2,
} from "lucide-react";

interface NewsQueuePanelProps {
  decisions: NewsPostDecision[];
  filter: NewsQueueFilter;
  onSetFilter: (f: NewsQueueFilter) => void;
  counts: Record<NewsQueueFilter, number>;
  onChangeStatus: (articleId: string, status: NewsPostStatus) => void;
  onRemove: (articleId: string) => void;
  onSelectArticle: (decision: NewsPostDecision) => void;
}

const SOURCE_COLORS: Record<string, { bg: string; text: string }> = {
  "Google News": { bg: "bg-blue-50", text: "text-blue-700" },
  TechCrunch: { bg: "bg-green-50", text: "text-green-700" },
  "The Verge": { bg: "bg-purple-50", text: "text-purple-700" },
  "Ars Technica": { bg: "bg-orange-50", text: "text-orange-700" },
  "Ministry of Testing": { bg: "bg-rose-50", text: "text-rose-700" },
};

const STATUS_CONFIG: Record<
  NewsPostStatus,
  { icon: React.ElementType; label: string; bg: string; text: string; border: string }
> = {
  queued: {
    icon: Clock,
    label: "Queued",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  posted: {
    icon: CheckCircle2,
    label: "Posted",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  declined: {
    icon: XCircle,
    label: "Declined",
    bg: "bg-slate-100",
    text: "text-slate-500",
    border: "border-slate-200",
  },
};

const FILTER_TABS: { value: NewsQueueFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "queued", label: "Queued" },
  { value: "posted", label: "Posted" },
  { value: "declined", label: "Declined" },
];

export default function NewsQueuePanel({
  decisions,
  filter,
  onSetFilter,
  counts,
  onChangeStatus,
  onRemove,
  onSelectArticle,
}: NewsQueuePanelProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Filter tabs */}
      <div className="flex border-b border-slate-100 bg-slate-50/50 px-4 py-2.5 gap-1.5">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onSetFilter(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === tab.value
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab.label}
            {counts[tab.value] > 0 && (
              <span
                className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                  filter === tab.value
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {counts[tab.value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Decision list */}
      {decisions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
            <Inbox className="w-7 h-7 text-slate-300" />
          </div>
          <p className="text-sm text-slate-500">No articles in this view</p>
          <p className="text-xs text-slate-400">
            Select articles from the news feed to manage them
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50 max-h-[calc(100vh-220px)] overflow-y-auto">
          {decisions.map((decision) => {
            const statusCfg = STATUS_CONFIG[decision.status];
            const StatusIcon = statusCfg.icon;
            const sourceStyle = SOURCE_COLORS[decision.article.source] || {
              bg: "bg-slate-50",
              text: "text-slate-600",
            };

            return (
              <div key={decision.articleId} className="px-4 py-3.5 space-y-2">
                {/* Status + source + time */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${statusCfg.bg} ${statusCfg.text} border ${statusCfg.border}`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {statusCfg.label}
                  </span>
                  <span
                    className={`text-[10px] ${sourceStyle.bg} ${sourceStyle.text} px-2 py-0.5 rounded-full font-medium`}
                  >
                    {decision.article.source}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-auto">
                    {formatDistanceToNow(parseISO(decision.updatedAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>

                {/* Title */}
                <p className="text-[13px] font-semibold text-slate-800 leading-snug">
                  {decision.article.title}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {decision.status === "queued" && (
                    <>
                      <button
                        onClick={() =>
                          onChangeStatus(decision.articleId, "posted")
                        }
                        className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-medium hover:bg-emerald-700 transition-colors"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Posted
                      </button>
                      <button
                        onClick={() =>
                          onChangeStatus(decision.articleId, "declined")
                        }
                        className="flex items-center gap-1 px-2.5 py-1 bg-white text-slate-500 border border-slate-200 rounded-lg text-[11px] font-medium hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <XCircle className="w-3 h-3" /> Decline
                      </button>
                    </>
                  )}
                  {decision.status === "declined" && (
                    <button
                      onClick={() =>
                        onChangeStatus(decision.articleId, "queued")
                      }
                      className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-medium hover:bg-emerald-700 transition-colors"
                    >
                      <ListPlus className="w-3 h-3" /> Queue
                    </button>
                  )}
                  {decision.status === "posted" && (
                    <a
                      href={decision.article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1 bg-white text-slate-500 border border-slate-200 rounded-lg text-[11px] font-medium hover:bg-slate-50 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" /> View Article
                    </a>
                  )}
                  <button
                    onClick={() => onRemove(decision.articleId)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white text-slate-400 border border-slate-200 rounded-lg text-[11px] font-medium hover:bg-slate-50 hover:text-slate-600 transition-colors"
                    title="Remove"
                  >
                    <Undo2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onSelectArticle(decision)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white text-emerald-600 border border-emerald-200 rounded-lg text-[11px] font-medium hover:bg-emerald-50 transition-colors ml-auto"
                    title="Open in generator"
                  >
                    <ArrowRight className="w-3 h-3" /> Generate
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
