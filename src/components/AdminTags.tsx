import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  AlertTriangle,
  RefreshCw,
  Hash
} from "lucide-react";
import { useLanguage } from "../i18n.js";
import { Tag, Post } from "../types.js";

export function AdminTags() {
  const { t } = useLanguage();
  
  // Data State
  const [tags, setTags] = useState<Tag[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Create Form State
  const [createName, setCreateName] = useState("");
  const [createSlug, setCreateSlug] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Edit Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");

  // Delete Dialog State
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [tagRes, postsRes] = await Promise.all([
        fetch("/api/tags"),
        fetch("/api/posts?status=") // Fetch all posts to count assignments
      ]);

      if (!tagRes.ok || !postsRes.ok) {
        throw new Error("Failed to load tag metadata from server");
      }

      const tagData = await tagRes.json();
      const postsData = await postsRes.json();

      setTags(tagData || []);
      setPosts(postsData.posts || []);
    } catch (err: any) {
      setError(err.message || "Error occurred while fetching tag data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName) return;

    try {
      setError("");
      setMessage("");
      const token = localStorage.getItem("accessToken");
      
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: createName,
          slug: createSlug || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not create tag");
      }

      setCreateName("");
      setCreateSlug("");
      setIsCreating(false);
      setMessage(t("tags_save_success") || "Tag created successfully!");
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName) return;

    try {
      setError("");
      setMessage("");
      const token = localStorage.getItem("accessToken");
      
      const res = await fetch(`/api/tags/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editName,
          slug: editSlug || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not update tag");
      }

      setEditingId(null);
      setMessage(t("tags_save_success") || "Tag updated successfully!");
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!deletingTag) return;

    try {
      setError("");
      setMessage("");
      const token = localStorage.getItem("accessToken");
      
      const res = await fetch(`/api/tags/${deletingTag.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not delete tag");
      }

      setDeletingTag(null);
      setMessage(t("tags_delete_success") || "Tag deleted successfully!");
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const startEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditSlug(tag.slug);
  };

  const getPostCount = (tagId: string) => {
    return posts.filter(p => p.tags && p.tags.some((t: any) => t.id === tagId)).length;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-start">
          <h2 className="text-2xl font-extrabold text-neutral-900 font-display tracking-tight">{t("tags_title")}</h2>
          <p className="text-xs text-neutral-500">{t("tags_subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsCreating(prev => !prev)}
            className="inline-flex items-center px-4 py-2.5 rounded-lg bg-neutral-950 text-white font-semibold text-xs hover:bg-brand transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 me-1.5" /> {t("tags_new")}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-150 rounded-xl flex items-center text-xs text-red-700 text-start">
          <AlertTriangle className="w-5 h-5 me-2 shrink-0 animate-pulse" />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-150 rounded-xl flex items-center text-xs text-emerald-700 text-start">
          <Check className="w-5 h-5 me-2 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Tag Creation card */}
      {isCreating && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs text-start space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <h4 className="text-sm font-bold text-neutral-900">{t("tags_new")}</h4>
            <button onClick={() => setIsCreating(false)} className="text-neutral-400 hover:text-neutral-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 block">{t("tags_name")}</label>
              <input
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="e.g. Docker"
                required
                className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-brand focus:bg-white text-start"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 block">{t("tags_slug")}</label>
              <input
                type="text"
                value={createSlug}
                onChange={(e) => setCreateSlug(e.target.value)}
                placeholder="e.g. docker"
                className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-brand focus:bg-white text-start font-mono"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-lg transition-all shadow-md cursor-pointer flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>{t("tags_create_btn")}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="py-2.5 px-4 border border-neutral-200 text-neutral-700 text-xs font-bold rounded-lg hover:bg-neutral-50 cursor-pointer"
              >
                {t("categories_cancel")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingTag && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-neutral-200 rounded-2xl max-w-lg w-full p-6 shadow-xl text-start space-y-4">
            <div className="flex items-center gap-2 text-red-600 border-b border-neutral-100 pb-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h4 className="text-base font-extrabold tracking-tight">
                {t("categories_delete")}: {deletingTag.name}
              </h4>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed font-medium">
              {t("tags_delete_confirm")}
            </p>

            <div className="flex gap-2 justify-end pt-4 border-t border-neutral-100">
              <button
                onClick={handleDelete}
                className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer"
              >
                {t("categories_delete_btn")}
              </button>
              <button
                onClick={() => setDeletingTag(null)}
                className="py-2 px-4 border border-neutral-200 text-neutral-700 text-xs font-bold rounded-lg hover:bg-neutral-50 cursor-pointer"
              >
                {t("categories_cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List Container */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 text-center text-neutral-500 font-medium">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
            <span>{t("dashboard_loading")}</span>
          </div>
        ) : tags.length === 0 ? (
          <div className="p-16 text-center text-neutral-500 font-medium">
            No tags created yet. Click New Tag to start.
          </div>
        ) : (
          <div className="p-6 space-y-3">
            {tags.map((tag) => {
              const isEditing = editingId === tag.id;
              const postCount = getPostCount(tag.id);

              return (
                <div 
                  key={tag.id}
                  className="flex items-center justify-between p-3 border border-neutral-150 rounded-xl bg-white hover:bg-neutral-50/50 transition-colors shadow-2xs"
                >
                  {isEditing ? (
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder={t("tags_name")}
                          required
                          className="w-full text-xs bg-neutral-50 border border-neutral-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand focus:bg-white text-start"
                        />
                      </div>
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={editSlug}
                          onChange={(e) => setEditSlug(e.target.value)}
                          placeholder={t("tags_slug")}
                          className="w-full text-xs bg-neutral-50 border border-neutral-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand focus:bg-white text-start font-mono"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleUpdate(tag.id)}
                          className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-2xs"
                          title={t("categories_save")}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 bg-neutral-200 text-neutral-600 rounded-lg hover:bg-neutral-300 transition-colors"
                          title={t("categories_cancel")}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <Hash className="w-4 h-4 text-neutral-400" />
                        <div className="text-start">
                          <span className="font-bold text-sm text-neutral-900 block">{tag.name}</span>
                          <span className="text-[10px] font-mono text-neutral-400">#{tag.slug}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">
                          {postCount} posts
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => startEdit(tag)}
                          className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-brand transition-colors"
                          title={t("categories_edit")}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingTag(tag)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-700 transition-colors"
                          title={t("categories_delete")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
