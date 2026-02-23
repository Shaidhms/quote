"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Quote, CaptionStyle } from "@/types";
import { generateLinkedInCaption } from "@/lib/prompts";
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
} from "lucide-react";

interface LinkedInCaptionProps {
  quote: Quote;
  displayName: string;
}

const CAPTION_STYLES: {
  value: CaptionStyle;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "professional", label: "Professional", icon: Briefcase },
  { value: "story", label: "Story Mode", icon: BookOpen },
  { value: "motivational", label: "Motivational", icon: Zap },
  { value: "question", label: "Question", icon: MessageCircleQuestion },
];

export default function LinkedInCaption({
  quote,
  displayName,
}: LinkedInCaptionProps) {
  const [style, setStyle] = useState<CaptionStyle>("professional");
  const [caption, setCaption] = useState(() => generateLinkedInCaption(quote));
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prevQuoteTextRef = useRef(quote.quote_text);

  const generateAICaption = useCallback(
    async (captionStyle: CaptionStyle) => {
      setLoading(true);
      setError(null);
      setIsEditing(false);
      try {
        const res = await fetch("/api/generate-caption", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quote, style: captionStyle, displayName }),
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
    [quote, displayName]
  );

  // Re-generate caption when quote text changes (e.g. alternate quote applied)
  useEffect(() => {
    if (quote.quote_text !== prevQuoteTextRef.current) {
      prevQuoteTextRef.current = quote.quote_text;
      setIsEditing(false);
      setError(null);
      if (style === "professional") {
        setCaption(generateLinkedInCaption(quote));
      } else {
        generateAICaption(style);
      }
    }
  }, [quote.quote_text, style, generateAICaption]);

  const handleStyleChange = (newStyle: CaptionStyle) => {
    setStyle(newStyle);
    setError(null);
    setIsEditing(false);

    if (newStyle === "professional") {
      setCaption(generateLinkedInCaption(quote));
    } else {
      generateAICaption(newStyle);
    }
  };

  const handleCopy = async () => {
    const textToCopy = isEditing ? editText : caption;
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
      setCaption(generateLinkedInCaption(quote));
    } else {
      generateAICaption(style);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Linkedin className="w-4 h-4 text-blue-600" />
        <h3 className="font-semibold text-slate-800 text-sm">
          LinkedIn Caption
        </h3>
      </div>

      {/* Style tabs */}
      <div className="flex flex-wrap gap-1.5">
        {CAPTION_STYLES.map((s) => (
          <button
            key={s.value}
            onClick={() => handleStyleChange(s.value)}
            disabled={loading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              style === s.value
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
            } disabled:opacity-50`}
          >
            <s.icon className="w-3 h-3" />
            {s.label}
          </button>
        ))}
      </div>

      {/* Caption content */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Generating {style} caption...</span>
        </div>
      ) : isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={10}
            className="w-full p-3 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSaveEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
          >
            <Check className="w-3 h-3" /> Save Edit
          </button>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 leading-relaxed border border-slate-100 whitespace-pre-line max-h-64 overflow-y-auto">
          {caption}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {/* Action buttons */}
      {!loading && (
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
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
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <Pencil className="w-4 h-4" /> Edit
            </button>
          )}
          <button
            onClick={handleRegenerate}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" /> Vary
          </button>
        </div>
      )}
    </div>
  );
}
