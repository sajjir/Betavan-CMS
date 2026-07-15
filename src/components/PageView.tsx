import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { AlertCircle, RefreshCw, FileText } from "lucide-react";
import { useLanguage } from "../i18n.js";
import { BlockRenderer } from "./BlockRenderer.js";
import { setPageSeo, clearJsonLd, getBreadcrumbSchema } from "../lib/seo.js";

export function PageView() {
  const { slug } = useParams();
  const { t } = useLanguage();
  
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPage() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`/api/pages/${slug}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Page not found");
          }
          throw new Error("Failed to fetch static page content");
        }
        const data = await res.json();
        setPage(data);

        // SEO tag updates
        if (data) {
          const origin = window.location.origin;
          const breadcrumbSchema = getBreadcrumbSchema([
            { name: t("nav_home") || "Home", item: origin },
            { name: data.title, item: `${origin}/page/${slug}` }
          ]);
          setPageSeo({
            title: data.seoTitle || data.title,
            description: data.seoDescription || "",
            jsonLd: breadcrumbSchema
          });
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    if (slug) {
      loadPage();
    }
    return () => {
      clearJsonLd();
    };
  }, [slug, t]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center text-neutral-500 font-medium">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-neutral-400" />
        <span>{t("post_fetch_details") || "Loading static page..."}</span>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-neutral-900">{t("post_not_found") || "Page Not Found"}</h2>
        <p className="text-neutral-500 mt-1">{error || "The static page you are trying to view does not exist or has been removed."}</p>
        <Link to="/" className="mt-6 inline-flex items-center text-sm font-semibold text-brand hover:underline cursor-pointer">
          {t("post_return_btn") || "Return to Homepage"}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <article className="space-y-8 text-start">
        {/* Title & Header */}
        <div className="space-y-4 border-b border-neutral-100 pb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 font-display tracking-tight leading-tight">
            {page.title}
          </h1>
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <FileText className="w-3.5 h-3.5" />
            <span>Static Page</span>
          </div>
        </div>

        {/* Content Blocks */}
        <div className="space-y-6">
          {page.blocks?.map((block: any, idx: number) => (
            <BlockRenderer key={block.id || block.order || idx} block={block} />
          ))}
        </div>
      </article>
    </div>
  );
}
export default PageView;
