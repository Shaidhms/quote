"use client";

import { useState } from "react";
import { ContentPost, ContentHubFilter, PostTarget } from "@/types";
import PostCard from "./PostCard";
import {
  Inbox,
  FileEdit,
  Clock,
  CheckCircle,
  LayoutGrid,
} from "lucide-react";

interface ContentListViewProps {
  posts: ContentPost[];
  filter: ContentHubFilter;
  onSetFilter: (f: ContentHubFilter) => void;
  counts: Record<ContentHubFilter, number>;
  onSelect: (post: ContentPost) => void;
  onEdit: (post: ContentPost) => void;
  onMarkTargetPosted: (id: string, target: PostTarget) => void;
  onDelete: (id: string) => void;
}

const FILTERS: {
  value: ContentHubFilter;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "all", label: "All", icon: LayoutGrid },
  { value: "draft", label: "Drafts", icon: FileEdit },
  { value: "scheduled", label: "Scheduled", icon: Clock },
  { value: "posted", label: "Posted", icon: CheckCircle },
];

type PlatformFilter = "all" | PostTarget;

const PLATFORM_FILTERS: {
  value: PlatformFilter;
  label: string;
  color: string;
  activeColor: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "all",
    label: "All Platforms",
    color: "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
    activeColor: "bg-slate-800 text-white shadow-md",
    icon: null,
  },
  {
    value: "linkedin",
    label: "LinkedIn",
    color: "bg-white text-slate-600 border border-slate-200 hover:bg-blue-50 hover:text-[#0A66C2] hover:border-blue-200",
    activeColor: "bg-[#0A66C2] text-white shadow-md shadow-blue-500/20",
    icon: (
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    value: "instagram_meshaid",
    label: "@meshaid",
    color: "bg-white text-slate-600 border border-slate-200 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200",
    activeColor: "bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white shadow-md shadow-pink-500/20",
    icon: (
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
  },
  {
    value: "instagram_ai360withshaid",
    label: "@ai360withshaid",
    color: "bg-white text-slate-600 border border-slate-200 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200",
    activeColor: "bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white shadow-md shadow-pink-500/20",
    icon: (
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
  },
];

export default function ContentListView({
  posts,
  filter,
  onSetFilter,
  counts,
  onSelect,
  onEdit,
  onMarkTargetPosted,
  onDelete,
}: ContentListViewProps) {
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all");

  // Filter by platform target
  const platformFiltered = platformFilter === "all"
    ? posts
    : posts.filter((p) => p.targets.includes(platformFilter));

  // Sort: scheduled date ascending (nearest first), then newest created
  const sorted = [...platformFiltered].sort((a, b) => {
    if (a.scheduledDate && b.scheduledDate) {
      return a.scheduledDate.localeCompare(b.scheduledDate);
    }
    if (a.scheduledDate) return -1;
    if (b.scheduledDate) return 1;
    return b.createdAt.localeCompare(a.createdAt);
  });

  // Platform counts (within current status filter)
  const platformCounts: Record<PlatformFilter, number> = {
    all: posts.length,
    linkedin: posts.filter((p) => p.targets.includes("linkedin")).length,
    instagram_meshaid: posts.filter((p) => p.targets.includes("instagram_meshaid")).length,
    instagram_ai360withshaid: posts.filter((p) => p.targets.includes("instagram_ai360withshaid")).length,
  };

  return (
    <div className="space-y-4">
      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => onSetFilter(f.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f.value
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
            }`}
          >
            <f.icon className="w-3 h-3" />
            {f.label}
            <span
              className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold leading-none ${
                filter === f.value
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {counts[f.value]}
            </span>
          </button>
        ))}
      </div>

      {/* Platform filter tabs */}
      <div className="flex flex-wrap gap-1.5">
        {PLATFORM_FILTERS.map((pf) => (
          <button
            key={pf.value}
            onClick={() => setPlatformFilter(pf.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
              platformFilter === pf.value ? pf.activeColor : pf.color
            }`}
          >
            {pf.icon}
            {pf.label}
            {platformCounts[pf.value] > 0 && (
              <span
                className={`px-1.5 py-0.5 text-[9px] rounded-full font-bold leading-none ${
                  platformFilter === pf.value
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {platformCounts[pf.value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Posts grid */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
            <Inbox className="w-7 h-7 text-slate-300" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-500">
              {platformFilter !== "all"
                ? `No ${PLATFORM_FILTERS.find((p) => p.value === platformFilter)?.label} posts`
                : filter === "all"
                ? "No posts yet"
                : `No ${filter} posts`}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Create your first post to get started
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sorted.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onSelect={onSelect}
              onEdit={onEdit}
              onMarkTargetPosted={onMarkTargetPosted}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
