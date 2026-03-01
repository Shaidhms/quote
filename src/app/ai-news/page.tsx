"use client";

import { useState, useEffect, useCallback } from "react";
import { useAINews } from "@/hooks/useAINews";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useNewsQueue } from "@/hooks/useNewsQueue";
import AINewsList from "@/components/ai-news/AINewsList";
import AINewsPostGenerator from "@/components/ai-news/AINewsPostGenerator";
import NewsQueuePanel from "@/components/ai-news/NewsQueuePanel";
import Link from "next/link";
import {
  ArrowLeft,
  Newspaper,
  RefreshCw,
  Loader2,
  Zap,
  Sparkles,
  ListChecks,
  FlaskConical,
} from "lucide-react";
import { AINewsArticle, FetchAINewsResponse } from "@/types";

type View = "feed" | "queue";
type Topic = "ai-news" | "ai-testing";

function useTestingNews() {
  const [articles, setArticles] = useState<AINewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] =
    useState<AINewsArticle | null>(null);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/fetch-testing-news");
      const data: FetchAINewsResponse = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Failed to load testing news");
      } else {
        setArticles(data.articles);
        setFetchedAt(data.fetchedAt);
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    articles,
    loading,
    error,
    fetchedAt,
    selectedArticle,
    setSelectedArticle,
    fetchNews,
  };
}

export default function AINewsPage() {
  const aiNews = useAINews();
  const testingNews = useTestingNews();

  const { settings } = useUserSettings();
  const newsQueue = useNewsQueue();
  const [view, setView] = useState<View>("feed");
  const [topic, setTopic] = useState<Topic>("ai-news");

  const activeSource = topic === "ai-news" ? aiNews : testingNews;
  const {
    articles,
    loading,
    error,
    fetchedAt,
    selectedArticle,
    setSelectedArticle,
    fetchNews,
  } = activeSource;

  useEffect(() => {
    aiNews.fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch testing news on first switch to that topic
  const [testingFetched, setTestingFetched] = useState(false);
  useEffect(() => {
    if (topic === "ai-testing" && !testingFetched) {
      testingNews.fetchNews();
      setTestingFetched(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Newspaper className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-amber-400 rounded-full border-2 border-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  {topic === "ai-news" ? "AI News Hub" : "AI in Testing"}
                  <span className={`text-[10px] bg-gradient-to-r ${topic === "ai-news" ? "from-emerald-500 to-teal-500" : "from-violet-500 to-purple-500"} text-white px-2 py-0.5 rounded-full font-medium`}>
                    LIVE
                  </span>
                </h1>
                <p className="text-xs text-slate-500">
                  {topic === "ai-news"
                    ? "Latest AI news from India & worldwide"
                    : "AI in QA, Testing & Performance Engineering"}
                </p>
              </div>
            </div>
          </div>

          {/* Topic + View toggle + Refresh */}
          <div className="flex items-center gap-2">
            {/* Topic tabs */}
            <div className="flex bg-slate-100 rounded-xl p-0.5">
              <button
                onClick={() => setTopic("ai-news")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  topic === "ai-news"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Newspaper className="w-3.5 h-3.5" />
                AI News
              </button>
              <button
                onClick={() => setTopic("ai-testing")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  topic === "ai-testing"
                    ? "bg-white text-violet-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5" />
                AI in Testing
              </button>
            </div>

            {/* View toggle */}
            <div className="flex bg-slate-100 rounded-xl p-0.5">
              <button
                onClick={() => setView("feed")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  view === "feed"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Newspaper className="w-3.5 h-3.5" />
                Feed
              </button>
              <button
                onClick={() => setView("queue")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  view === "queue"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <ListChecks className="w-3.5 h-3.5" />
                Queue
                {newsQueue.counts.queued > 0 && (
                  <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[10px] rounded-full font-bold leading-none">
                    {newsQueue.counts.queued}
                  </span>
                )}
              </button>
            </div>
            {view === "feed" && (
              <button
                onClick={fetchNews}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all disabled:opacity-50 border border-emerald-200/60"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {view === "queue" ? (
          <div className="max-w-4xl mx-auto">
            <NewsQueuePanel
              decisions={newsQueue.decisions}
              filter={newsQueue.filter}
              onSetFilter={newsQueue.setFilter}
              counts={newsQueue.counts}
              onChangeStatus={(articleId, status) => {
                const decision = newsQueue.allDecisions.find(
                  (d) => d.articleId === articleId
                );
                if (decision)
                  newsQueue.setArticleStatus(decision.article, status);
              }}
              onRemove={newsQueue.removeDecision}
              onSelectArticle={(decision) => {
                setSelectedArticle(decision.article);
                setView("feed");
              }}
            />
          </div>
        ) : loading && articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              </div>
              <Sparkles className="w-5 h-5 text-amber-400 absolute -top-2 -right-2 animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700">
                {topic === "ai-news"
                  ? "Fetching latest AI news..."
                  : "Fetching AI in Testing news..."}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {topic === "ai-news"
                  ? "Scanning multiple sources worldwide"
                  : "Scanning testing & QA sources"}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: Article list (2/5) */}
            <div className="lg:col-span-2">
              <AINewsList
                articles={articles}
                selectedId={selectedArticle?.id ?? null}
                onSelect={setSelectedArticle}
                error={error}
                fetchedAt={fetchedAt}
                onRetry={fetchNews}
                getArticleStatus={newsQueue.getStatus}
              />
            </div>

            {/* Right: Post generator (3/5) */}
            <div className="lg:col-span-3 lg:sticky lg:top-20 lg:self-start">
              {selectedArticle ? (
                <AINewsPostGenerator
                  key={`${topic}-${selectedArticle.id}`}
                  article={selectedArticle}
                  displayName={settings.display_name}
                  currentStatus={newsQueue.getStatus(selectedArticle.id)}
                  onSetStatus={newsQueue.setArticleStatus}
                  onRemoveDecision={newsQueue.removeDecision}
                  variant={topic}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-80 bg-white/60 backdrop-blur-sm rounded-2xl border border-dashed border-slate-200 text-slate-400 gap-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
                    <Zap className="w-7 h-7 text-slate-300" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-500">
                      Select an article to get started
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Generate image prompts & LinkedIn captions instantly
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
