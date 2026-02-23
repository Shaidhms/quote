"use client";

import { AINewsArticle, NewsPostStatus } from "@/types";
import {
  ListPlus,
  CheckCircle2,
  XCircle,
  Undo2,
  Clock,
} from "lucide-react";

interface NewsQueueActionsProps {
  article: AINewsArticle;
  currentStatus: NewsPostStatus | null;
  onSetStatus: (article: AINewsArticle, status: NewsPostStatus) => void;
  onRemove: (articleId: string) => void;
}

export default function NewsQueueActions({
  article,
  currentStatus,
  onSetStatus,
  onRemove,
}: NewsQueueActionsProps) {
  if (!currentStatus) {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => onSetStatus(article, "queued")}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <ListPlus className="w-4 h-4" />
          Queue for Post
        </button>
        <button
          onClick={() => onSetStatus(article, "declined")}
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-500 border border-slate-200 rounded-xl text-sm font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
        >
          <XCircle className="w-4 h-4" />
          Decline
        </button>
      </div>
    );
  }

  if (currentStatus === "queued") {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
          <Clock className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-700 flex-1">
            Queued for Posting
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onSetStatus(article, "posted")}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark Posted
          </button>
          <button
            onClick={() => onSetStatus(article, "declined")}
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-500 border border-slate-200 rounded-xl text-sm font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
          >
            <XCircle className="w-4 h-4" />
          </button>
          <button
            onClick={() => onRemove(article.id)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-400 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 hover:text-slate-600 transition-colors"
            title="Remove from queue"
          >
            <Undo2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (currentStatus === "posted") {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-700 flex-1">
            Posted
          </span>
        </div>
        <button
          onClick={() => onRemove(article.id)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-slate-400 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 hover:text-slate-600 transition-colors"
        >
          <Undo2 className="w-4 h-4" />
          Undo
        </button>
      </div>
    );
  }

  // declined
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl">
        <XCircle className="w-4 h-4 text-slate-400" />
        <span className="text-sm font-medium text-slate-500 flex-1">
          Declined
        </span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onSetStatus(article, "queued")}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          <ListPlus className="w-4 h-4" />
          Queue Instead
        </button>
        <button
          onClick={() => onRemove(article.id)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-slate-400 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 hover:text-slate-600 transition-colors"
          title="Remove"
        >
          <Undo2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
