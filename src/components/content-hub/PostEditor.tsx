"use client";

import { useState, useRef, useMemo } from "react";
import {
  ContentPost,
  ContentPostStatus,
  ContentAttachment,
  PostTarget,
} from "@/types";
import { processMultipleImages } from "@/lib/imageUtils";
import { format, addDays, parseISO } from "date-fns";
import {
  X,
  ImagePlus,
  CalendarDays,
  Save,
  Trash2,
  Upload,
  FileText,
  FileUp,
  AlertCircle,
  Zap,
} from "lucide-react";

interface PostEditorProps {
  post?: ContentPost;
  scheduledDates?: Record<string, number>;
  onSave: (data: {
    caption: string;
    images: string[];
    attachments: ContentAttachment[];
    scheduledDate: string | null;
    status: ContentPostStatus;
    targets: PostTarget[];
    source?: { type: "quote" | "news" | "custom"; title?: string };
  }) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

const MAX_PDF_SIZE = 2 * 1024 * 1024; // 2MB per PDF

const STATUS_OPTIONS: {
  value: ContentPostStatus;
  label: string;
  color: string;
}[] = [
  { value: "draft", label: "Draft", color: "slate" },
  { value: "scheduled", label: "Scheduled", color: "blue" },
  { value: "posted", label: "Posted", color: "emerald" },
];

const TARGET_OPTIONS: {
  value: PostTarget;
  label: string;
  sublabel: string;
  activeClass: string;
  inactiveHover: string;
  icon: "linkedin" | "instagram";
}[] = [
  {
    value: "linkedin",
    label: "LinkedIn",
    sublabel: "",
    activeClass: "bg-[#0A66C2] text-white shadow-md shadow-blue-500/20",
    inactiveHover: "hover:bg-blue-50 hover:text-[#0A66C2]",
    icon: "linkedin",
  },
  {
    value: "instagram_meshaid",
    label: "@meshaid",
    sublabel: "Personal",
    activeClass:
      "bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white shadow-md shadow-pink-500/20",
    inactiveHover: "hover:bg-pink-50 hover:text-pink-600",
    icon: "instagram",
  },
  {
    value: "instagram_ai360withshaid",
    label: "@ai360withshaid",
    sublabel: "AI",
    activeClass:
      "bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white shadow-md shadow-pink-500/20",
    inactiveHover: "hover:bg-pink-50 hover:text-pink-600",
    icon: "instagram",
  },
];

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export default function PostEditor({
  post,
  scheduledDates = {},
  onSave,
  onDelete,
  onClose,
}: PostEditorProps) {
  const [caption, setCaption] = useState(post?.caption ?? "");
  const [images, setImages] = useState<string[]>(post?.images ?? []);
  const [attachments, setAttachments] = useState<ContentAttachment[]>(
    post?.attachments ?? []
  );
  const [scheduledDate, setScheduledDate] = useState(
    post?.scheduledDate ?? ""
  );
  const [status, setStatus] = useState<ContentPostStatus>(
    post?.status ?? "draft"
  );
  const [targets, setTargets] = useState<PostTarget[]>(
    post?.targets?.length ? post.targets : ["linkedin"]
  );
  const [uploading, setUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const isEditing = !!post;
  const hasInstagram = targets.some((t) => t.startsWith("instagram"));
  const charLimit = hasInstagram ? 2200 : 3000;
  const charCount = caption.length;
  const charOverLimit = charCount > charLimit;
  const pdfCount = attachments.filter((a) => a.type === "pdf").length;

  // Date scheduling helpers
  const postsOnSelectedDate = scheduledDate ? (scheduledDates[scheduledDate] ?? 0) : 0;
  // If editing, subtract 1 from count for this post's own date
  const adjustedCount =
    isEditing && post?.scheduledDate === scheduledDate
      ? Math.max(0, postsOnSelectedDate - 1)
      : postsOnSelectedDate;

  const nextAvailableDate = useMemo(() => {
    const today = new Date();
    for (let i = 0; i <= 60; i++) {
      const d = addDays(today, i);
      const dateStr = format(d, "yyyy-MM-dd");
      if (!scheduledDates[dateStr]) return dateStr;
    }
    return null;
  }, [scheduledDates]);

  const toggleTarget = (target: PostTarget) => {
    setTargets((prev) => {
      if (prev.includes(target)) {
        const next = prev.filter((t) => t !== target);
        return next.length === 0 ? prev : next; // keep at least one
      }
      return [...prev, target];
    });
  };

  const handleImageFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const imageFiles = Array.from(files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (imageFiles.length > 0) {
        const dt = new DataTransfer();
        imageFiles.forEach((f) => dt.items.add(f));
        const updated = await processMultipleImages(dt.files, images);
        setImages(updated);
      }
    } catch {
      // silently ignore failed images
    } finally {
      setUploading(false);
    }
  };

  const handlePdfFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setPdfError(null);
    setUploading(true);
    try {
      const pdfFiles = Array.from(files).filter(
        (f) => f.type === "application/pdf"
      );
      const slotsLeft = 3 - pdfCount;
      if (slotsLeft <= 0) {
        setPdfError("Maximum 3 PDFs allowed");
        setUploading(false);
        return;
      }

      const toProcess = pdfFiles.slice(0, slotsLeft);
      const newAttachments: ContentAttachment[] = [];

      for (const file of toProcess) {
        if (file.size > MAX_PDF_SIZE) {
          setPdfError(`"${file.name}" exceeds 2MB limit`);
          continue;
        }
        const dataUrl = await readFileAsDataUrl(file);
        newAttachments.push({
          id: crypto.randomUUID(),
          type: "pdf",
          dataUrl,
          name: file.name,
        });
      }

      setAttachments((prev) => [...prev, ...newAttachments]);
    } catch {
      setPdfError("Failed to process PDF");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    const imageFiles = new DataTransfer();
    const pdfFiles = new DataTransfer();
    Array.from(files).forEach((f) => {
      if (f.type.startsWith("image/")) imageFiles.items.add(f);
      else if (f.type === "application/pdf") pdfFiles.items.add(f);
    });
    if (imageFiles.files.length > 0) handleImageFiles(imageFiles.files);
    if (pdfFiles.files.length > 0) handlePdfFiles(pdfFiles.files);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSave = () => {
    onSave({
      caption,
      images,
      attachments,
      scheduledDate: scheduledDate || null,
      status,
      targets,
      source: post?.source,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">
            {isEditing ? "Edit Post" : "New Post"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Platform / Target multi-select */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">
              Post to (select one or more)
            </label>
            <div className="flex flex-wrap gap-2">
              {TARGET_OPTIONS.map((opt) => {
                const isActive = targets.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleTarget(opt.value)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? opt.activeClass
                        : `bg-slate-50 text-slate-500 border border-slate-200 ${opt.inactiveHover}`
                    }`}
                  >
                    {opt.icon === "linkedin" ? (
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                      </svg>
                    )}
                    <span>{opt.label}</span>
                    {opt.sublabel && (
                      <span className="text-[9px] opacity-60">
                        {opt.sublabel}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <FileText className="w-3.5 h-3.5" />
              Caption
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={8}
              placeholder="Write your post caption here..."
              className="w-full p-3 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            />
            <div className="flex items-center justify-between">
              {hasInstagram && targets.includes("linkedin") && (
                <span className="text-[10px] text-amber-500">
                  Using Instagram limit (2,200) since IG is selected
                </span>
              )}
              <span
                className={`text-[10px] font-medium ml-auto ${
                  charOverLimit ? "text-red-500" : "text-slate-400"
                }`}
              >
                {charCount.toLocaleString()} / {charLimit.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <ImagePlus className="w-3.5 h-3.5" />
              Images ({images.length}/4)
            </label>

            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className="relative group rounded-xl overflow-hidden aspect-video"
                  >
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${img})` }}
                    />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {images.length < 4 && (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                  dragOver
                    ? "border-indigo-400 bg-indigo-50"
                    : "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30"
                }`}
              >
                {uploading ? (
                  <span className="text-xs text-slate-500">Processing...</span>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-slate-400" />
                    <span className="text-xs text-slate-500">
                      Drop images or PDFs here, or click to upload images
                    </span>
                  </>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleImageFiles(e.target.files)}
                />
              </div>
            )}
          </div>

          {/* PDFs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <FileUp className="w-3.5 h-3.5" />
                PDF Documents ({pdfCount}/3)
              </label>
              {pdfCount < 3 && (
                <button
                  onClick={() => pdfRef.current?.click()}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                >
                  <FileUp className="w-3 h-3" />
                  Add PDF
                </button>
              )}
              <input
                ref={pdfRef}
                type="file"
                accept="application/pdf"
                multiple
                className="hidden"
                onChange={(e) => handlePdfFiles(e.target.files)}
              />
            </div>

            {pdfError && (
              <p className="text-[11px] text-red-500">{pdfError}</p>
            )}

            {attachments.filter((a) => a.type === "pdf").length > 0 && (
              <div className="space-y-1.5">
                {attachments
                  .filter((a) => a.type === "pdf")
                  .map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between px-3 py-2.5 bg-red-50/60 border border-red-100 rounded-xl group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-red-500" />
                        </div>
                        <span className="text-xs font-medium text-slate-700 truncate">
                          {att.name}
                        </span>
                      </div>
                      <button
                        onClick={() => removeAttachment(att.id)}
                        className="p-1 hover:bg-red-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3 h-3 text-red-500" />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Date + Status row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <CalendarDays className="w-3.5 h-3.5" />
                Scheduled Date
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
              />
              {/* Date scheduling info */}
              {scheduledDate && adjustedCount > 0 && (
                <div className="flex items-center gap-1.5 text-[11px] text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-lg">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span>
                    {adjustedCount} post{adjustedCount > 1 ? "s" : ""} already
                    on this date
                  </span>
                </div>
              )}
              {scheduledDate && adjustedCount > 0 && nextAvailableDate && (
                <button
                  onClick={() => setScheduledDate(nextAvailableDate)}
                  className="flex items-center gap-1.5 text-[11px] text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                >
                  <Zap className="w-3 h-3" />
                  Next free:{" "}
                  {format(parseISO(nextAvailableDate), "MMM d, yyyy")}
                </button>
              )}
              {!scheduledDate && nextAvailableDate && Object.keys(scheduledDates).length > 0 && (
                <button
                  onClick={() => setScheduledDate(nextAvailableDate)}
                  className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-indigo-600 font-medium transition-colors"
                >
                  <Zap className="w-3 h-3" />
                  Suggest:{" "}
                  {format(parseISO(nextAvailableDate), "MMM d, yyyy")}
                </button>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">
                Status
              </label>
              <div className="flex gap-1.5">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setStatus(opt.value)}
                    className={`flex-1 px-2 py-2 rounded-lg text-[11px] font-medium transition-all ${
                      status === opt.value
                        ? opt.color === "slate"
                          ? "bg-slate-700 text-white"
                          : opt.color === "blue"
                          ? "bg-blue-600 text-white"
                          : "bg-emerald-600 text-white"
                        : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Source badge */}
          {post?.source && (
            <div className="text-[10px] text-slate-400">
              Source:{" "}
              {post.source.type === "quote"
                ? "Quote"
                : post.source.type === "news"
                ? "AI News"
                : "Custom"}
              {post.source.title && ` — ${post.source.title}`}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50">
          <div>
            {isEditing && onDelete && (
              <>
                {showDeleteConfirm ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-600">
                      Delete this post?
                    </span>
                    <button
                      onClick={() => {
                        onDelete(post.id);
                        onClose();
                      }}
                      className="px-3 py-1.5 text-[11px] font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    >
                      Yes, delete
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                )}
              </>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={
                (!caption.trim() &&
                  images.length === 0 &&
                  attachments.length === 0) ||
                targets.length === 0
              }
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isEditing ? "Update" : "Save Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
