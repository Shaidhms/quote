"use client";

import { AINewsArticle } from "@/types";
import { TrendingUp, Sparkles } from "lucide-react";

interface TrendingTopicsProps {
  articles: AINewsArticle[];
}

const STOPWORDS = new Set([
  "the", "a", "an", "in", "of", "to", "and", "or", "for", "with",
  "that", "this", "is", "are", "was", "were", "on", "at", "by", "as",
  "its", "it", "from", "be", "has", "have", "will", "can", "new", "says",
  "using", "use", "how", "why", "what", "about", "more", "than", "into",
  "after", "could", "over", "just", "been", "also", "most", "first",
  "like", "some", "make", "made", "would", "should", "other", "when",
  "their", "your", "they", "you", "not", "but", "all", "out", "get",
  "one", "may", "its", "now", "top", "best", "big", "next", "last",
]);

function extractKeywords(articles: AINewsArticle[]): { word: string; count: number }[] {
  const freq: Record<string, number> = {};
  articles.forEach((article) => {
    const words = article.title
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOPWORDS.has(w));
    const unique = [...new Set(words)]; // count once per article
    unique.forEach((w) => {
      freq[w] = (freq[w] ?? 0) + 1;
    });
  });

  return Object.entries(freq)
    .map(([word, count]) => ({ word, count }))
    .filter((e) => e.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

const PILL_COLORS = [
  "bg-blue-50 text-blue-700 border-blue-200",
  "bg-emerald-50 text-emerald-700 border-emerald-200",
  "bg-purple-50 text-purple-700 border-purple-200",
  "bg-amber-50 text-amber-700 border-amber-200",
  "bg-rose-50 text-rose-700 border-rose-200",
  "bg-teal-50 text-teal-700 border-teal-200",
  "bg-indigo-50 text-indigo-700 border-indigo-200",
  "bg-orange-50 text-orange-700 border-orange-200",
];

export default function TrendingTopics({ articles }: TrendingTopicsProps) {
  const keywords = extractKeywords(articles);

  if (keywords.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-emerald-500" />
        <h3 className="text-xs font-semibold text-slate-700">
          Hot Topics This Week
        </h3>
        <Sparkles className="w-3 h-3 text-amber-400" />
      </div>
      <div className="flex flex-wrap gap-2">
        {keywords.map((kw, i) => (
          <span
            key={kw.word}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${PILL_COLORS[i % PILL_COLORS.length]}`}
          >
            {kw.word}
            <span className="text-[9px] opacity-60">{kw.count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
