"use client";

import { useRef, useState, use } from "react";
import { useQuotes } from "@/hooks/useQuotes";
import { useUserSettings } from "@/hooks/useUserSettings";
import CardRenderer from "@/components/quote-detail/CardRenderer";
import DownloadButton from "@/components/quote-detail/DownloadButton";
import AIImageGenerator from "@/components/quote-detail/AIImageGenerator";
import AlternateQuote from "@/components/quote-detail/AlternateQuote";
import LinkedInCaption from "@/components/quote-detail/LinkedInCaption";
import PostedToggle from "@/components/quote-detail/PostedToggle";
import ProfileSettings from "@/components/ProfileSettings";
import Link from "next/link";
import { ArrowLeft, BookOpen, Settings, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { TemplateType } from "@/types";
import { format, parseISO } from "date-fns";

export default function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const quoteId = parseInt(id);
  const cardRef = useRef<HTMLDivElement>(null);
  const { allQuotes, togglePosted, updateTemplate, updateQuoteText, loading } = useQuotes();
  const { settings, updateSettings, setProfileImage } = useUserSettings();
  const [showSettings, setShowSettings] = useState(false);

  const quote = allQuotes.find((q) => q.id === quoteId);
  const [template, setTemplate] = useState<TemplateType>(
    (quote?.card_template as TemplateType) || "minimalist"
  );

  const handleTemplateChange = (t: TemplateType) => {
    setTemplate(t);
    if (quote) updateTemplate(quote.id, t);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <p className="text-slate-500">Quote not found</p>
        <Link href="/" className="text-blue-600 hover:underline text-sm">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const prevQuote = allQuotes.find((q) => q.id === quoteId - 1);
  const nextQuote = allQuotes.find((q) => q.id === quoteId + 1);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                Day {quote.day_number} — {format(parseISO(quote.scheduled_date), "MMM dd, yyyy")}
              </h1>
              <p className="text-xs text-slate-500">
                {quote.book_name} by {quote.author}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Navigation */}
            {prevQuote && (
              <Link
                href={`/quote/${prevQuote.id}`}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-500" />
              </Link>
            )}
            {nextQuote && (
              <Link
                href={`/quote/${nextQuote.id}`}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-500" />
              </Link>
            )}
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column: Card preview */}
          <div className="space-y-4">
            <CardRenderer
              quote={quote}
              profileImage={settings.profile_image_url}
              displayName={settings.display_name || "Your Name"}
              template={template}
              onTemplateChange={handleTemplateChange}
              cardRef={cardRef}
            />
            <div className="flex gap-3">
              <DownloadButton
                cardRef={cardRef}
                filename={`linkedin-day${quote.day_number}-${quote.author.replace(/\s/g, "-").toLowerCase()}`}
              />
            </div>
          </div>

          {/* Right column: Actions */}
          <div className="space-y-4">
            <PostedToggle
              quote={quote}
              onToggle={() => togglePosted(quote.id)}
            />
            <AlternateQuote
              quote={quote}
              onUpdateQuote={updateQuoteText}
            />
            <AIImageGenerator
              quote={quote}
              displayName={settings.display_name}
            />
            <LinkedInCaption
              quote={quote}
              displayName={settings.display_name}
            />
          </div>
        </div>
      </main>

      <ProfileSettings
        settings={settings}
        onUpdate={updateSettings}
        onSetImage={setProfileImage}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}
