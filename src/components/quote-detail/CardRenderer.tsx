"use client";

import { useRef } from "react";
import { Quote, TemplateType } from "@/types";
import MinimalistCard from "./templates/MinimalistCard";
import SplitCard from "./templates/SplitCard";
import BookCard from "./templates/BookCard";
import { Layout, BookOpen, Columns } from "lucide-react";

interface CardRendererProps {
  quote: Quote;
  profileImage: string;
  displayName: string;
  template: TemplateType;
  onTemplateChange: (t: TemplateType) => void;
  cardRef: React.RefObject<HTMLDivElement | null>;
}

const templates: { value: TemplateType; label: string; icon: React.ElementType }[] = [
  { value: "minimalist", label: "Minimalist", icon: Layout },
  { value: "split", label: "Split", icon: Columns },
  { value: "book", label: "Book", icon: BookOpen },
];

export default function CardRenderer({
  quote,
  profileImage,
  displayName,
  template,
  onTemplateChange,
  cardRef,
}: CardRendererProps) {
  const TemplateComponent = {
    minimalist: MinimalistCard,
    split: SplitCard,
    book: BookCard,
  }[template];

  return (
    <div className="space-y-4">
      {/* Template selector */}
      <div className="flex gap-2">
        {templates.map((t) => (
          <button
            key={t.value}
            onClick={() => onTemplateChange(t.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              template === t.value
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Card preview - scaled down for display */}
      <div className="bg-slate-100 rounded-xl p-4 overflow-hidden">
        <div
          style={{
            transform: "scale(0.45)",
            transformOrigin: "top left",
            width: 1080,
            height: 1080,
          }}
        >
          <div ref={cardRef}>
            <TemplateComponent
              quote={quote}
              profileImage={profileImage}
              displayName={displayName}
            />
          </div>
        </div>
        {/* Reserve space for the scaled content */}
        <div style={{ height: 1080 * 0.45 - 1080, marginTop: -1080 + 1080 * 0.45 }} />
      </div>
    </div>
  );
}
