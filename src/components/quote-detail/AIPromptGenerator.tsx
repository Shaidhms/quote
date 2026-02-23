"use client";

import { useState } from "react";
import { Quote } from "@/types";
import { generateNanoBananaPrompt } from "@/lib/prompts";
import { Sparkles, Copy, Check, ExternalLink } from "lucide-react";

interface AIPromptGeneratorProps {
  quote: Quote;
  displayName: string;
}

export default function AIPromptGenerator({ quote, displayName }: AIPromptGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const prompt = generateNanoBananaPrompt(quote, displayName || "a professional person");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-purple-500" />
        <h3 className="font-semibold text-slate-800 text-sm">Nano Banana AI Prompt</h3>
      </div>
      <p className="text-xs text-slate-500 mb-3">
        Copy this prompt and paste it into Nano Banana to generate an AI image with your face depicting this quote.
      </p>
      <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 leading-relaxed border border-slate-100">
        {prompt}
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" /> Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" /> Copy Prompt
            </>
          )}
        </button>
        <a
          href="https://www.nano-banana.ai/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
        >
          <ExternalLink className="w-4 h-4" /> Open Nano Banana
        </a>
      </div>
    </div>
  );
}
