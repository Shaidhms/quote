"use client";

import { useState } from "react";
import { ContentPost } from "@/types";
import { renderCaptionText, stripMarkdownBold } from "@/lib/captionUtils";
import { formatDistanceToNow, parseISO } from "date-fns";
import {
  X,
  ThumbsUp,
  MessageCircle,
  Repeat2,
  Send,
  Globe,
  Pencil,
  Copy,
  Check,
  CalendarDays,
  FileText,
  ChevronDown,
  ChevronUp,
  Heart,
  Bookmark,
  Download,
} from "lucide-react";
import { downloadImage, downloadAllImages, downloadImageWithWatermark, downloadAllImagesWithWatermark, WatermarkConfig } from "@/lib/imageUtils";

interface PostPreviewProps {
  post: ContentPost;
  profileImage: string;
  displayName: string;
  onEdit: () => void;
  onClose: () => void;
  watermark?: WatermarkConfig;
}

export default function PostPreview({
  post,
  profileImage,
  displayName,
  onEdit,
  onClose,
  watermark,
}: PostPreviewProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const name = displayName || "Your Name";
  const lines = post.caption.split("\n");
  const isLong = lines.length > 5 || post.caption.length > 300;
  const previewText = isLong && !expanded
    ? lines.slice(0, 5).join("\n")
    : post.caption;

  const handleDownloadImage = (dataUrl: string, filename: string) => {
    if (watermark?.watermark_image_url) {
      downloadImageWithWatermark(dataUrl, watermark, filename);
    } else {
      downloadImage(dataUrl, filename);
    }
  };

  const handleDownloadAll = () => {
    if (watermark?.watermark_image_url) {
      downloadAllImagesWithWatermark(post.images, watermark, "post");
    } else {
      downloadAllImages(post.images, "post");
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(stripMarkdownBold(post.caption));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pdfs = post.attachments?.filter((a) => a.type === "pdf") ?? [];
  const igTargets = (post.targets ?? []).filter((t) => t.startsWith("instagram"));
  const isInstagram = igTargets.length > 0 && !post.targets?.includes("linkedin");
  const igHandle = igTargets.length > 0
    ? igTargets[0] === "instagram_ai360withshaid" ? "ai360withshaid" : "meshaid"
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-slate-50 transition-colors"
        >
          <X className="w-4 h-4 text-slate-600" />
        </button>

        <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
          {/* Targets bar — shows which platforms this post is for */}
          {post.targets && post.targets.length > 1 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border-b border-slate-100">
              <span className="text-[10px] text-slate-400 font-medium">Posting to:</span>
              <div className="flex items-center gap-1.5">
                {post.targets.includes("linkedin") && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#0A66C2] bg-blue-50 px-2 py-0.5 rounded-full">
                    LinkedIn
                  </span>
                )}
                {post.targets.includes("instagram_meshaid") && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">
                    @meshaid
                  </span>
                )}
                {post.targets.includes("instagram_ai360withshaid") && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">
                    @ai360withshaid
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {isInstagram ? (
              /* ========== Instagram Preview ========== */
              <>
                {/* IG Header */}
                <div className="px-3 py-2.5 flex items-center gap-3 border-b border-slate-100">
                  {profileImage ? (
                    <div className="w-8 h-8 rounded-full bg-cover bg-center flex-shrink-0 ring-2 ring-pink-400 ring-offset-1"
                      style={{ backgroundImage: `url(${profileImage})` }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs ring-2 ring-pink-400 ring-offset-1">
                      {name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-900 leading-tight">
                      {igHandle ? `@${igHandle}` : name}
                    </p>
                    {igHandle && (
                      <p className="text-[10px] text-slate-400">
                        {igHandle === "ai360withshaid" ? "AI Content" : "Personal"}
                      </p>
                    )}
                  </div>
                  <svg className="w-5 h-5 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="6" r="1.5"/>
                    <circle cx="12" cy="12" r="1.5"/>
                    <circle cx="12" cy="18" r="1.5"/>
                  </svg>
                </div>

                {/* IG Image — square */}
                {post.images.length > 0 ? (
                  <div className="relative group/img">
                    <div
                      className="w-full aspect-square bg-cover bg-center"
                      style={{ backgroundImage: `url(${post.images[0]})` }}
                    />
                    {post.images.length > 1 && (
                      <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                        1/{post.images.length}
                      </div>
                    )}
                    <button
                      onClick={() => handleDownloadImage(post.images[0], `post-image-1.jpg`)}
                      className="absolute bottom-3 right-3 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-100 sm:opacity-0 sm:group-hover/img:opacity-100 transition-opacity"
                      title="Download image"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-full aspect-square bg-gradient-to-br from-purple-100 via-pink-50 to-orange-50 flex items-center justify-center">
                    <span className="text-slate-300 text-sm">No image</span>
                  </div>
                )}

                {/* IG Action bar */}
                <div className="px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Heart className="w-6 h-6 text-slate-800" />
                    <MessageCircle className="w-6 h-6 text-slate-800 -scale-x-100" />
                    <Send className="w-6 h-6 text-slate-800" />
                  </div>
                  <Bookmark className="w-6 h-6 text-slate-800" />
                </div>

                {/* IG Likes preview */}
                <div className="px-3 pb-1">
                  <p className="text-[13px] font-semibold text-slate-900">
                    Preview
                  </p>
                </div>

                {/* IG Caption */}
                <div className="px-3 pb-3">
                  <div className="text-[13px] text-slate-800 leading-[1.4]">
                    <span className="font-semibold mr-1.5">
                      {igHandle ? `@${igHandle}` : name}
                    </span>
                    <span className="whitespace-pre-line">
                      {renderCaptionText(previewText)}
                      {isLong && !expanded && (
                        <span className="text-slate-400">...</span>
                      )}
                    </span>
                  </div>
                  {isLong && (
                    <button
                      onClick={() => setExpanded(!expanded)}
                      className="mt-0.5 text-[12px] font-medium text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {expanded ? "less" : "more"}
                    </button>
                  )}
                </div>

                {/* IG Timestamp */}
                <div className="px-3 pb-3">
                  {post.scheduledDate ? (
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wide">
                      <CalendarDays className="w-3 h-3" />
                      Scheduled{" "}
                      {new Date(post.scheduledDate + "T00:00:00").toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" }
                      )}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 uppercase tracking-wide">
                      Just now
                    </span>
                  )}
                </div>
              </>
            ) : (
              /* ========== LinkedIn Preview ========== */
              <>
                {/* Post header — profile */}
                <div className="px-4 pt-4 pb-2">
                  <div className="flex items-start gap-3">
                    {profileImage ? (
                      <div
                        className="w-12 h-12 rounded-full bg-cover bg-center flex-shrink-0 border-2 border-slate-100"
                        style={{ backgroundImage: `url(${profileImage})` }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 leading-tight">
                        {name}
                      </p>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        LinkedIn Content Creator
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {post.scheduledDate ? (
                          <span className="text-[11px] text-slate-400">
                            {formatDistanceToNow(parseISO(post.scheduledDate), {
                              addSuffix: false,
                            })}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Just now</span>
                        )}
                        <span className="text-[11px] text-slate-300">&middot;</span>
                        <Globe className="w-3 h-3 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Caption */}
                <div className="px-4 pb-3">
                  <div className="text-[13.5px] text-slate-800 leading-[1.45] whitespace-pre-line">
                    {renderCaptionText(previewText)}
                    {isLong && !expanded && (
                      <span className="text-slate-400">...</span>
                    )}
                  </div>
                  {isLong && (
                    <button
                      onClick={() => setExpanded(!expanded)}
                      className="flex items-center gap-1 mt-1 text-[12px] font-medium text-slate-500 hover:text-blue-600 transition-colors"
                    >
                      {expanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" /> Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" /> ...see more
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Images — LinkedIn layout */}
                {post.images.length > 0 && (
                  <div className="border-t border-slate-100">
                    {post.images.length === 1 ? (
                      <div className="relative group/img bg-slate-50">
                        <img
                          src={post.images[0]}
                          alt="Post image"
                          className="w-full max-h-[400px] object-contain"
                        />
                        <button
                          onClick={() => handleDownloadImage(post.images[0], `post-image-1.jpg`)}
                          className="absolute bottom-3 right-3 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-100 sm:opacity-0 sm:group-hover/img:opacity-100 transition-opacity"
                          title="Download image"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ) : post.images.length === 2 ? (
                      <div className="flex gap-0.5">
                        {post.images.map((img, i) => (
                          <div key={i} className="relative flex-1 group/img bg-slate-50">
                            <img
                              src={img}
                              alt={`Post image ${i + 1}`}
                              className="w-full aspect-square object-contain"
                            />
                            <button
                              onClick={() => handleDownloadImage(img, `post-image-${i + 1}.jpg`)}
                              className="absolute bottom-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-100 sm:opacity-0 sm:group-hover/img:opacity-100 transition-opacity"
                              title="Download image"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : post.images.length === 3 ? (
                      <div className="flex gap-0.5">
                        <div className="relative flex-1 group/img bg-slate-50">
                          <img
                            src={post.images[0]}
                            alt="Post image 1"
                            className="w-full aspect-square object-contain"
                          />
                          <button
                            onClick={() => handleDownloadImage(post.images[0], `post-image-1.jpg`)}
                            className="absolute bottom-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-100 sm:opacity-0 sm:group-hover/img:opacity-100 transition-opacity"
                            title="Download image"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex-1 flex flex-col gap-0.5">
                          {post.images.slice(1).map((img, i) => (
                            <div key={i} className="relative flex-1 group/img bg-slate-50">
                              <img
                                src={img}
                                alt={`Post image ${i + 2}`}
                                className="w-full h-full object-contain"
                              />
                              <button
                                onClick={() => downloadImage(img, `post-image-${i + 2}.jpg`)}
                                className="absolute bottom-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-100 sm:opacity-0 sm:group-hover/img:opacity-100 transition-opacity"
                                title="Download image"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-0.5">
                        {post.images.map((img, i) => (
                          <div key={i} className="relative group/img bg-slate-50">
                            <img
                              src={img}
                              alt={`Post image ${i + 1}`}
                              className="w-full aspect-square object-contain"
                            />
                            <button
                              onClick={() => handleDownloadImage(img, `post-image-${i + 1}.jpg`)}
                              className="absolute bottom-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-100 sm:opacity-0 sm:group-hover/img:opacity-100 transition-opacity"
                              title="Download image"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* PDF attachments */}
                {pdfs.length > 0 && (
                  <div className="px-4 py-3 border-t border-slate-100 space-y-2">
                    {pdfs.map((pdf) => (
                      <div
                        key={pdf.id}
                        className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                      >
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-red-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-slate-700 truncate">
                            {pdf.name}
                          </p>
                          <p className="text-[10px] text-slate-400">PDF Document</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Engagement stats (mock) */}
                <div className="px-4 py-2 flex items-center justify-between border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <div className="flex -space-x-1">
                      <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                        <ThumbsUp className="w-2.5 h-2.5 text-white" />
                      </span>
                      <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[8px]">
                        &#10084;&#65039;
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 ml-1">
                      Preview
                    </span>
                  </div>
                  {post.scheduledDate && (
                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                      <CalendarDays className="w-3 h-3" />
                      Scheduled for{" "}
                      {new Date(post.scheduledDate + "T00:00:00").toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" }
                      )}
                    </span>
                  )}
                </div>

                {/* LinkedIn action bar */}
                <div className="flex border-t border-slate-200">
                  {[
                    { icon: ThumbsUp, label: "Like" },
                    { icon: MessageCircle, label: "Comment" },
                    { icon: Repeat2, label: "Repost" },
                    { icon: Send, label: "Send" },
                  ].map(({ icon: Icon, label }) => (
                    <button
                      key={label}
                      className="flex-1 flex items-center justify-center gap-1.5 py-3 text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-xs font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Bottom action bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-t border-slate-100 bg-slate-50/80">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white rounded-lg transition-all shadow-sm ${
                isInstagram
                  ? "bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Caption
                </>
              )}
            </button>
            {post.images.length > 0 && (
              <button
                onClick={handleDownloadAll}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                {post.images.length === 1 ? "Download Image" : `Download ${post.images.length} Images`}
              </button>
            )}
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
