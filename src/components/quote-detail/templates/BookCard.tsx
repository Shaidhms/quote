"use client";

import { Quote } from "@/types";

interface CardProps {
  quote: Quote;
  profileImage: string;
  displayName: string;
}

export default function BookCard({ quote, profileImage, displayName }: CardProps) {
  return (
    <div
      style={{ width: 1080, height: 1080 }}
      className="relative flex items-center justify-center"
    >
      {/* Parchment background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100" />

      {/* Book page effect - subtle border */}
      <div className="absolute inset-6 border-2 border-amber-200/60 rounded-sm" />
      <div className="absolute inset-8 border border-amber-200/40 rounded-sm" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-20 py-16 max-w-[900px]">
        {/* Book icon / ornament */}
        <div className="text-amber-700/40 mb-6">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </div>

        {/* Chapter label */}
        <p className="font-inter text-xs uppercase tracking-[0.3em] text-amber-600/60 mb-2">
          Chapter {quote.day_number}
        </p>

        {/* Book name as title */}
        <p className="font-playfair text-xl text-amber-800/70 italic mb-8">
          {quote.book_name}
        </p>

        {/* Quote text */}
        <p className="font-playfair text-3xl leading-relaxed text-center text-amber-950 font-medium">
          &ldquo;{quote.quote_text}&rdquo;
        </p>

        {/* Decorative divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="w-16 h-px bg-amber-400" />
          <div className="w-2 h-2 bg-amber-400 rounded-full" />
          <div className="w-16 h-px bg-amber-400" />
        </div>

        {/* Author */}
        <p className="font-inter text-lg text-amber-800 font-semibold">
          — {quote.author}
        </p>

        {/* Category */}
        <p className="font-inter text-xs text-amber-600/50 mt-2 uppercase tracking-widest">
          {quote.category}
        </p>

        {/* Profile section at bottom */}
        <div className="absolute bottom-12 flex items-center gap-3">
          {profileImage ? (
            <img
              src={profileImage}
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover border-2 border-amber-300"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold">
              {displayName.charAt(0) || "?"}
            </div>
          )}
          <span className="font-inter text-sm text-amber-700">{displayName}</span>
        </div>
      </div>
    </div>
  );
}
