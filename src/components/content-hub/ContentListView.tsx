"use client";

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
  // Sort: scheduled date ascending (nearest first), then newest created
  const sorted = [...posts].sort((a, b) => {
    if (a.scheduledDate && b.scheduledDate) {
      return a.scheduledDate.localeCompare(b.scheduledDate);
    }
    if (a.scheduledDate) return -1;
    if (b.scheduledDate) return 1;
    return b.createdAt.localeCompare(a.createdAt);
  });

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
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

      {/* Posts grid */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
            <Inbox className="w-7 h-7 text-slate-300" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-500">
              {filter === "all"
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
