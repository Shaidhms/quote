"use client";

import { useState } from "react";
import { AINewsArticle, NewsPostStatus, NewsVariant } from "@/types";
import NewsImageGenerator from "./NewsImageGenerator";
import NewsLinkedInCaption from "./NewsLinkedInCaption";
import NewsQueueActions from "./NewsQueueActions";
import {
  ExternalLink,
  Newspaper,
  ImageIcon,
  MessageSquareText,
} from "lucide-react";

interface AINewsPostGeneratorProps {
  article: AINewsArticle;
  displayName: string;
  currentStatus: NewsPostStatus | null;
  onSetStatus: (article: AINewsArticle, status: NewsPostStatus) => void;
  onRemoveDecision: (articleId: string) => void;
  variant?: NewsVariant;
}

type Tab = "image" | "caption";

export default function AINewsPostGenerator({
  article,
  displayName,
  currentStatus,
  onSetStatus,
  onRemoveDecision,
  variant = "ai-news",
}: AINewsPostGeneratorProps) {
  const [activeTab, setActiveTab] = useState<Tab>("caption");

  return (
    <div className="space-y-4">
      {/* Selected article summary card */}
      <div className={`bg-gradient-to-r ${variant === "ai-testing" ? "from-violet-500 to-purple-600 shadow-violet-500/10" : "from-emerald-500 to-teal-600 shadow-emerald-500/10"} rounded-2xl p-4 shadow-lg`}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <Newspaper className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-emerald-100 font-medium uppercase tracking-wider mb-0.5">
              {article.source}
            </p>
            <p className="text-sm font-semibold text-white leading-snug">
              {article.title}
            </p>
            {article.description && (
              <p className="text-[11px] text-emerald-100/80 mt-1.5 leading-relaxed line-clamp-2">
                {article.description}
              </p>
            )}
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] text-white/70 hover:text-white mt-2 transition-colors"
            >
              <ExternalLink className="w-3 h-3" /> Read full article
            </a>
          </div>
        </div>
      </div>

      {/* Queue actions */}
      <NewsQueueActions
        article={article}
        currentStatus={currentStatus}
        onSetStatus={onSetStatus}
        onRemove={onRemoveDecision}
      />

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setActiveTab("caption")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
              activeTab === "caption"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/30"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
            }`}
          >
            <MessageSquareText className="w-4 h-4" />
            LinkedIn Caption
          </button>
          <button
            onClick={() => setActiveTab("image")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
              activeTab === "image"
                ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50/30"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            AI Image Prompt
          </button>
        </div>

        <div className="p-4">
          {activeTab === "caption" ? (
            <NewsLinkedInCaption article={article} displayName={displayName} variant={variant} />
          ) : (
            <NewsImageGenerator article={article} displayName={displayName} variant={variant} />
          )}
        </div>
      </div>
    </div>
  );
}
