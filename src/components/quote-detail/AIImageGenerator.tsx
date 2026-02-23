"use client";

import { useState } from "react";
import { Quote, ImageStyle } from "@/types";
import { generateImagePrompt } from "@/lib/prompts";
import {
  Sparkles,
  Pencil,
  Check,
  Copy,
  ExternalLink,
  ImageIcon,
} from "lucide-react";

interface AIImageGeneratorProps {
  quote: Quote;
  displayName: string;
}

const IMAGE_STYLES: { value: ImageStyle; label: string }[] = [
  { value: "cinematic", label: "Cinematic" },
  { value: "illustration", label: "Illustration" },
  { value: "watercolor", label: "Watercolor" },
  { value: "digital_art", label: "Digital Art" },
  { value: "minimalist", label: "Minimalist" },
];

const GEMINI_URL = "https://gemini.google.com/app";

export default function AIImageGenerator({
  quote,
  displayName,
}: AIImageGeneratorProps) {
  const [style, setStyle] = useState<ImageStyle>("cinematic");
  const [prompt, setPrompt] = useState(() =>
    generateImagePrompt(
      quote,
      displayName || "a professional person",
      "cinematic"
    )
  );
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [prevQuoteText, setPrevQuoteText] = useState(quote.quote_text);

  // Re-generate prompt when quote text changes (e.g. alternate quote applied)
  if (quote.quote_text !== prevQuoteText) {
    setPrevQuoteText(quote.quote_text);
    setPrompt(
      generateImagePrompt(
        quote,
        displayName || "a professional person",
        style
      )
    );
    setCopied(false);
  }

  const handleStyleChange = (newStyle: ImageStyle) => {
    setStyle(newStyle);
    setPrompt(
      generateImagePrompt(
        quote,
        displayName || "a professional person",
        newStyle
      )
    );
    setCopied(false);
  };

  const handleCopyAndOpen = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      // Open Gemini in a new tab
      window.open(GEMINI_URL, "_blank");
    } catch {
      // Fallback: just open Gemini
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
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-500" />
        <h3 className="font-semibold text-slate-800 text-sm">
          AI Image Generator
        </h3>
        <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-medium">
          Gemini
        </span>
      </div>

      <p className="text-xs text-slate-500">
        Copy the prompt below and paste it into Google Gemini to generate an image for this quote.
        Attach your profile photo for personalized results.
      </p>

      {/* Style selector */}
      <div className="flex flex-wrap gap-1.5">
        {IMAGE_STYLES.map((s) => (
          <button
            key={s.value}
            onClick={() => handleStyleChange(s.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              style === s.value
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Prompt area */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-slate-500">Prompt</span>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
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
            className="w-full p-3 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        ) : (
          <div className="p-3 text-sm text-slate-600 bg-slate-50 rounded-lg border border-slate-100 leading-relaxed max-h-32 overflow-y-auto">
            {prompt}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleCopyAndOpen}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium text-sm hover:from-purple-700 hover:to-indigo-700 transition-all shadow-sm"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied! Opening Gemini...
            </>
          ) : (
            <>
              <ExternalLink className="w-4 h-4" />
              Copy &amp; Open Gemini
            </>
          )}
        </button>
        <button
          onClick={handleCopyOnly}
          className="flex items-center gap-2 px-4 py-3 bg-white text-slate-600 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          title="Copy prompt only"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>

      {/* Tip */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
        <ImageIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-700 leading-relaxed">
          <strong>Tip:</strong> After opening Gemini, paste the prompt and attach your profile photo.
          Gemini will generate an illustrative image matching the quote&apos;s theme.
        </p>
      </div>
    </div>
  );
}
