"use client";

import { useState } from "react";
import { AINewsArticle, ImageStyle, NewsVariant } from "@/types";
import { generateNewsImagePrompt } from "@/lib/prompts";
import {
  Sparkles,
  Pencil,
  Check,
  Copy,
  ExternalLink,
  ImageIcon,
} from "lucide-react";

interface NewsImageGeneratorProps {
  article: AINewsArticle;
  displayName: string;
  variant?: NewsVariant;
}

const IMAGE_STYLES: { value: ImageStyle; label: string; emoji: string }[] = [
  { value: "cinematic", label: "Cinematic", emoji: "🎬" },
  { value: "illustration", label: "Illustration", emoji: "🎨" },
  { value: "watercolor", label: "Watercolor", emoji: "💧" },
  { value: "digital_art", label: "Digital Art", emoji: "✨" },
  { value: "minimalist", label: "Minimalist", emoji: "◻️" },
];

const GEMINI_URL = "https://gemini.google.com/app";

export default function NewsImageGenerator({
  article,
  displayName,
  variant = "ai-news",
}: NewsImageGeneratorProps) {
  const [style, setStyle] = useState<ImageStyle>("cinematic");
  const [prompt, setPrompt] = useState(() =>
    generateNewsImagePrompt(
      article,
      displayName || "a professional person",
      "cinematic",
      variant
    )
  );
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleStyleChange = (newStyle: ImageStyle) => {
    setStyle(newStyle);
    setPrompt(
      generateNewsImagePrompt(
        article,
        displayName || "a professional person",
        newStyle,
        variant
      )
    );
    setCopied(false);
  };

  const handleCopyAndOpen = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      window.open(GEMINI_URL, "_blank");
    } catch {
      window.open(GEMINI_URL, "_blank");
    }
  };

  const handleCopyOnly = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-500" />
        <p className="text-xs text-slate-500">
          Generate an AI image for this news story via Google Gemini.
        </p>
      </div>

      {/* Style pills */}
      <div className="flex flex-wrap gap-1.5">
        {IMAGE_STYLES.map((s) => (
          <button
            key={s.value}
            onClick={() => handleStyleChange(s.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              style === s.value
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20"
                : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200"
            }`}
          >
            {s.emoji} {s.label}
          </button>
        ))}
      </div>

      {/* Prompt */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-slate-500">
            Generated Prompt
          </span>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-purple-600 transition-colors"
          >
            {isEditing ? (
              <>
                <Check className="w-3 h-3" /> Done
              </>
            ) : (
              <>
                <Pencil className="w-3 h-3" /> Edit
              </>
            )}
          </button>
        </div>
        {isEditing ? (
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={6}
            className="w-full p-3 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        ) : (
          <div className="p-3 text-sm text-slate-600 bg-slate-50/80 rounded-xl border border-slate-100 leading-relaxed max-h-32 overflow-y-auto">
            {prompt}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleCopyAndOpen}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium text-sm hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md shadow-purple-500/20"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied! Opening Gemini...
            </>
          ) : (
            <>
              <ExternalLink className="w-4 h-4" />
              Copy & Open Gemini
            </>
          )}
        </button>
        <button
          onClick={handleCopyOnly}
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-600 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
          title="Copy prompt only"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>

      {/* Tip */}
      <div className="flex items-start gap-2 p-3 bg-purple-50/50 border border-purple-100 rounded-xl">
        <ImageIcon className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-purple-700 leading-relaxed">
          <strong>Tip:</strong> Paste the prompt in Gemini and attach your
          profile photo for a personalized AI news image.
        </p>
      </div>
    </div>
  );
}
