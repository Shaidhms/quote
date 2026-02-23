"use client";

import { useState, useRef } from "react";
import { Quote } from "@/types";
import { RefreshCw, Check, Undo2, Loader2 } from "lucide-react";

interface AlternateQuoteProps {
  quote: Quote;
  onUpdateQuote: (id: number, text: string, author?: string, book?: string) => void;
}

export default function AlternateQuote({ quote, onUpdateQuote }: AlternateQuoteProps) {
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<{
    quote_text: string;
    author: string;
    book_name: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [applied, setApplied] = useState(false);
  const [originalQuote, setOriginalQuote] = useState<string | null>(null);
  // Track all quotes we've seen so the API doesn't repeat them
  const seenQuotesRef = useRef<string[]>([]);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setGenerated(null);
    setApplied(false);

    // Save original on first use
    if (!originalQuote) {
      setOriginalQuote(quote.quote_text);
    }

    // Track the current quote text so API avoids it
    const currentText = quote.quote_text;
    if (!seenQuotesRef.current.includes(currentText)) {
      seenQuotesRef.current.push(currentText);
    }

    try {
      const res = await fetch("/api/generate-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book_name: quote.book_name,
          author: quote.author,
          category: quote.category,
          current_quote: seenQuotesRef.current.join(" ||| "),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate quote");
        return;
      }

      setGenerated(data);
      seenQuotesRef.current.push(data.quote_text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!generated) return;
    onUpdateQuote(quote.id, generated.quote_text, generated.author, generated.book_name);
    setApplied(true);
  };

  const handleRevert = () => {
    if (!originalQuote) return;
    onUpdateQuote(quote.id, originalQuote, quote.author, quote.book_name);
    setApplied(false);
    setGenerated(null);
    setOriginalQuote(null);
    seenQuotesRef.current = [];
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900 text-sm">Alternate Quote</h3>
        {originalQuote && (
          <button
            onClick={handleRevert}
            className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 transition-colors"
          >
            <Undo2 className="w-3.5 h-3.5" />
            Revert to original
          </button>
        )}
      </div>

      <p className="text-xs text-slate-500 mb-4">
        Already posted this quote? Generate a different one from the same book.
      </p>

      {/* Current quote preview */}
      <div className="bg-slate-50 rounded-lg p-3 mb-4">
        <p className="text-xs text-slate-400 mb-1">Current quote:</p>
        <p className="text-sm text-slate-700 italic leading-relaxed">
          &ldquo;{quote.quote_text}&rdquo;
        </p>
      </div>

      {/* Generated quote preview */}
      {generated && !applied && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
          <p className="text-xs text-blue-500 mb-1">Suggested alternate:</p>
          <p className="text-sm text-blue-900 italic leading-relaxed">
            &ldquo;{generated.quote_text}&rdquo;
          </p>
          <p className="text-xs text-blue-600 mt-2">
            — {generated.author}, <span className="italic">{generated.book_name}</span>
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleApply}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Use this quote
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-600 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Try another
            </button>
          </div>
        </div>
      )}

      {applied && (
        <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-4">
          <p className="text-xs text-green-600 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            Quote updated! The card preview and caption will use the new quote.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-4">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Generate button — always visible */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4" />
            {applied || generated ? "Generate Another" : "Generate Alternate Quote"}
          </>
        )}
      </button>
    </div>
  );
}
