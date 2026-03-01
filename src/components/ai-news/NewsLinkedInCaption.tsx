"use client";

import { useState, useCallback } from "react";
import { AINewsArticle, CaptionStyle, NewsVariant } from "@/types";
import { generateNewsLinkedInCaption } from "@/lib/prompts";
import { stripMarkdownBold, renderCaptionText } from "@/lib/captionUtils";
import {
  Linkedin,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  Pencil,
  BookOpen,
  Zap,
  MessageCircleQuestion,
  Briefcase,
  AlertCircle,
  UserPen,
} from "lucide-react";

interface NewsLinkedInCaptionProps {
  article: AINewsArticle;
  displayName: string;
  variant?: NewsVariant;
}

const CAPTION_STYLES: {
  value: CaptionStyle;
  label: string;
  icon: React.ElementType;
  color: string;
}[] = [
  { value: "professional", label: "Professional", icon: Briefcase, color: "blue" },
  { value: "story", label: "Story Mode", icon: BookOpen, color: "amber" },
  { value: "motivational", label: "Motivational", icon: Zap, color: "rose" },
  { value: "question", label: "Question", icon: MessageCircleQuestion, color: "teal" },
  { value: "first_person", label: "Thought Leader", icon: UserPen, color: "violet" },
];

export default function NewsLinkedInCaption({
  article,
  displayName,
  variant = "ai-news",
}: NewsLinkedInCaptionProps) {
  const [style, setStyle] = useState<CaptionStyle>("professional");
  const [caption, setCaption] = useState(() =>
    generateNewsLinkedInCaption(article, variant)
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAICaption = useCallback(
    async (captionStyle: CaptionStyle) => {
      setLoading(true);
      setError(null);
      setIsEditing(false);
      try {
        const res = await fetch("/api/generate-news-caption", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ article, style: captionStyle, displayName, variant }),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          setError(data.error || "Caption generation failed");
        } else {
          setCaption(data.caption);
        }
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [article, displayName, variant]
  );

  const handleStyleChange = (newStyle: CaptionStyle) => {
    setStyle(newStyle);
    setError(null);
    setIsEditing(false);

    if (newStyle === "professional") {
      setCaption(generateNewsLinkedInCaption(article, variant));
    } else {
      generateAICaption(newStyle);
    }
  };

  const handleCopy = async () => {
    const raw = isEditing ? editText : caption;
    const textToCopy = stripMarkdownBold(raw);
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = () => {
    setEditText(caption);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    setCaption(editText);
    setIsEditing(false);
  };

  const handleRegenerate = () => {
    if (style === "professional") {
      setCaption(generateNewsLinkedInCaption(article, variant));
    } else {
      generateAICaption(style);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Linkedin className="w-4 h-4 text-blue-600" />
        <p className="text-xs text-slate-500">
          Generate a LinkedIn caption for this news article.
        </p>
      </div>

      {/* Style tabs */}
      <div className="flex flex-wrap gap-1.5">
        {CAPTION_STYLES.map((s) => (
          <button
            key={s.value}
            onClick={() => handleStyleChange(s.value)}
            disabled={loading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              style === s.value
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
            } disabled:opacity-50`}
          >
            <s.icon className="w-3 h-3" />
            {s.label}
          </button>
        ))}
      </div>

      {/* Caption content */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          <span className="text-sm">Generating {style} caption...</span>
        </div>
      ) : isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={10}
            className="w-full p-3 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSaveEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
          >
            <Check className="w-3 h-3" /> Save Edit
          </button>
        </div>
      ) : (
        <div className="bg-slate-50/80 rounded-xl p-4 text-sm text-slate-700 leading-relaxed border border-slate-100 whitespace-pre-line max-h-64 overflow-y-auto">
          {renderCaptionText(caption)}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {/* Action buttons */}
      {!loading && (
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-500/20"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy
              </>
            )}
          </button>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <Pencil className="w-4 h-4" /> Edit
            </button>
          )}
          <button
            onClick={handleRegenerate}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" /> Vary
          </button>
        </div>
      )}
    </div>
  );
}
