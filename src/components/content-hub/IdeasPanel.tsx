"use client";

import { useState } from "react";
import { ContentIdea } from "@/types";
import { formatDistanceToNow, parseISO } from "date-fns";
import {
  Lightbulb,
  Plus,
  Search,
  Trash2,
  Pencil,
  FileOutput,
  Check,
  X,
  Sparkles,
} from "lucide-react";

interface IdeasPanelProps {
  ideas: ContentIdea[];
  searchQuery: string;
  onSetSearchQuery: (q: string) => void;
  onAddIdea: (text: string, tags?: string[]) => void;
  onUpdateIdea: (
    id: string,
    changes: Partial<Omit<ContentIdea, "id" | "createdAt">>
  ) => void;
  onDeleteIdea: (id: string) => void;
  onCreatePost: (idea: ContentIdea) => void;
}

function parseTags(text: string): { cleanText: string; tags: string[] } {
  const tagRegex = /#(\w+)/g;
  const tags: string[] = [];
  let match;
  while ((match = tagRegex.exec(text)) !== null) {
    tags.push(match[1]);
  }
  const cleanText = text.replace(tagRegex, "").trim();
  return { cleanText, tags };
}

export default function IdeasPanel({
  ideas,
  searchQuery,
  onSetSearchQuery,
  onAddIdea,
  onUpdateIdea,
  onDeleteIdea,
  onCreatePost,
}: IdeasPanelProps) {
  const [newIdeaText, setNewIdeaText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const handleAdd = () => {
    const text = newIdeaText.trim();
    if (!text) return;
    const { cleanText, tags } = parseTags(text);
    onAddIdea(cleanText || text, tags.length > 0 ? tags : undefined);
    setNewIdeaText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  };

  const startEdit = (idea: ContentIdea) => {
    setEditingId(idea.id);
    const tagStr = idea.tags?.map((t) => `#${t}`).join(" ") ?? "";
    setEditText(idea.text + (tagStr ? " " + tagStr : ""));
  };

  const saveEdit = (id: string) => {
    const text = editText.trim();
    if (!text) return;
    const { cleanText, tags } = parseTags(text);
    onUpdateIdea(id, {
      text: cleanText || text,
      tags: tags.length > 0 ? tags : undefined,
    });
    setEditingId(null);
    setEditText("");
  };

  // Collect all tags for filter pills
  const allTags = Array.from(
    new Set(ideas.flatMap((i) => i.tags ?? []))
  ).sort();

  return (
    <div className="space-y-4">
      {/* Quick-add bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Braindump Ideas
            </h3>
            <p className="text-[10px] text-slate-400">
              Jot down ideas, add #tags — press Enter to save
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <textarea
            value={newIdeaText}
            onChange={(e) => setNewIdeaText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Write a post idea... use #tags to categorize (e.g. #AI #career)"
            className="flex-1 p-3 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all"
          />
          <button
            onClick={handleAdd}
            disabled={!newIdeaText.trim()}
            className="self-end px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search + tag filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSetSearchQuery(e.target.value)}
            placeholder="Search ideas..."
            className="w-full pl-9 pr-3 py-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all"
          />
        </div>
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() =>
                  onSetSearchQuery(searchQuery === tag ? "" : tag)
                }
                className={`px-2 py-1 text-[10px] font-medium rounded-full transition-all ${
                  searchQuery === tag
                    ? "bg-amber-100 text-amber-700 border border-amber-200"
                    : "bg-slate-100 text-slate-500 hover:bg-amber-50 hover:text-amber-600"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Ideas list */}
      {ideas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-amber-300" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-500">
              {searchQuery ? "No matching ideas" : "No ideas yet"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {searchQuery
                ? "Try a different search term"
                : "Jot down your content ideas above"}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className={`bg-white rounded-xl border shadow-sm p-4 transition-all ${
                idea.convertedToPostId
                  ? "border-emerald-200/80 bg-emerald-50/30"
                  : "border-slate-200/80 hover:shadow-md"
              }`}
            >
              {editingId === idea.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={3}
                    className="w-full p-2.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => saveEdit(idea.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors"
                    >
                      <Check className="w-3 h-3" /> Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <X className="w-3 h-3" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-line">
                    {idea.text}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      {idea.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 text-[9px] font-medium bg-amber-50 text-amber-600 rounded-full border border-amber-100"
                        >
                          #{tag}
                        </span>
                      ))}
                      <span className="text-[10px] text-slate-400">
                        {formatDistanceToNow(parseISO(idea.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                      {idea.convertedToPostId && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                          <Check className="w-3 h-3" /> Post created
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {!idea.convertedToPostId && (
                        <button
                          onClick={() => onCreatePost(idea)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <FileOutput className="w-3 h-3" /> Create Post
                        </button>
                      )}
                      <button
                        onClick={() => startEdit(idea)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onDeleteIdea(idea.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
