"use client";

import { Quote } from "@/types";

interface CardProps {
  quote: Quote;
  profileImage: string;
  displayName: string;
}

export default function SplitCard({ quote, profileImage, displayName }: CardProps) {
  return (
    <div
      style={{ width: 1080, height: 1080 }}
      className="relative flex overflow-hidden"
    >
      {/* Left side - Photo area */}
      <div className="w-[432px] relative bg-gradient-to-b from-blue-700 to-indigo-900">
        {profileImage ? (
          <img
            src={profileImage}
            alt={displayName}
            className="w-full h-full object-cover opacity-80"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-40 h-40 rounded-full bg-white/20 flex items-center justify-center text-white text-6xl font-bold">
              {displayName.charAt(0) || "?"}
            </div>
          </div>
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-900/60" />
        {/* Name tag */}
        <div className="absolute bottom-8 left-8 right-8">
          <p className="font-inter text-white font-bold text-xl">{displayName}</p>
          <div className="w-12 h-0.5 bg-amber-400 mt-2" />
        </div>
      </div>

      {/* Right side - Quote */}
      <div className="flex-1 bg-gradient-to-br from-blue-900 to-slate-900 flex flex-col justify-center p-12">
        {/* Decorative quote mark */}
        <div className="text-7xl text-amber-400 opacity-60 font-serif leading-none mb-6">
          &ldquo;
        </div>

        {/* Quote text */}
        <p className="font-playfair text-3xl leading-relaxed text-white font-medium mb-8">
          {quote.quote_text}
        </p>

        {/* Divider */}
        <div className="w-16 h-0.5 bg-amber-400 mb-6" />

        {/* Author info */}
        <p className="font-inter text-lg text-amber-300 font-semibold">
          {quote.author}
        </p>
        <p className="font-inter text-sm text-slate-400 mt-1">{quote.book_name}</p>

        {/* Category badge */}
        <div className="mt-8 inline-flex">
          <span className="font-inter text-xs text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
            {quote.category}
          </span>
        </div>
      </div>
    </div>
  );
}
