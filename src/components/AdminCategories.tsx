import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  ChevronRight, 
  ChevronDown, 
  CornerDownRight, 
  Folder, 
  FolderOpen, 
  Check, 
  X, 
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { useLanguage } from "../i18n.js";
import { Category, Post } from "../types.js";

interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

export function AdminCategories() {
  const { t, locale } = useLanguage();
  
  // Data State
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // UI Interactive State
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  
  // Create Form State
  const [createParentId, setCreateParentId] = useState<string | null>(null);
  const [createName, setCreateName] = useState("");
  const [createSlug, setCreateSlug] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Edit Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editParentId, setEditParentId] = useState<string | null>(null);

  // Delete Dialog State
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [reassignCategoryId, setReassignCategoryId] = useState<string>("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [catRes, postsRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/posts?status=") // Fetch all posts to count assignments
      ]);

      if (!catRes.ok || !postsRes.ok) {
        throw new Error("Failed to load category metadata from server");
      }

      const catData = await catRes.json();
      const postsData = await postsRes.json();

      setCategories(catData || []);
      setPosts(postsData.posts || []);

      // Expand all nodes by default
      const initialExpanded: Record<string, boolean> = {};
      catData.forEach((c: Category) => {
        initialExpanded[c.id] = true;
      });
      setExpandedIds(initialExpanded);
    } catch (err: any) {
      setError(err.message || "Error occurred while fetching dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Tree Builder
  const buildTree = (flatList: Category[]): CategoryTreeNode[] => {
    const idMap: Record<string, CategoryTreeNode> = {};
    flatList.forEach(cat => {
      idMap[cat.id] = { ...cat, children: [] };
    });
    const roots: CategoryTreeNode[] = [];
    flatList.forEach(cat => {
      const node = idMap[cat.id];
      if (node.parentId && idMap[node.parentId]) {
        idMap[node.parentId].children.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  };

  const categoryTree = buildTree(categories);

  // Handlers
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName) return;

    try {
      setError("");
      setMessage("");
      const token = localStorage.getItem("accessToken");
      
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: createName,
          slug: createSlug || undefined,
          parentId: createParentId || null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not create category");
      }

      setCreateName("");
      setCreateSlug("");
      setCreateParentId(null);
      setIsCreating(false);
      setMessage("Category created successfully!");
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
      
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editName,
          slug: editSlug || undefined,
          parentId: editParentId || null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not update category");
      }

      setEditingId(null);
      setMessage("Category updated successfully!");
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;

    try {
      setError("");
      setMessage("");
      const token = localStorage.getItem("accessToken");
      
      const res = await fetch(`/api/categories/${deletingCategory.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          reassignCategoryId: reassignCategoryId || null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not delete category");
      }

      setDeletingCategory(null);
      setReassignCategoryId("");
      setMessage("Category deleted and posts reassigned successfully!");
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditParentId(cat.parentId);
  };

  // Count helper
  const getPostCount = (catId: string) => {
    return posts.filter(p => p.categoryId === catId).length;
  };

  const getSubcategoryCount = (catId: string) => {
    return categories.filter(c => c.parentId === catId).length;
  };

  // Recursive Tree Row Renderer
  const renderTreeNodes = (nodes: CategoryTreeNode[], level = 0) => {
    return nodes.map((node) => {
      const isExpanded = expandedIds[node.id];
      const hasChildren = node.children.length > 0;
      const postCount = getPostCount(node.id);
      const subCount = getSubcategoryCount(node.id);
      const isEditing = editingId === node.id;

      return (
        <div key={node.id} className="space-y-1">
          {/* Main Node Row */}
          <div 
            className={`flex items-center justify-between p-3 border border-neutral-150 rounded-xl bg-white hover:bg-neutral-50/50 transition-colors shadow-2xs`}
            style={{ marginInlineStart: `${level * 1.5}rem` }}
          >
            {isEditing ? (
              /* Inline Edit Form */
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <div className="space-y-1">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder={t("categories_name")}
                    required
                    className="w-full text-xs bg-neutral-50 border border-neutral-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand focus:bg-white text-start"
                  />
                </div>
                <div className="space-y-1">
                  <input
                    type="text"
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value)}
                    placeholder={t("categories_slug")}
                    className="w-full text-xs bg-neutral-50 border border-neutral-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand focus:bg-white text-start font-mono"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => handleUpdate(node.id)}
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
              /* Display Row Mode */
              <>
                <div className="flex items-center gap-2">
                  {/* Expand/Collapse Chevron */}
                  <button
                    onClick={() => toggleExpand(node.id)}
                    className={`p-1 hover:bg-neutral-100 rounded transition-colors text-neutral-400 ${!hasChildren ? "invisible" : ""}`}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4 rtl:scale-x-[-1]" />
                    )}
                  </button>

                  <div className="flex items-center gap-1.5">
                    {hasChildren ? (
                      isExpanded ? (
                        <FolderOpen className="w-4.5 h-4.5 text-brand" />
                      ) : (
                        <Folder className="w-4.5 h-4.5 text-brand" />
                      )
                    ) : (
                      <CornerDownRight className="w-4 h-4 text-neutral-400 rtl:scale-x-[-1]" />
                    )}
                    <div className="text-start">
                      <span className="font-bold text-sm text-neutral-900 block">{node.name}</span>
                      <span className="text-[10px] font-mono text-neutral-400">/{node.slug}</span>
                    </div>
                  </div>

                  {/* Badge displaying posts count */}
                  <span className="text-[10px] font-mono font-bold bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">
                    {postCount} posts
                  </span>
                </div>

                {/* Operations */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setCreateParentId(node.id);
                      setIsCreating(true);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-brand transition-colors text-xs font-semibold flex items-center gap-1"
                    title={t("categories_add_sub")}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[10px]">{t("categories_add_sub")}</span>
                  </button>
                  <button
                    onClick={() => startEdit(node)}
                    className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-brand transition-colors"
                    title={t("categories_edit")}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setDeletingCategory(node);
                      setReassignCategoryId("");
                    }}
                    className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-700 transition-colors"
                    title={t("categories_delete")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Render child nodes if expanded */}
          {hasChildren && isExpanded && (
            <div className="space-y-1">
              {renderTreeNodes(node.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const availableReassignCategories = categories.filter(c => deletingCategory && c.id !== deletingCategory.id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-start">
          <h2 className="text-2xl font-extrabold text-neutral-900 font-display tracking-tight">{t("categories_title")}</h2>
          <p className="text-xs text-neutral-500">{t("categories_subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setCreateParentId(null);
              setIsCreating(prev => !prev);
            }}
            className="inline-flex items-center px-4 py-2.5 rounded-lg bg-neutral-950 text-white font-semibold text-xs hover:bg-brand transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 me-1.5" /> {t("categories_new_root")}
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

      {/* Dynamic Creation / Edit block */}
      {isCreating && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs text-start space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <h4 className="text-sm font-bold text-neutral-900">
              {createParentId 
                ? `${t("categories_add_sub")} → ${categories.find(c => c.id === createParentId)?.name}`
                : t("categories_new_root")
              }
            </h4>
            <button onClick={() => { setIsCreating(false); setCreateParentId(null); }} className="text-neutral-400 hover:text-neutral-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 block">{t("categories_name")}</label>
              <input
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="e.g. Next.js Tutorials"
                required
                className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-brand focus:bg-white text-start"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 block">{t("categories_slug")}</label>
              <input
                type="text"
                value={createSlug}
                onChange={(e) => setCreateSlug(e.target.value)}
                placeholder="e.g. nextjs-tutorials"
                className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-brand focus:bg-white text-start font-mono"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-lg transition-all shadow-md cursor-pointer flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>{t("categories_create")}</span>
              </button>
              <button
                type="button"
                onClick={() => { setIsCreating(false); setCreateParentId(null); }}
                className="py-2.5 px-4 border border-neutral-200 text-neutral-700 text-xs font-bold rounded-lg hover:bg-neutral-50 cursor-pointer"
              >
                {t("categories_cancel")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Deletion Dialog Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-neutral-200 rounded-2xl max-w-lg w-full p-6 shadow-xl text-start space-y-4">
            <div className="flex items-center gap-2 text-red-600 border-b border-neutral-100 pb-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h4 className="text-base font-extrabold tracking-tight">
                {t("categories_delete_confirm_title").replace("{name}", deletingCategory.name)}
              </h4>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed font-medium">
              {t("categories_delete_warning")
                .replace("{subCount}", getSubcategoryCount(deletingCategory.id).toString())
                .replace("{parentName}", deletingCategory.parentId ? categories.find(c => c.id === deletingCategory.parentId)?.name || "Root" : "Root")
                .replace("{postCount}", getPostCount(deletingCategory.id).toString())
              }
            </p>

            {getPostCount(deletingCategory.id) > 0 && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-neutral-700 block">
                  {t("categories_delete_reassign")}
                </label>
                <select
                  value={reassignCategoryId}
                  onChange={(e) => setReassignCategoryId(e.target.value)}
                  className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-brand focus:bg-white"
                >
                  <option value="">{t("categories_delete_uncategorized")}</option>
                  {availableReassignCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-4 border-t border-neutral-100">
              <button
                onClick={handleDelete}
                className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer"
              >
                {t("categories_delete_btn")}
              </button>
              <button
                onClick={() => setDeletingCategory(null)}
                className="py-2 px-4 border border-neutral-200 text-neutral-700 text-xs font-bold rounded-lg hover:bg-neutral-50 cursor-pointer"
              >
                {t("categories_cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tree list area */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 text-center text-neutral-500 font-medium">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
            <span>{t("dashboard_loading")}</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-16 text-center text-neutral-500 font-medium">
            No categories created yet. Click New Root Category to start.
          </div>
        ) : (
          <div className="p-6 space-y-3">
            {renderTreeNodes(categoryTree)}
          </div>
        )}
      </div>
    </div>
  );
}
