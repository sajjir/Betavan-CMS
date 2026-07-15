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
  RefreshCw,
  Sparkles,
  Tag,
  Globe,
  ArrowRight
} from "lucide-react";
import { useLanguage } from "../i18n.js";
import { Taxonomy, Term, Post } from "../types.js";

interface TermTreeNode extends Term {
  children: TermTreeNode[];
}

export function AdminTaxonomies() {
  const { t, locale } = useLanguage();
  const isRtl = locale === "fa";
  
  // Data State
  const [taxonomies, setTaxonomies] = useState<Taxonomy[]>([]);
  const [activeTaxonomy, setActiveTaxonomy] = useState<Taxonomy | null>(null);
  const [terms, setTerms] = useState<Term[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // UI Interactive State
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  
  // Form Drawer / Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"CREATE" | "EDIT">("CREATE");
  const [editingTermId, setEditingTermId] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formNameFa, setFormNameFa] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formParentId, setFormParentId] = useState<string | null>(null);
  const [formDescription, setFormDescription] = useState("");
  const [formSeoTitle, setFormSeoTitle] = useState("");
  const [formSeoDescription, setFormSeoDescription] = useState("");

  // AI Loading state
  const [aiLoading, setAiLoading] = useState(false);

  // Delete Dialog State
  const [deletingTerm, setDeletingTerm] = useState<Term | null>(null);
  const [reassignTermId, setReassignTermId] = useState<string>("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [taxRes, termsRes, postsRes] = await Promise.all([
        fetch("/api/taxonomies"),
        fetch("/api/terms"),
        fetch("/api/posts?status=") // Fetch all posts to count assignments
      ]);

      if (!taxRes.ok || !termsRes.ok || !postsRes.ok) {
        throw new Error("Failed to load taxonomy metadata from server");
      }

      const taxData: Taxonomy[] = await taxRes.json();
      const termsData: Term[] = await termsRes.json();
      const postsData = await postsRes.json();

      setTaxonomies(taxData || []);
      setTerms(termsData || []);
      setPosts(postsData.posts || []);

      // If no active taxonomy is selected, default to the first one (usually Category)
      if (taxData.length > 0 && !activeTaxonomy) {
        const defaultTax = taxData.find(t => t.key === "category") || taxData[0];
        setActiveTaxonomy(defaultTax);
      }

      // Expand all hierarchical nodes by default
      const initialExpanded: Record<string, boolean> = {};
      termsData.forEach((term) => {
        initialExpanded[term.id] = true;
      });
      setExpandedIds(initialExpanded);
    } catch (err: any) {
      setError(err.message || "Error occurred while fetching taxonomy data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTaxonomyChange = (tax: Taxonomy) => {
    setActiveTaxonomy(tax);
    setError("");
    setMessage("");
    setIsFormOpen(false);
    setEditingTermId(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filter terms for active taxonomy
  const activeTerms = terms.filter(t => activeTaxonomy && t.taxonomyId === activeTaxonomy.id);

  // Tree Builder for Hierarchical Terms
  const buildTree = (flatList: Term[]): TermTreeNode[] => {
    const idMap: Record<string, TermTreeNode> = {};
    flatList.forEach(term => {
      idMap[term.id] = { ...term, children: [] };
    });
    const roots: TermTreeNode[] = [];
    flatList.forEach(term => {
      const node = idMap[term.id];
      if (node.parentId && idMap[node.parentId]) {
        idMap[node.parentId].children.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  };

  const termTree = activeTaxonomy?.hierarchical ? buildTree(activeTerms) : [];

  // Reset form states
  const openCreateForm = (parentId: string | null = null) => {
    setFormMode("CREATE");
    setEditingTermId(null);
    setFormName("");
    setFormNameFa("");
    setFormSlug("");
    setFormParentId(parentId);
    setFormDescription("");
    setFormSeoTitle("");
    setFormSeoDescription("");
    setIsFormOpen(true);
    setError("");
    setMessage("");
  };

  const openEditForm = (term: Term) => {
    setFormMode("EDIT");
    setEditingTermId(term.id);
    setFormName(term.name);
    setFormNameFa(term.nameFa || "");
    setFormSlug(term.slug);
    setFormParentId(term.parentId || null);
    setFormDescription(term.description || "");
    setFormSeoTitle(term.seoTitle || "");
    setFormSeoDescription(term.seoDescription || "");
    setIsFormOpen(true);
    setError("");
    setMessage("");
  };

  // Submit Handler
  const handleSaveTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTaxonomy || !formName) return;

    try {
      setError("");
      setMessage("");
      const token = localStorage.getItem("accessToken");
      
      const payload = {
        taxonomyId: activeTaxonomy.id,
        name: formName,
        nameFa: formNameFa || undefined,
        slug: formSlug || undefined,
        parentId: activeTaxonomy.hierarchical ? formParentId : null,
        description: formDescription || undefined,
        seoTitle: formSeoTitle || undefined,
        seoDescription: formSeoDescription || undefined
      };

      const url = formMode === "CREATE" ? "/api/terms" : `/api/terms/${editingTermId}`;
      const method = formMode === "CREATE" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not save taxonomy term");
      }

      setIsFormOpen(false);
      setMessage(formMode === "CREATE" ? "Term created successfully!" : "Term updated successfully!");
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // AI Description Generator
  const handleGenerateDescription = async () => {
    if (!formName) {
      setError(isRtl ? "لطفاً ابتدا نام انگلیسی یا فارسی ترم را وارد کنید" : "Please enter the English or Persian term name first");
      return;
    }
    try {
      setAiLoading(true);
      setError("");
      const token = localStorage.getItem("accessToken");

      const res = await fetch("/api/terms/generate-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          termName: formNameFa || formName,
          taxonomyName: activeTaxonomy?.nameFa || activeTaxonomy?.name
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate AI description");
      }

      if (data.description) {
        setFormDescription(data.description);
        // Also pre-fill SEO Title and SEO Description with smart defaults
        setFormSeoTitle(`${formNameFa || formName} | بتوان`);
        setFormSeoDescription(data.description.substring(0, 150));
        setMessage(isRtl ? "توضیحات با هوش مصنوعی تولید شد. لطفاً آن را مرور و ویرایش کنید." : "Description generated with AI. Please review and edit before saving.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  // Delete Handler
  const handleDeleteTerm = async () => {
    if (!deletingTerm) return;

    try {
      setError("");
      setMessage("");
      const token = localStorage.getItem("accessToken");
      
      const res = await fetch(`/api/terms/${deletingTerm.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          reassignTermId: reassignTermId || null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not delete term");
      }

      setDeletingTerm(null);
      setReassignTermId("");
      setMessage("Term deleted and relationships updated successfully!");
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Assignment Counter
  const getPostCount = (termId: string) => {
    return posts.filter(p => {
      if (p.terms && Array.isArray(p.terms)) {
        if (p.terms.some((t: any) => t.id === termId)) return true;
      }
      if (p.categoryId === termId) return true;
      if (p.category?.id === termId) return true;
      if (p.contentType?.id === termId) return true;
      if (p.skillLevel?.id === termId) return true;
      if (p.tags && Array.isArray(p.tags)) {
        if (p.tags.some((t: any) => t.id === termId)) return true;
      }
      return false;
    }).length;
  };

  const getSubtermCount = (termId: string) => {
    return terms.filter(t => t.parentId === termId).length;
  };

  // Recursive Tree Node Renderer for hierarchical view
  const renderTreeNodes = (nodes: TermTreeNode[], level = 0) => {
    return nodes.map((node) => {
      const isExpanded = expandedIds[node.id];
      const hasChildren = node.children.length > 0;
      const postCount = getPostCount(node.id);
      const subCount = getSubtermCount(node.id);

      return (
        <div key={node.id} className="space-y-1">
          {/* Main Node Row */}
          <div 
            className={`flex items-center justify-between p-3.5 border border-neutral-150 rounded-xl bg-white hover:bg-neutral-50/50 transition-colors shadow-2xs`}
            style={{ marginInlineStart: `${level * 1.5}rem` }}
          >
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

              <div className="flex items-center gap-2">
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
                  <span className="font-bold text-sm text-neutral-900 block">
                    {node.nameFa ? `${node.nameFa} (${node.name})` : node.name}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">/{node.slug}</span>
                </div>
              </div>

              {/* Badges */}
              <span className="text-[10px] font-mono font-bold bg-neutral-100 text-neutral-500 px-2.5 py-0.5 rounded-full">
                {postCount} {isRtl ? "پست" : "posts"}
              </span>
            </div>

            {/* Operations */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => openCreateForm(node.id)}
                className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-brand transition-colors text-xs font-semibold flex items-center gap-1"
                title={t("categories_add_sub")}
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[10px]">{t("categories_add_sub")}</span>
              </button>
              <button
                onClick={() => openEditForm(node)}
                className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-brand transition-colors"
                title={t("categories_edit")}
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setDeletingTerm(node);
                  setReassignTermId("");
                }}
                className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-700 transition-colors"
                title={t("categories_delete")}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
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

  const availableReassignTerms = activeTerms.filter(t => deletingTerm && t.id !== deletingTerm.id);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
        <div className="text-start">
          <h2 className="text-2xl font-extrabold text-neutral-900 font-display tracking-tight">
            {isRtl ? "مدیریت طبقه‌بندی و تکسونومی‌ها" : "Taxonomy & Term System"}
          </h2>
          <p className="text-xs text-neutral-500">
            {isRtl 
              ? "مدیریت یکپارچه دسته‌بندی‌ها، برچسب‌ها، انواع محتوا و سطوح مهارت با ساختار سئومحور" 
              : "Unified taxonomy editor for managing Category hierarchy, Tags, Content Type, and Skill Levels."}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => openCreateForm(null)}
            className="inline-flex items-center px-4.5 py-2.5 rounded-xl bg-neutral-950 text-white font-bold text-xs hover:bg-brand transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4 me-1.5" /> 
            {activeTaxonomy?.hierarchical 
              ? (isRtl ? `افزودن ریشه ${activeTaxonomy.nameFa}` : `New Root ${activeTaxonomy.name}`)
              : (isRtl ? `افزودن ${activeTaxonomy?.nameFa || "ترم"}` : `Add New ${activeTaxonomy?.name || "Term"}`)
            }
          </button>
        </div>
      </div>

      {/* Taxonomy Selection Tabs */}
      <div className="flex border-b border-neutral-200 gap-1 overflow-x-auto pb-px">
        {taxonomies.map((tax) => {
          const isActive = activeTaxonomy?.id === tax.id;
          return (
            <button
              key={tax.id}
              onClick={() => handleTaxonomyChange(tax)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                isActive 
                  ? "border-brand text-brand bg-brand/5 rounded-t-xl" 
                  : "border-transparent text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 rounded-t-xl"
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>{isRtl ? tax.nameFa : tax.name}</span>
              <span className="text-[10px] font-normal opacity-70">({terms.filter(t => t.taxonomyId === tax.id).length})</span>
            </button>
          );
        })}
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-150 rounded-xl flex items-center text-xs text-red-700 text-start">
          <AlertTriangle className="w-5 h-5 me-2 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-150 rounded-xl flex items-center text-xs text-emerald-700 text-start">
          <Check className="w-5 h-5 me-2 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Create / Edit Form Drawer/Panel */}
      {isFormOpen && activeTaxonomy && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm text-start space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-brand" />
              <h4 className="text-sm font-bold text-neutral-900">
                {formMode === "CREATE" 
                  ? (formParentId 
                      ? `${isRtl ? "افزودن زیرمجموعه جدید به" : "Add Sub-Term to"} → ${terms.find(t => t.id === formParentId)?.nameFa || terms.find(t => t.id === formParentId)?.name}`
                      : (isRtl ? `ایجاد ${activeTaxonomy.nameFa} ریشه جدید` : `New Root ${activeTaxonomy.name}`))
                  : (isRtl ? `ویرایش ${activeTaxonomy.nameFa}: ${formNameFa || formName}` : `Edit ${activeTaxonomy.name}: ${formName}`)
                }
              </h4>
            </div>
            <button onClick={() => setIsFormOpen(false)} className="text-neutral-400 hover:text-neutral-600 cursor-pointer">
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          <form onSubmit={handleSaveTerm} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* English Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 block">
                  {isRtl ? "نام انگلیسی (یکتا)" : "English Name (Unique)"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Technology"
                  required
                  className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-brand focus:bg-white text-start font-mono"
                />
              </div>

              {/* Persian Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 block">
                  {isRtl ? "نام فارسی" : "Persian Name"}
                </label>
                <input
                  type="text"
                  value={formNameFa}
                  onChange={(e) => setFormNameFa(e.target.value)}
                  placeholder="مثال: هوش مصنوعی"
                  className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-brand focus:bg-white text-start font-sans"
                />
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 block">
                  {isRtl ? "اسلاگ (شناسه یکتا در آدرس)" : "Slug URL"}
                </label>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="e.g. artificial-intelligence"
                  className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-brand focus:bg-white text-start font-mono"
                />
              </div>
            </div>

            {/* Hierarchical parent term selection */}
            {activeTaxonomy.hierarchical && (
              <div className="space-y-1.5 max-w-md">
                <label className="text-xs font-bold text-neutral-700 block">
                  {t("categories_parent")}
                </label>
                <select
                  value={formParentId || ""}
                  onChange={(e) => setFormParentId(e.target.value || null)}
                  className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-brand focus:bg-white"
                >
                  <option value="">{t("categories_none_root")}</option>
                  {activeTerms
                    .filter(term => term.id !== editingTermId) // avoid circular parent reference
                    .map(term => (
                      <option key={term.id} value={term.id}>
                        {term.nameFa ? `${term.nameFa} (${term.name})` : term.name}
                      </option>
                    ))
                  }
                </select>
              </div>
            )}

            {/* Rich-text / Persian Description Field with Gemini AI Generator */}
            <div className="space-y-2 border border-neutral-150 rounded-xl p-4.5 bg-neutral-50/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-150">
                <div className="text-start">
                  <h5 className="text-xs font-bold text-neutral-800">{isRtl ? "توضیحات معرفی سئو (فارسی)" : "Persian Rich Description"}</h5>
                  <p className="text-[10px] text-neutral-400">
                    {isRtl ? "یک پاراگراف غنی شامل کلمات کلیدی برای هدر صفحه آرشیو سئو" : "SEO introduction text for term archive pages"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={aiLoading}
                  className="inline-flex items-center px-3.5 py-1.5 bg-brand hover:bg-brand-hover text-white text-[10px] font-bold rounded-lg transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {aiLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin me-1.5" />
                      <span>{isRtl ? "در حال تولید با هوش مصنوعی..." : "Generating..."}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 me-1.5" />
                      <span>{isRtl ? "تولید خودکار با هوش مصنوعی" : "Generate with Gemini AI"}</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={5}
                placeholder={isRtl ? "متنی حاوی کلمات کلیدی مربوط به این حوزه بنویسید یا از دکمه تولید خودکار استفاده کنید..." : "Write a descriptive paragraph containing keywords..."}
                className="w-full text-xs bg-white border border-neutral-200 rounded-lg p-3 focus:outline-none focus:border-brand text-start leading-relaxed font-sans"
              />
            </div>

            {/* SEO Section */}
            <div className="space-y-4 border border-neutral-150 rounded-xl p-4.5 bg-neutral-50/50">
              <div className="text-start">
                <h5 className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-brand" />
                  <span>{isRtl ? "متا تگ‌های پیشرفته سئو (SEO Meta Settings)" : "Advanced SEO Meta"}</span>
                </h5>
                <p className="text-[10px] text-neutral-400">
                  {isRtl ? "بهینه‌سازی عنوان و توضیحات برای ربات‌های گوگل و افزایش رتبه صفحه" : "Customize metadata to match exact search-engine targets"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-600 block">{isRtl ? "عنوان سئو (SEO Title)" : "SEO Title"}</label>
                  <input
                    type="text"
                    value={formSeoTitle}
                    onChange={(e) => setFormSeoTitle(e.target.value)}
                    placeholder="e.g. Best Next.js Tutorials and Code Assets"
                    className="w-full text-xs bg-white border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-brand"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-600 block">{isRtl ? "توضیحات متای سئو (Meta Description)" : "SEO Meta Description"}</label>
                  <input
                    type="text"
                    value={formSeoDescription}
                    onChange={(e) => setFormSeoDescription(e.target.value)}
                    placeholder="Write a highly focused 150-char SEO meta snippet..."
                    className="w-full text-xs bg-white border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-brand"
                  />
                </div>
              </div>
            </div>

            {/* Form actions */}
            <div className="flex gap-2 justify-end pt-3 border-t border-neutral-150">
              <button
                type="submit"
                className="py-2 px-5 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-lg transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{formMode === "CREATE" ? (isRtl ? "ایجاد ترم" : "Create Term") : (isRtl ? "ذخیره تغییرات" : "Save Changes")}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="py-2 px-5 border border-neutral-200 text-neutral-700 text-xs font-bold rounded-lg hover:bg-neutral-50 cursor-pointer"
              >
                {t("categories_cancel")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Deletion Dialog Modal */}
      {deletingTerm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-neutral-200 rounded-2xl max-w-lg w-full p-6 shadow-xl text-start space-y-4">
            <div className="flex items-center gap-2 text-red-600 border-b border-neutral-100 pb-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h4 className="text-base font-extrabold tracking-tight">
                {isRtl ? `حذف ترم: ${deletingTerm.nameFa || deletingTerm.name}` : `Delete Term: ${deletingTerm.name}`}
              </h4>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed font-medium">
              {isRtl 
                ? `توجه: حذف این ترم بر روی ${getPostCount(deletingTerm.id)} پست تأثیر مستقیم می‌گذارد. همچنین ${getSubtermCount(deletingTerm.id)} زیرمجموعه در صورت وجود ارتقا خواهند یافت.`
                : `Warning: Deleting this term will affect ${getPostCount(deletingTerm.id)} posts. Hierarchical child terms (if any) will be reassigned.`
              }
            </p>

            {getPostCount(deletingTerm.id) > 0 && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-neutral-700 block">
                  {isRtl ? "انتساب مجدد پست‌ها به:" : "Reassign posts to:"}
                </label>
                <select
                  value={reassignTermId}
                  onChange={(e) => setReassignTermId(e.target.value)}
                  className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-brand"
                >
                  <option value="">{isRtl ? "بدون انتساب رها شود" : "Leave Unassigned / Uncategorized"}</option>
                  {availableReassignTerms.map(t => (
                    <option key={t.id} value={t.id}>{t.nameFa ? `${t.nameFa} (${t.name})` : t.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-4 border-t border-neutral-100">
              <button
                onClick={handleDeleteTerm}
                className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer"
              >
                {t("categories_delete_btn")}
              </button>
              <button
                onClick={() => setDeletingTerm(null)}
                className="py-2 px-4 border border-neutral-200 text-neutral-700 text-xs font-bold rounded-lg hover:bg-neutral-50 cursor-pointer"
              >
                {t("categories_cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Term List Container */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 text-center text-neutral-500 font-medium">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
            <span>{t("dashboard_loading")}</span>
          </div>
        ) : activeTerms.length === 0 ? (
          <div className="p-16 text-center text-neutral-400 font-medium">
            {isRtl 
              ? `هیچ موردی برای ${activeTaxonomy?.nameFa || "این تکسونومی"} یافت نشد. برای شروع دکمه افزودن را بزنید.` 
              : `No terms created for ${activeTaxonomy?.name} yet. Click Add to get started.`}
          </div>
        ) : activeTaxonomy?.hierarchical ? (
          /* Hierarchical tree structure rendering */
          <div className="p-6 space-y-3">
            {renderTreeNodes(termTree)}
          </div>
        ) : (
          /* Flat list structure rendering with a gorgeous clean layout */
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {activeTerms.map((term) => {
                const postCount = getPostCount(term.id);
                return (
                  <div 
                    key={term.id} 
                    className="flex items-center justify-between p-4 border border-neutral-150 rounded-xl bg-white hover:bg-neutral-50/50 transition-all shadow-2xs hover:shadow-xs group"
                  >
                    <div className="text-start">
                      <span className="font-bold text-sm text-neutral-900 block">
                        {term.nameFa ? `${term.nameFa} (${term.name})` : term.name}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400">/{term.slug}</span>
                      {term.description && (
                        <p className="text-[10px] text-neutral-500 line-clamp-1 mt-1 leading-relaxed">
                          {term.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono font-bold bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">
                        {postCount} {isRtl ? "پست" : "posts"}
                      </span>
                      <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditForm(term)}
                          className="p-1.5 hover:bg-neutral-100 rounded text-neutral-500 hover:text-brand transition-colors"
                          title={t("categories_edit")}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingTerm(term);
                            setReassignTermId("");
                          }}
                          className="p-1.5 hover:bg-red-50 rounded text-red-500 hover:text-red-700 transition-colors"
                          title={t("categories_delete")}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
