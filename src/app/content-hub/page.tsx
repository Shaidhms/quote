"use client";

import { useState, useMemo } from "react";
import { useContentPosts } from "@/hooks/useContentPosts";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useIdeas } from "@/hooks/useIdeas";
import {
  ContentPost,
  ContentAttachment,
  ContentIdea,
  PostTarget,
} from "@/types";
import ContentListView from "@/components/content-hub/ContentListView";
import ContentCalendar from "@/components/content-hub/ContentCalendar";
import PostEditor from "@/components/content-hub/PostEditor";
import PostPreview from "@/components/content-hub/PostPreview";
import IdeasPanel from "@/components/content-hub/IdeasPanel";
import Link from "next/link";
import {
  ArrowLeft,
  LayoutGrid,
  Plus,
  CalendarDays,
  List,
  Sparkles,
  Lightbulb,
} from "lucide-react";

type View = "list" | "calendar" | "ideas";

export default function ContentHubPage() {
  const {
    posts,
    allPosts,
    filter,
    setFilter,
    addPost,
    updatePost,
    deletePost,
    updateStatus,
    counts,
  } = useContentPosts();

  const { settings } = useUserSettings();

  const {
    ideas,
    searchQuery,
    setSearchQuery,
    addIdea,
    updateIdea,
    deleteIdea,
    markConverted,
  } = useIdeas();

  const [view, setView] = useState<View>("list");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<ContentPost | undefined>();
  const [prefillDate, setPrefillDate] = useState<string | null>(null);
  const [prefillCaption, setPrefillCaption] = useState<string | null>(null);
  const [convertingIdeaId, setConvertingIdeaId] = useState<string | null>(null);
  const [previewPost, setPreviewPost] = useState<ContentPost | null>(null);

  const openNewPost = (date?: string) => {
    setEditingPost(undefined);
    setPrefillDate(date ?? null);
    setPrefillCaption(null);
    setConvertingIdeaId(null);
    setEditorOpen(true);
  };

  const openEditPost = (post: ContentPost) => {
    setPreviewPost(null);
    setEditingPost(post);
    setPrefillDate(null);
    setPrefillCaption(null);
    setConvertingIdeaId(null);
    setEditorOpen(true);
  };

  const openPreview = (post: ContentPost) => {
    setPreviewPost(post);
  };

  const openPostFromIdea = (idea: ContentIdea) => {
    setEditingPost(undefined);
    setPrefillDate(null);
    setPrefillCaption(idea.text);
    setConvertingIdeaId(idea.id);
    setEditorOpen(true);
  };

  // Build a map of date → post count for the date picker
  const scheduledDates = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of allPosts) {
      if (p.scheduledDate) {
        map[p.scheduledDate] = (map[p.scheduledDate] ?? 0) + 1;
      }
    }
    return map;
  }, [allPosts]);

  const handleSave = (data: {
    caption: string;
    images: string[];
    attachments: ContentAttachment[];
    scheduledDate: string | null;
    status: "draft" | "scheduled" | "posted";
    targets: PostTarget[];
    source?: { type: "quote" | "news" | "custom"; title?: string };
  }) => {
    if (editingPost) {
      updatePost(editingPost.id, data);
    } else {
      addPost(data);
      // If converting from an idea, mark it
      if (convertingIdeaId) {
        markConverted(convertingIdeaId, "saved");
      }
    }
    setEditorOpen(false);
    setEditingPost(undefined);
    setPrefillCaption(null);
    setConvertingIdeaId(null);
  };

  const handleDelete = (id: string) => {
    deletePost(id);
    setEditorOpen(false);
    setEditingPost(undefined);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <LayoutGrid className="w-5 h-5 text-white" />
                </div>
                <Sparkles className="w-3 h-3 text-amber-400 absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">
                  Content Hub
                </h1>
                <p className="text-xs text-slate-500">
                  Plan, organize & track your LinkedIn posts
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex bg-slate-100 rounded-xl p-0.5">
              <button
                onClick={() => setView("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  view === "list"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                List
              </button>
              <button
                onClick={() => setView("calendar")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  view === "calendar"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                Calendar
              </button>
              <button
                onClick={() => setView("ideas")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  view === "ideas"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                Ideas
              </button>
            </div>

            {/* New Post button */}
            {view !== "ideas" && (
              <button
                onClick={() => openNewPost()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl transition-all shadow-md shadow-indigo-500/20"
              >
                <Plus className="w-4 h-4" />
                New Post
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {view === "list" ? (
          <ContentListView
            posts={posts}
            filter={filter}
            onSetFilter={setFilter}
            counts={counts}
            onSelect={openPreview}
            onEdit={openEditPost}
            onMarkPosted={(id) => updateStatus(id, "posted")}
            onDelete={deletePost}
          />
        ) : view === "calendar" ? (
          <ContentCalendar
            posts={allPosts}
            onSelectDate={(date) => openNewPost(date)}
            onSelectPost={openPreview}
          />
        ) : (
          <IdeasPanel
            ideas={ideas}
            searchQuery={searchQuery}
            onSetSearchQuery={setSearchQuery}
            onAddIdea={addIdea}
            onUpdateIdea={updateIdea}
            onDeleteIdea={deleteIdea}
            onCreatePost={openPostFromIdea}
          />
        )}
      </main>

      {/* LinkedIn-style Post Preview */}
      {previewPost && !editorOpen && (
        <PostPreview
          post={previewPost}
          profileImage={settings.profile_image_url}
          displayName={settings.display_name}
          onEdit={() => openEditPost(previewPost)}
          onClose={() => setPreviewPost(null)}
        />
      )}

      {/* Post Editor Modal */}
      {editorOpen && (
        <PostEditor
          post={
            editingPost
              ? editingPost
              : prefillDate || prefillCaption
              ? ({
                  caption: prefillCaption ?? "",
                  images: [],
                  scheduledDate: prefillDate,
                  status: prefillDate ? "scheduled" : "draft",
                  targets: ["linkedin"],
                  createdAt: "",
                  updatedAt: "",
                  id: "",
                } as ContentPost)
              : undefined
          }
          scheduledDates={scheduledDates}
          onSave={handleSave}
          onDelete={editingPost ? handleDelete : undefined}
          onClose={() => {
            setEditorOpen(false);
            setEditingPost(undefined);
            setPrefillCaption(null);
            setConvertingIdeaId(null);
          }}
        />
      )}
    </div>
  );
}
