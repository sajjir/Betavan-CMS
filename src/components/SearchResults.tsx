import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, FileText, ShoppingBag, Calendar, AlertCircle } from "lucide-react";
import { useLanguage } from "../i18n.js";

interface SearchResultItem {
  type: "post" | "product";
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  date: string | null;
  price: number | null;
}

export function SearchResults() {
  const [searchParams] = useSearchParams();
  const { locale, t } = useLanguage();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) {
          throw new Error("Failed to fetch search results");
        }
        const data = await res.json();
        setResults(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong while searching");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const isRtl = locale === "fa";

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isRtl) {
      return d.toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric" });
    }
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const formatPrice = (price: number) => {
    if (isRtl) {
      return `${price.toLocaleString("fa-IR")} تومان`;
    }
    return `${price.toLocaleString()} Toman`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[70vh]" dir={isRtl ? "rtl" : "ltr"}>
      {/* Search Header */}
      <div className="border-b border-neutral-200 pb-6 mb-8">
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight font-display mb-2">
          {t("search_results_title")}
        </h1>
        <p className="text-sm text-neutral-500 font-sans">
          {t("search_results_for").replace("{query}", query)}
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-white border border-neutral-200 rounded-xl p-5 flex gap-4 h-36">
              <div className="w-24 h-full bg-neutral-200 rounded-lg shrink-0" />
              <div className="flex-1 space-y-3 py-1">
                <div className="h-4 bg-neutral-200 rounded w-1/4" />
                <div className="h-4 bg-neutral-200 rounded w-3/4" />
                <div className="h-3 bg-neutral-200 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 font-sans">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && results.length === 0 && (
        <div className="text-center py-16 bg-neutral-50 rounded-2xl border border-neutral-200/60 max-w-2xl mx-auto px-6">
          <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-neutral-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 mb-2 font-display">
            {locale === "fa" ? "نتیجه‌ای یافت نشد" : "No results found"}
          </h3>
          <p className="text-sm text-neutral-500 mb-6 font-sans">
            {t("search_no_results")}
          </p>
          <div className="flex justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-neutral-300 text-xs font-semibold rounded-lg text-neutral-700 bg-white hover:bg-neutral-50 transition-colors shadow-xs"
            >
              {locale === "fa" ? "بازگشت به خانه" : "Return Home"}
            </Link>
            <Link
              to="/shop"
              className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white hover:bg-brand transition-colors shadow-sm"
            >
              {locale === "fa" ? "مشاهده فروشگاه" : "Visit Shop"}
            </Link>
          </div>
        </div>
      )}

      {/* Results List */}
      {!loading && !error && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((item) => (
            <Link
              key={`${item.type}-${item.slug}`}
              to={item.type === "post" ? `/blog/${item.slug}` : `/shop/${item.slug}`}
              className="group bg-white hover:bg-neutral-50/50 border border-neutral-200 hover:border-neutral-400 rounded-xl p-5 flex gap-4 transition-all duration-200 hover:shadow-xs cursor-pointer"
            >
              {/* Cover Image */}
              {item.coverImage ? (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden shrink-0 border border-neutral-100 bg-neutral-50">
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg shrink-0 border border-neutral-150 bg-neutral-50 flex items-center justify-center text-neutral-300">
                  {item.type === "post" ? (
                    <FileText className="w-8 h-8" />
                  ) : (
                    <ShoppingBag className="w-8 h-8" />
                  )}
                </div>
              )}

              {/* Text Info */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    {/* Badge type */}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold font-sans tracking-wide uppercase ${
                      item.type === "post"
                        ? "bg-blue-50 text-blue-700 border border-blue-100"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    }`}>
                      {item.type === "post" ? t("search_type_post") : t("search_type_product")}
                    </span>

                    {/* Post Date or Product Price */}
                    {item.type === "post" && item.date && (
                      <span className="inline-flex items-center text-[10px] text-neutral-400 gap-1 font-sans">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.date)}
                      </span>
                    )}

                    {item.type === "product" && item.price !== null && (
                      <span className="text-[11px] font-bold text-emerald-600 font-sans">
                        {formatPrice(item.price)}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-neutral-900 group-hover:text-brand transition-colors line-clamp-1 mb-1 font-display">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-neutral-500 line-clamp-2 leading-relaxed font-sans">
                    {item.excerpt}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
