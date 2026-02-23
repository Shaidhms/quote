"use client";

import { ContentPost, ContentPostStatus } from "@/types";
import { format, parseISO } from "date-fns";
import {
  Pencil,
  CheckCircle2,
  Trash2,
  CalendarDays,
  ImageIcon,
  FileText,
  FileUp,
} from "lucide-react";

interface PostCardProps {
  post: ContentPost;
  onSelect: (post: ContentPost) => void;
  onEdit: (post: ContentPost) => void;
  onMarkPosted: (id: string) => void;
  onDelete: (id: string) => void;
}

const STATUS_CONFIG: Record<
  ContentPostStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  draft: {
    label: "Draft",
    bg: "bg-slate-100",
    text: "text-slate-600",
    dot: "bg-slate-400",
  },
  scheduled: {
    label: "Scheduled",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  posted: {
    label: "Posted",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
};

export default function PostCard({
  post,
  onSelect,
  onEdit,
  onMarkPosted,
  onDelete,
}: PostCardProps) {
  const status = STATUS_CONFIG[post.status];
  const pdfCount = post.attachments?.filter((a) => a.type === "pdf").length ?? 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
      {/* Clickable card body — opens LinkedIn preview */}
      <button
        onClick={() => onSelect(post)}
        className="w-full text-left cursor-pointer"
      >
        {post.images.length > 0 && (
          <div className="flex gap-0.5 h-32 overflow-hidden">
            {post.images.map((img, i) => (
              <div
                key={i}
                className="flex-1 min-w-0"
                style={{
                  backgroundImage: `url(${img})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            ))}
          </div>
        )}

        <div className="p-4 pb-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Platform icons from targets */}
              <div className="flex items-center -space-x-1">
                {post.targets?.includes("linkedin") && (
                  <span className="w-5 h-5 rounded-md bg-[#0A66C2] flex items-center justify-center flex-shrink-0 ring-1 ring-white">
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </span>
                )}
                {post.targets?.some((t) => t.startsWith("instagram")) && (
                  <span className="w-5 h-5 rounded-md bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center flex-shrink-0 ring-1 ring-white">
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  </span>
                )}
              </div>
              <span
                className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
              {post.targets?.filter((t) => t.startsWith("instagram")).map((t) => (
                <span key={t} className="text-[9px] font-medium text-pink-500 bg-pink-50 px-1.5 py-0.5 rounded-full">
                  @{t === "instagram_meshaid" ? "meshaid" : "ai360withshaid"}
                </span>
              ))}
            </div>
            {post.scheduledDate ? (
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <CalendarDays className="w-3 h-3" />
                {format(parseISO(post.scheduledDate), "MMM d, yyyy")}
              </span>
            ) : (
              <span className="text-[11px] text-slate-300">No date</span>
            )}
          </div>

          <p className="text-[13px] text-slate-700 leading-relaxed line-clamp-3">
            {post.caption || (
              <span className="text-slate-400 italic">No caption yet</span>
            )}
          </p>

          <div className="flex items-center gap-3 text-[10px] text-slate-400">
            {post.images.length > 0 && (
              <span className="flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                {post.images.length} image{post.images.length > 1 ? "s" : ""}
              </span>
            )}
            {pdfCount > 0 && (
              <span className="flex items-center gap-1">
                <FileUp className="w-3 h-3" />
                {pdfCount} PDF{pdfCount > 1 ? "s" : ""}
              </span>
            )}
            {post.source && (
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {post.source.type === "quote"
                  ? "From quote"
                  : post.source.type === "news"
                  ? "From news"
                  : "Custom"}
              </span>
            )}
          </div>
        </div>
      </button>

      {/* Actions — outside the clickable area */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
          <button
            onClick={() => onEdit(post)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <Pencil className="w-3 h-3" /> Edit
          </button>
          {post.status !== "posted" && (
            <button
              onClick={() => onMarkPosted(post.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            >
              <CheckCircle2 className="w-3 h-3" /> Mark Posted
            </button>
          )}
          <button
            onClick={() => onDelete(post.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-auto"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
