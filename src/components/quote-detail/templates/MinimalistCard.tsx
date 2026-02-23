"use client";

import { Quote } from "@/types";

interface CardProps {
  quote: Quote;
  profileImage: string;
  displayName: string;
}

export default function MinimalistCard({ quote, profileImage, displayName }: CardProps) {
  return (
    <div
      style={{ width: 1080, height: 1080 }}
      className="relative flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-16"
    >
      {/* Subtle decorative element */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-8 left-8 w-32 h-32 border border-white/30 rounded-full" />
        <div className="absolute bottom-8 right-8 w-48 h-48 border border-white/20 rounded-full" />
      </div>

      {/* Quote mark */}
      <div className="text-8xl text-blue-400 opacity-40 font-serif leading-none mb-4">&ldquo;</div>

      {/* Quote text */}
      <p className="font-playfair text-4xl leading-snug text-center max-w-[800px] font-medium">
        {quote.quote_text}
      </p>

      {/* Divider */}
      <div className="w-20 h-0.5 bg-blue-400 my-8" />

      {/* Author */}
      <p className="font-inter text-xl text-blue-300 font-medium">{quote.author}</p>
      <p className="font-inter text-base text-slate-400 mt-1">{quote.book_name}</p>

      {/* Profile section */}
      <div className="absolute bottom-12 flex items-center gap-3">
        {profileImage ? (
          <img
            src={profileImage}
            alt={displayName}
            className="w-12 h-12 rounded-full object-cover border-2 border-blue-400"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
            {displayName.charAt(0) || "?"}
          </div>
        )}
        <span className="font-inter text-sm text-slate-400">{displayName}</span>
      </div>

      {/* Category badge */}
      <div className="absolute top-12 right-12 font-inter text-xs text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">
        {quote.category}
      </div>
    </div>
  );
}
