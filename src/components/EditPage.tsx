import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Check, 
  X, 
  AlertTriangle,
  RefreshCw,
  Eye,
  FileText
} from "lucide-react";
import { useLanguage } from "../i18n.js";
import { BlockEditor } from "./BlockEditor.js";
import { PostBlock } from "../types.js";

export function EditPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [blocks, setBlocks] = useState<PostBlock[]>([]);

  const [originalSlug, setOriginalSlug] = useState("");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isNew) return;

    async function loadPageData() {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        const res = await fetch("/api/pages", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          const page = data.find((p: any) => p.id === id);
          if (page) {
            setTitle(page.title);
            setSlug(page.slug);
            setOriginalSlug(page.slug);
            setSeoTitle(page.seoTitle || "");
            setSeoDescription(page.seoDescription || "");
            setBlocks(page.blocks || []);
          } else {
            throw new Error("Page not found");
          }
        } else {
          throw new Error("Failed to load static pages");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load page for editing");
      } finally {
        setLoading(false);
      }
    }
    loadPageData();
  }, [id, isNew]);

  // Auto-generate slug from title
  useEffect(() => {
    if (isNew && title && !slug) {
      const generated = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .trim();
      setSlug(generated);
    }
  }, [title, isNew]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug) return;

    try {
      setSaving(true);
      setError("");
      const token = localStorage.getItem("accessToken");

      const payload = {
        title,
        slug,
        seoTitle,
        seoDescription,
        blocks: blocks.map((b, index) => ({
          type: b.type,
          order: index,
          data: b.data
        }))
      };

      // 1. Save / Upsert page
      const saveRes = await fetch("/api/pages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const resData = await saveRes.json();
      if (!saveRes.ok) {
        throw new Error(resData.error || "Save operation failed");
      }

      // 2. If editing and slug changed, delete old duplicate page
      if (!isNew && originalSlug && originalSlug !== slug) {
        try {
          await fetch(`/api/pages/${id}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
        } catch (delErr) {
          console.error("Cleanup old slug page failed:", delErr);
        }
      }

      navigate("/admin/pages");
    } catch (err: any) {
      setError(err.message || "An error occurred while saving the page");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center text-neutral-500 font-medium">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-neutral-400" />
        <span>{t("edit_loading")}</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link to="/admin/pages" className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 flex items-center">
          <span className="rtl:scale-x-[-1] inline-block me-1.5 font-sans">←</span> {t("edit_back_btn")}
        </Link>
        <span className="text-xs font-mono text-neutral-400">
          {isNew ? "New Static Page" : `Editing Page: ${title}`}
        </span>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-150 rounded-xl flex items-center text-sm text-red-700 text-start">
          <AlertTriangle className="w-5 h-5 me-2 shrink-0 animate-pulse" />
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Fields */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 shadow-xs text-start">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">{t("pages_name")}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Page Title"
                required
                className="w-full text-lg font-bold bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand focus:bg-white text-start"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">{t("pages_slug")}</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="slug"
                required
                className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-brand focus:bg-white font-mono text-start"
              />
            </div>
          </div>

          {/* Visual Block Editor */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs text-start">
            <BlockEditor blocks={blocks} onChange={setBlocks} />
          </div>
        </div>

        {/* Sidebar Controls Section */}
        <div className="space-y-6">
          {/* SEO Metadata Settings */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-5 shadow-xs text-start">
            <h4 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3">{t("edit_seo_title")}</h4>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">{t("edit_seo_meta_title")}</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Meta title override"
                  className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-brand focus:bg-white text-start"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">{t("edit_seo_meta_desc")}</label>
                <textarea
                  rows={4}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Meta description text..."
                  className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-brand focus:bg-white leading-relaxed text-start"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-brand hover:bg-brand-hover text-white text-sm font-extrabold rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t("edit_saving")}</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{t("edit_save_btn")}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
