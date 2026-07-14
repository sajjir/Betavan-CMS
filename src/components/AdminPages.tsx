import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  AlertTriangle,
  RefreshCw,
  FileText,
  Eye
} from "lucide-react";
import { useLanguage } from "../i18n.js";

interface StaticPage {
  id: string;
  title: string;
  slug: string;
  updatedAt: string;
}

export function AdminPages() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [deletingPage, setDeletingPage] = useState<StaticPage | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/pages", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Failed to load static pages");
      }

      const data = await res.json();
      setPages(data || []);
    } catch (err: any) {
      setError(err.message || "Error fetching pages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async () => {
    if (!deletingPage) return;

    try {
      setError("");
      setMessage("");
      const token = localStorage.getItem("accessToken");
      
      const res = await fetch(`/api/pages/${deletingPage.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not delete page");
      }

      setDeletingPage(null);
      setMessage(t("pages_delete_success") || "Page deleted successfully!");
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-start">
          <h2 className="text-2xl font-extrabold text-neutral-900 font-display tracking-tight">{t("pages_title")}</h2>
          <p className="text-xs text-neutral-500">{t("pages_subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/pages/new"
            className="inline-flex items-center px-4 py-2.5 rounded-lg bg-neutral-950 text-white font-semibold text-xs hover:bg-brand transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 me-1.5" /> {t("pages_new")}
          </Link>
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

      {/* Delete Confirmation Modal */}
      {deletingPage && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-neutral-200 rounded-2xl max-w-lg w-full p-6 shadow-xl text-start space-y-4">
            <div className="flex items-center gap-2 text-red-600 border-b border-neutral-100 pb-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h4 className="text-base font-extrabold tracking-tight">
                {t("categories_delete")}: {deletingPage.title}
              </h4>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed font-medium">
              {t("pages_delete_confirm")}
            </p>

            <div className="flex gap-2 justify-end pt-4 border-t border-neutral-100">
              <button
                onClick={handleDelete}
                className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer"
              >
                {t("categories_delete_btn")}
              </button>
              <button
                onClick={() => setDeletingPage(null)}
                className="py-2 px-4 border border-neutral-200 text-neutral-700 text-xs font-bold rounded-lg hover:bg-neutral-50 cursor-pointer"
              >
                {t("categories_cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pages Table */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 text-center text-neutral-500 font-medium">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
            <span>{t("dashboard_loading")}</span>
          </div>
        ) : pages.length === 0 ? (
          <div className="p-16 text-center text-neutral-500 font-medium">
            No static pages created yet. Click New Page to start.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-400 font-mono text-[10px] uppercase font-bold tracking-wider">
                  <th className="p-4 text-start">{t("pages_name")}</th>
                  <th className="p-4 text-start">{t("pages_slug")}</th>
                  <th className="p-4 text-start">{t("pages_last_updated")}</th>
                  <th className="p-4 text-end"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-150">
                {pages.map((page) => (
                  <tr key={page.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="p-4 text-start">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-neutral-900 text-sm block">{page.title}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-start font-mono text-xs text-neutral-500">
                      /{page.slug}
                    </td>
                    <td className="p-4 text-start text-xs text-neutral-500 font-mono">
                      {new Date(page.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-end">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/page/${page.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-neutral-900 transition-colors"
                          title="Preview Page"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <Link
                          to={`/admin/pages/edit/${page.id}`}
                          className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-brand transition-colors"
                          title={t("categories_edit")}
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeletingPage(page)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-700 transition-colors"
                          title={t("categories_delete")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
