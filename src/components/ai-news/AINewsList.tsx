"use client";

import { useState } from "react";
import { AINewsArticle, NewsPostStatus } from "@/types";
import { formatDistanceToNow, parseISO } from "date-fns";
import {
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Clock,
  Search,
  Newspaper,
  Globe,
  MapPin,
} from "lucide-react";

interface AINewsListProps {
  articles: AINewsArticle[];
  selectedId: string | null;
  onSelect: (article: AINewsArticle) => void;
  error: string | null;
  fetchedAt: string | null;
  onRetry: () => void;
  getArticleStatus?: (articleId: string) => NewsPostStatus | null;
}

const SOURCE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  "Google News": { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  TechCrunch: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  "The Verge": { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
  "Ars Technica": { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
  "Ministry of Testing": { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
};

function getSourceStyle(source: string) {
  return (
    SOURCE_COLORS[source] || {
      bg: "bg-slate-50",
      text: "text-slate-600",
      dot: "bg-slate-400",
    }
  );
}

const INDIA_KEYWORDS = /\bindia\b|\bindian\b|\bmumbai\b|\bdelhi\b|\bbangalore\b|\bbengaluru\b|\bhyderabad\b|\bchennai\b|\bpune\b|\bkolkata\b|\binfosys\b|\btcs\b|\bwipro\b|\breliance\b|\bjio\b|\btata\b|\badani\b|\bniti aayog\b|\bmeity\b|\biit\b|\biisc\b/i;

function isIndiaRelated(article: AINewsArticle): boolean {
  // Google News feed is India-locale, so those are India-relevant
  if (article.source === "Google News") return true;
  // Check title and description for India-related keywords
  if (INDIA_KEYWORDS.test(article.title)) return true;
  if (article.description && INDIA_KEYWORDS.test(article.description))
    return true;
  return false;
}

type RegionFilter = "all" | "india";

const STATUS_BADGES: Record<NewsPostStatus, { bg: string; text: string; label: string }> = {
  queued: { bg: "bg-amber-50", text: "text-amber-700", label: "Queued" },
  posted: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Posted" },
  declined: { bg: "bg-slate-100", text: "text-slate-500", label: "Declined" },
};

export default function AINewsList({
  articles,
  selectedId,
  onSelect,
  error,
  fetchedAt,
  onRetry,
  getArticleStatus,
}: AINewsListProps) {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState<RegionFilter>("all");

  const filtered = articles
    .filter((a) => (region === "india" ? isIndiaRelated(a) : true))
    .filter(
      (a) =>
        !search ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.source.toLowerCase().includes(search.toLowerCase())
    );

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-red-100 p-6 shadow-sm">
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-sm text-red-600 text-center">{error}</p>
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Try again
          </button>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
            <Newspaper className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-sm text-slate-500">
            No AI news found for the last 2 days.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">
            {filtered.length} articles
          </span>
          {fetchedAt && (
            <span className="flex items-center gap-1 text-[10px] text-slate-400">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(parseISO(fetchedAt), { addSuffix: true })}
            </span>
          )}
        </div>

        {/* Region filter */}
        <div className="flex gap-1.5">
          <button
            onClick={() => setRegion("all")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
              region === "all"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Globe className="w-3 h-3" />
            All Regions
          </button>
          <button
            onClick={() => setRegion("india")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
              region === "india"
                ? "bg-orange-500 text-white shadow-sm"
                : "bg-white text-slate-500 border border-slate-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
            }`}
          >
            <MapPin className="w-3 h-3" />
            India
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
          />
        </div>
      </div>

      {/* Article list */}
      <div className="divide-y divide-slate-50 max-h-[calc(100vh-260px)] overflow-y-auto">
        {filtered.map((article) => {
          const sourceStyle = getSourceStyle(article.source);
          const isSelected = selectedId === article.id;
          const articleStatus = getArticleStatus?.(article.id);

          return (
            <button
              key={article.id}
              onClick={() => onSelect(article)}
              className={`w-full text-left px-4 py-3.5 transition-all group ${
                isSelected
                  ? "bg-emerald-50/80 border-l-[3px] border-l-emerald-500"
                  : "border-l-[3px] border-l-transparent hover:bg-slate-50/80"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[10px] ${sourceStyle.bg} ${sourceStyle.text} px-2 py-0.5 rounded-full font-medium`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${sourceStyle.dot}`}
                    />
                    {article.source}
                  </span>
                  {articleStatus && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${STATUS_BADGES[articleStatus].bg} ${STATUS_BADGES[articleStatus].text}`}
                    >
                      {STATUS_BADGES[articleStatus].label}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 flex-shrink-0">
                  {formatDistanceToNow(parseISO(article.publishedAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>

              <p
                className={`text-[13px] font-semibold leading-snug mb-1 transition-colors ${
                  isSelected
                    ? "text-emerald-900"
                    : "text-slate-800 group-hover:text-emerald-700"
                }`}
              >
                {article.title}
              </p>

              {article.description && (
                <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                  {article.description}
                </p>
              )}

              <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400 group-hover:text-emerald-500 transition-colors">
                <ExternalLink className="w-3 h-3" />
                Read full article
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
