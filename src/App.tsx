import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate, Navigate, useLocation } from "react-router-dom";
import { 
  Plus, 
  Settings, 
  Trash2, 
  Edit, 
  FileDown, 
  Play, 
  Code, 
  Image as ImageIcon, 
  Type, 
  Check, 
  AlertCircle, 
  FileText, 
  FolderOpen, 
  Globe, 
  ChevronRight,
  Eye,
  Filter,
  RefreshCw,
  Clock,
  Copy,
  BookOpen,
  Video,
  Cpu,
  ExternalLink
} from "lucide-react";
import { Post, Category, Tag, Page } from "./types.js";
import { Navbar } from "./components/Navbar.js";
import { BlockRenderer } from "./components/BlockRenderer.js";
import { BlockEditor } from "./components/BlockEditor.js";
import { LanguageProvider, useLanguage } from "./i18n.js";
import { AdminTaxonomies } from "./components/AdminTaxonomies.js";
import { AdminSettings } from "./components/AdminSettings.js";
import { AdminPages } from "./components/AdminPages.js";
import { EditPage } from "./components/EditPage.js";
import { PageView } from "./components/PageView.js";
import { AdminProducts } from "./components/AdminProducts.js";
import { AdminOrders } from "./components/AdminOrders.js";
import { AdminWebhooks } from "./components/AdminWebhooks.js";
import { CartProvider } from "./CartContext.js";
import { Storefront } from "./components/Storefront.js";
import { ProductDetail } from "./components/ProductDetail.js";
import { setPageSeo, clearJsonLd, getArticleSchema, getBreadcrumbSchema, getOrganizationSchema } from "./lib/seo.js";
import { Checkout } from "./components/Checkout.js";
import { OrderResult } from "./components/OrderResult.js";
import { SearchResults } from "./components/SearchResults.js";

// Helper to check auth
const isAuthenticated = () => !!localStorage.getItem("accessToken");

// --- PRIVATE ROUTE COMPONENT ---
function PrivateRoute({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
}

// ==========================================
// 1. PUBLIC BLOG HOME SCREEN
// ==========================================
function BlogHome() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const { locale, t } = useLanguage();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        let url = "/api/posts?status=PUBLISHED";
        if (selectedCategory) url += `&categorySlug=${selectedCategory}`;
        if (selectedTag) url += `&tagSlug=${selectedTag}`;

        const [postsRes, catRes, tagRes] = await Promise.all([
          fetch(url),
          fetch("/api/categories"),
          fetch("/api/tags")
        ]);

        if (postsRes.ok) {
          const postData = await postsRes.json();
          setPosts(postData.posts || []);
        }
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData);
        }
        if (tagRes.ok) {
          const tagData = await tagRes.json();
          setTags(tagData);
        }
      } catch (err) {
        console.error("Error loading blog data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedCategory, selectedTag]);

  const handleQuickCopy = async (e: React.MouseEvent, postId: string, code: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      setCopiedPostId(postId);
      setTimeout(() => setCopiedPostId(null), 2000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  const scrollToGrid = () => {
    const el = document.getElementById("toolbench-grid");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug);
    setSelectedTag("");
    setTimeout(scrollToGrid, 50);
  };

  // Find a post to feature in our main hero section
  // Prefer a post with code snippets, downloads, or videos. If none, take the first post.
  const featuredPost = posts.find(p => 
    p.blocks?.some(b => b.type === "CODE_SNIPPET" || b.type === "DOWNLOAD_BOX")
  ) || posts[0];

  // Extracts first code block or download box from a post
  const getFeaturedAsset = (post: Post) => {
    if (!post || !post.blocks) return null;
    const codeBlock = post.blocks.find(b => b.type === "CODE_SNIPPET");
    if (codeBlock) return { type: "CODE", data: codeBlock.data, blockId: codeBlock.id };
    const downloadBlock = post.blocks.find(b => b.type === "DOWNLOAD_BOX");
    if (downloadBlock) return { type: "DOWNLOAD", data: downloadBlock.data, blockId: downloadBlock.id };
    return null;
  };

  const featuredAsset = featuredPost ? getFeaturedAsset(featuredPost) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* 1. HERO SECTION (Split layouts with Live Anchor) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-white rounded-3xl border border-neutral-200 p-8 sm:p-10 shadow-xs relative overflow-hidden text-start">
        {/* Subtle engineering background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        <div className="lg:col-span-5 space-y-5 relative z-10">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider bg-brand-light text-brand uppercase">
            {t("home_title_badge")}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 font-display tracking-tight leading-tight">
            {t("home_hero_title")}
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-sans font-medium">
            {t("home_hero_subtitle")}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={scrollToGrid}
              className="px-4.5 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-850 text-white font-bold text-xs tracking-wide transition-all shadow-sm cursor-pointer"
            >
              {t("home_btn_browse")}
            </button>
            <a
              href="#categories-browse"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("categories-browse")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-4.5 py-2.5 rounded-lg border border-neutral-200 hover:border-neutral-300 text-neutral-700 font-bold text-xs tracking-wide transition-all bg-white cursor-pointer"
            >
              {t("home_btn_pillars")}
            </a>
          </div>
        </div>

        {/* Hero Visual Anchor */}
        <div className="lg:col-span-7 relative z-10 w-full text-start" dir="ltr">
          {featuredPost ? (
            <div className="bg-neutral-950 rounded-2xl border border-neutral-800 shadow-xl overflow-hidden">
              {/* Fake IDE Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-neutral-900 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="text-[10px] font-mono text-neutral-500 ms-2 tracking-tight">
                    {featuredPost.slug}.{featuredAsset?.type === "CODE" ? (featuredAsset.data.language || "php") : "asset"}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-brand/10 text-brand px-2 py-0.5 rounded border border-brand/20">
                  {t("home_featured_badge")}
                </span>
              </div>

              {/* IDE Content */}
              <div className="p-5 sm:p-6 space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-semibold text-neutral-500 uppercase tracking-wider block">
                    {featuredPost.category?.name || "Snippet"}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-neutral-100 font-sans tracking-tight leading-snug hover:text-brand transition-colors">
                    <Link to={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
                  </h3>
                  <p className="text-xs text-neutral-400 font-medium leading-relaxed line-clamp-2">
                    {featuredPost.excerpt || "Production snippet ready to deploy into your custom setups."}
                  </p>
                </div>

                {/* Render the core snippet preview */}
                {featuredAsset?.type === "CODE" ? (
                  <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-4 relative group">
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 mb-2 border-b border-neutral-850 pb-2">
                      <span>{t("home_snippet_language")}: {featuredAsset.data.language || "typescript"}</span>
                      <button
                        onClick={(e) => handleQuickCopy(e, "featured-hero", featuredAsset.data.code)}
                        className="flex items-center gap-1 hover:text-neutral-200 transition-colors bg-neutral-950/50 px-2 py-1 rounded cursor-pointer"
                      >
                        {copiedPostId === "featured-hero" ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">{t("home_demo_copied")}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>{t("home_demo_copy")}</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="text-xs font-mono text-neutral-300 overflow-x-auto leading-relaxed max-h-[160px] scrollbar-thin text-start" dir="ltr">
                      <code>{featuredAsset.data.code}</code>
                    </pre>
                  </div>
                ) : featuredAsset?.type === "DOWNLOAD" ? (
                  <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="p-2.5 rounded bg-brand/10 text-brand shrink-0">
                        <FileDown className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-neutral-100 block">
                          {featuredAsset.data.filename || "utility-asset.zip"}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500">
                          {t("home_download_stats")}: {featuredAsset.data.size || t("block_unknown_size")} • {featuredAsset.data.downloads || 0} {t("block_downloads_count")}
                        </span>
                      </div>
                    </div>
                    <a
                      href={featuredAsset.blockId ? `/downloads/${featuredAsset.blockId}` : (featuredAsset.data.link || "#")}
                      className="px-4 py-2 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-lg transition-colors shadow-sm inline-flex items-center shrink-0 cursor-pointer"
                    >
                      <FileDown className="w-3.5 h-3.5 me-1.5" /> {t("home_btn_download")}
                    </a>
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-lg border border-dashed border-neutral-800 bg-neutral-900/50">
                    <Link
                      to={`/blog/${featuredPost.slug}`}
                      className="inline-flex items-center gap-2 text-xs text-brand font-bold hover:underline"
                    >
                      <span>{t("home_explore_tutorial")}</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Standalone Mock Preview if DB is unseeded or posts is empty */
            <div className="bg-neutral-950 rounded-2xl border border-neutral-800 shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-neutral-900 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="text-[10px] font-mono text-neutral-500 ms-2 tracking-tight">wp-clean-blocks.php</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-brand/10 text-brand px-2 py-0.5 rounded border border-brand/20">
                  {t("home_demo_badge")}
                </span>
              </div>
              <div className="p-5 sm:p-6 space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-semibold text-neutral-500 uppercase tracking-wider block">
                    WordPress Optimization
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-neutral-100 font-sans tracking-tight leading-snug">
                    {t("home_demo_title")}
                  </h3>
                  <p className="text-xs text-neutral-400 font-medium leading-relaxed">
                    {t("home_demo_excerpt")}
                  </p>
                </div>
                <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-4 relative group">
                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 mb-2 border-b border-neutral-850 pb-2">
                    <span>php</span>
                    <button
                      onClick={(e) => handleQuickCopy(e, "demo-hero", `// Dequeue default Gutenberg block styles\nadd_action('wp_enqueue_scripts', function() {\n    wp_dequeue_style('wp-block-library');\n    wp_dequeue_style('wp-block-library-theme');\n}, 100);`)}
                      className="flex items-center gap-1 hover:text-neutral-200 transition-colors bg-neutral-950/50 px-2 py-1 rounded cursor-pointer"
                    >
                      {copiedPostId === "demo-hero" ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">{t("home_demo_copied")}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>{t("home_demo_copy")}</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-neutral-300 overflow-x-auto leading-relaxed max-h-[160px] scrollbar-thin text-start" dir="ltr">
                    <code>{`// Dequeue default Gutenberg block styles
add_action('wp_enqueue_scripts', function() {
    wp_dequeue_style('wp-block-library');
    wp_dequeue_style('wp-block-library-theme');
}, 100);`}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. CATEGORY BROWSE SECTION (Bento pillars layout) */}
      <section id="categories-browse" className="space-y-6 pt-4 scroll-mt-20">
        <div className="space-y-1.5 text-center max-w-2xl mx-auto">
          <span className="text-[10px] font-mono font-bold tracking-widest text-neutral-400 uppercase">
            {t("home_pillars_badge")}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 font-display tracking-tight">
            {t("home_pillars_title")}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 font-medium">
            {t("home_pillars_subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* AI Category */}
          <div 
            onClick={() => handleCategorySelect("ai-technology")}
            className={`group rounded-2xl border p-6 space-y-4 hover:border-brand/40 transition-all cursor-pointer bg-white relative overflow-hidden flex flex-col justify-between text-start ${selectedCategory === "ai-technology" ? "ring-2 ring-brand border-brand" : "border-neutral-200"}`}
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700 group-hover:bg-brand-light group-hover:text-brand transition-colors">
                <Cpu className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-950 font-display tracking-tight flex items-center">
                  {t("home_pillar_ai_title")}
                  <ChevronRight className="w-4 h-4 ms-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all rtl:-scale-x-100" />
                </h3>
                <p className="text-xs text-neutral-500 font-medium mt-1 leading-relaxed">
                  {t("home_pillar_ai_desc")}
                </p>
              </div>
            </div>
            <div className="pt-2 text-[11px] font-mono text-brand font-bold uppercase tracking-wider">
              {t("home_pillar_ai_btn")}
            </div>
          </div>

          {/* Business Category */}
          <div 
            onClick={() => handleCategorySelect("business-entrepreneurship")}
            className={`group rounded-2xl border p-6 space-y-4 hover:border-brand/40 transition-all cursor-pointer bg-white relative overflow-hidden flex flex-col justify-between text-start ${selectedCategory === "business-entrepreneurship" ? "ring-2 ring-brand border-brand" : "border-neutral-200"}`}
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700 group-hover:bg-brand-light group-hover:text-brand transition-colors">
                <Code className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-950 font-display tracking-tight flex items-center">
                  {t("home_pillar_business_title")}
                  <ChevronRight className="w-4 h-4 ms-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all rtl:-scale-x-100" />
                </h3>
                <p className="text-xs text-neutral-500 font-medium mt-1 leading-relaxed">
                  {t("home_pillar_business_desc")}
                </p>
              </div>
            </div>
            <div className="pt-2 text-[11px] font-mono text-brand font-bold uppercase tracking-wider">
              {t("home_pillar_business_btn")}
            </div>
          </div>

          {/* Marketing Category */}
          <div 
            onClick={() => handleCategorySelect("marketing")}
            className={`group rounded-2xl border p-6 space-y-4 hover:border-brand/40 transition-all cursor-pointer bg-white relative overflow-hidden flex flex-col justify-between text-start ${selectedCategory === "marketing" ? "ring-2 ring-brand border-brand" : "border-neutral-200"}`}
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700 group-hover:bg-brand-light group-hover:text-brand transition-colors">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-950 font-display tracking-tight flex items-center">
                  {t("home_pillar_marketing_title")}
                  <ChevronRight className="w-4 h-4 ms-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all rtl:-scale-x-100" />
                </h3>
                <p className="text-xs text-neutral-500 font-medium mt-1 leading-relaxed">
                  {t("home_pillar_marketing_desc")}
                </p>
              </div>
            </div>
            <div className="pt-2 text-[11px] font-mono text-brand font-bold uppercase tracking-wider">
              {t("home_pillar_marketing_btn")}
            </div>
          </div>
        </div>
      </section>

      {/* 3. LATEST POSTS & SNIPPETS LIST (The active Bench) */}
      <section id="toolbench-grid" className="scroll-mt-20 space-y-8">
        
        {/* Filter Toolbar (Tabs structure) */}
        <div className="border-b border-neutral-200 pb-px flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-x-auto text-start">
          <div className="flex gap-6">
            <button
              onClick={() => { setSelectedCategory(""); setSelectedTag(""); }}
              className={`py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${!selectedCategory && !selectedTag ? "border-neutral-900 text-neutral-950" : "border-transparent text-neutral-400 hover:text-neutral-700"}`}
            >
              <span>{t("home_all_publications")}</span>
              <span className="text-[10px] font-mono bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">
                {posts.length}
              </span>
            </button>
            
            {categories.map((cat) => {
              const active = selectedCategory === cat.slug;
              const matches = posts.filter(p => p.category?.slug === cat.slug);
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${active ? "border-brand text-brand" : "border-transparent text-neutral-400 hover:text-neutral-700"}`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${active ? "bg-brand/10 text-brand" : "bg-neutral-100 text-neutral-400"}`}>
                    {matches.length}
                  </span>
                </button>
              );
            })}
          </div>

          {(selectedCategory || selectedTag) && (
            <button
              onClick={() => { setSelectedCategory(""); setSelectedTag(""); }}
              className="text-xs font-mono text-neutral-500 hover:text-brand cursor-pointer whitespace-nowrap"
            >
              {t("home_clear_filters")}
            </button>
          )}
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Listings */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="py-24 text-center text-neutral-400 font-mono text-sm animate-pulse flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-neutral-400" />
                <span>{t("home_reading_state")}</span>
              </div>
            ) : posts.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-neutral-200 bg-white rounded-2xl p-8 space-y-3">
                <p className="text-sm text-neutral-500 font-medium">{t("home_empty_filter")}</p>
                <button
                  onClick={() => { setSelectedCategory(""); setSelectedTag(""); }}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-850 cursor-pointer"
                >
                  {t("home_show_all")}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post) => {
                  const hasVideo = post.blocks?.some(b => b.type === "APARAT_EMBED");
                  const hasCode = post.blocks?.some(b => b.type === "CODE_SNIPPET");
                  const hasDownload = post.blocks?.some(b => b.type === "DOWNLOAD_BOX");

                  const codeBlock = post.blocks?.find(b => b.type === "CODE_SNIPPET");
                  const downloadBlock = post.blocks?.find(b => b.type === "DOWNLOAD_BOX");

                  const dateLocale = locale === "fa" ? "fa-IR" : "en-US";
                  const formattedDate = post.publishedAt 
                    ? new Date(post.publishedAt).toLocaleDateString(dateLocale, { year: "numeric", month: "long" })
                    : t("post_draft_mode");

                  return (
                    <article key={post.id} className="group bg-white rounded-2xl border border-neutral-200 hover:border-brand/40 hover:shadow-md transition-all flex flex-col h-full overflow-hidden text-start">
                      
                      {/* CARD COVER / THE SIGNATURE ELEMENT (Design Risk) */}
                      <div className="relative aspect-video w-full border-b border-neutral-100 overflow-hidden bg-neutral-950" dir="ltr">
                        {hasCode && codeBlock ? (
                          /* Miniature Interactive Code Block Editor */
                          <div className="w-full h-full flex flex-col justify-between">
                            <div className="flex items-center justify-between px-3.5 py-2 bg-neutral-900 border-b border-neutral-800">
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-neutral-700" />
                                <div className="w-2 h-2 rounded-full bg-neutral-700" />
                                <span className="text-[9px] font-mono text-neutral-500 ms-1">
                                  {codeBlock.data.language || "typescript"}
                                </span>
                              </div>
                              <button
                                onClick={(e) => handleQuickCopy(e, post.id, codeBlock.data.code)}
                                className="flex items-center text-[9px] font-mono text-neutral-400 hover:text-white transition-colors bg-neutral-950/50 py-0.5 px-1.5 rounded cursor-pointer"
                                title="Copy snippet to clipboard"
                              >
                                {copiedPostId === post.id ? (
                                  <>
                                    <Check className="w-2.5 h-2.5 me-1 text-emerald-400" />
                                    <span className="text-emerald-400">{t("home_demo_copied")}</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-2.5 h-2.5 me-1" />
                                    <span>{t("home_demo_copy")}</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="p-3.5 overflow-hidden text-[10px] leading-relaxed font-mono text-neutral-300 flex-1 select-none text-start" dir="ltr">
                              <code>{codeBlock.data.code}</code>
                            </pre>
                            <div className="p-2 bg-neutral-900/60 text-center border-t border-neutral-850">
                              <Link to={`/blog/${post.slug}`} className="text-[9px] font-mono font-bold text-neutral-400 hover:text-brand transition-colors">
                                {t("home_view_snippet")}
                              </Link>
                            </div>
                          </div>
                        ) : hasDownload && downloadBlock ? (
                          /* Miniature Live Download Card */
                          <div className="w-full h-full flex flex-col justify-between p-4 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px] bg-neutral-950">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                                {t("block_free_download")}
                              </span>
                              <span className="text-[9px] font-mono text-neutral-500">
                                {downloadBlock.data.size || "Zip File"}
                              </span>
                            </div>
                            <div className="text-center space-y-1.5 my-2">
                              <h4 className="text-xs font-bold text-neutral-100 font-sans tracking-tight leading-snug line-clamp-1 px-2">
                                {downloadBlock.data.filename || "asset-file.zip"}
                              </h4>
                              <p className="text-[9px] font-mono text-neutral-500">
                                {t("home_download_stats")}: {downloadBlock.data.downloads || 0} {t("block_downloads_count")}
                              </p>
                            </div>
                            <a
                              href={downloadBlock.id ? `/downloads/${downloadBlock.id}` : (downloadBlock.data.link || "#")}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full py-1.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-white font-mono text-[10px] font-bold rounded-md transition-colors text-center inline-flex items-center justify-center cursor-pointer"
                            >
                              <FileDown className="w-3 h-3 me-1" /> {t("block_trigger_download")}
                            </a>
                          </div>
                        ) : hasVideo ? (
                          /* Interactive Video Card preview */
                          <Link to={`/blog/${post.slug}`} className="block w-full h-full relative group">
                            <img 
                              src={post.coverImage || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97"} 
                              alt={post.title} 
                              className="w-full h-full object-cover opacity-60 group-hover:scale-101 transition-all duration-300"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-200">
                                <Play className="w-5 h-5 fill-current ms-0.5" />
                              </div>
                            </div>
                            <span className="absolute bottom-2 right-2 bg-neutral-950/80 text-[9px] font-mono px-2 py-0.5 rounded text-neutral-300">
                              {t("home_video_tutorial_badge")}
                            </span>
                          </Link>
                        ) : (
                          /* Standard Image Fallback */
                          <Link to={`/blog/${post.slug}`} className="block w-full h-full relative group">
                            <img 
                              src={post.coverImage || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97"} 
                              alt={post.title} 
                              className="w-full h-full object-cover group-hover:scale-101 transition-all duration-300"
                              referrerPolicy="no-referrer"
                            />
                          </Link>
                        )}
                      </div>

                      {/* Content Area */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4 bg-white text-start">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                            <span className="font-bold text-neutral-500 uppercase tracking-wider">
                              {post.category?.name || t("dashboard_uncategorized")}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 me-1 animate-pulse" /> {formattedDate}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-neutral-950 group-hover:text-brand transition-colors tracking-tight line-clamp-2 leading-snug">
                            <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                          </h3>

                          {post.excerpt && (
                            <p className="text-neutral-500 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                              {post.excerpt}
                            </p>
                          )}
                        </div>

                        {/* Capabilities Indicators */}
                        <div className="pt-3.5 border-t border-neutral-100 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1">
                            {hasCode && (
                              <span className="inline-flex items-center text-[9px] font-mono bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded" title="Includes copyable snippet">
                                <Code className="w-3 h-3 me-1 text-neutral-400" /> code
                              </span>
                            )}
                            {hasDownload && (
                              <span className="inline-flex items-center text-[9px] font-mono bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded" title="Includes free download asset">
                                <FileDown className="w-3 h-3 me-1 text-neutral-400" /> file
                              </span>
                            )}
                            {hasVideo && (
                              <span className="inline-flex items-center text-[9px] font-mono bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded" title="Includes video tutorial">
                                <Play className="w-3 h-3 me-1 text-neutral-400" /> video
                              </span>
                            )}
                          </div>

                          <Link to={`/blog/${post.slug}`} className="text-[10px] sm:text-xs font-bold text-neutral-950 hover:text-brand flex items-center transition-colors">
                            <span>{t("home_get_asset")}</span>
                            <ChevronRight className="w-3.5 h-3.5 ms-0.5 rtl:-scale-x-100" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar Filters */}
          <div className="space-y-6 text-start">
            
            {/* Direct Tags Filter */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4">
              <h4 className="text-xs font-bold text-neutral-950 uppercase tracking-wider font-display flex items-center">
                <Filter className="w-3.5 h-3.5 me-1.5 text-brand" /> {t("home_filter_by_tag")}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedTag("")}
                  className={`text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${!selectedTag ? "bg-neutral-900 text-white" : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100"}`}
                >
                  {t("home_all_tags")}
                </button>
                {tags.map((tag) => {
                  const active = selectedTag === tag.slug;
                  return (
                    <button
                      key={tag.id}
                      onClick={() => {
                        setSelectedTag(active ? "" : tag.slug);
                        setSelectedCategory("");
                        setTimeout(scrollToGrid, 50);
                      }}
                      className={`text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${active ? "bg-brand text-white" : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100"}`}
                    >
                      #{tag.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick About */}
            <div className="bg-neutral-900 text-neutral-200 rounded-2xl p-5 space-y-4 border border-neutral-800">
              <span className="text-[9px] font-mono text-brand font-bold uppercase tracking-widest block">{t("home_about_badge")}</span>
              <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                {t("home_about_desc")}
              </p>
              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                <span>{t("home_about_active")}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}

// ==========================================
// 2. SINGLE BLOG POST VIEW SCREEN
// ==========================================
function BlogPostView() {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const { locale, t } = useLanguage();

  useEffect(() => {
    async function loadPost() {
      try {
        setLoading(true);
        const res = await fetch(`/api/posts/${slug}`);
        if (!res.ok) {
          throw new Error("Article could not be retrieved");
        }
        const data = await res.json();
        setPost(data);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [slug]);

  useEffect(() => {
    if (!post) return;
    async function loadRelated() {
      try {
        const res = await fetch(`/api/posts?status=PUBLISHED`);
        if (res.ok) {
          const data = await res.json();
          const allPosts: Post[] = data.posts || [];
          // Filter: same category, exclude current post, limit to 3
          const filtered = allPosts
            .filter(p => p.categoryId === post.categoryId && p.id !== post.id)
            .slice(0, 3);
          setRelatedPosts(filtered);
        }
      } catch (err) {
        console.error("Error loading related posts:", err);
      }
    }
    loadRelated();
  }, [post]);

  useEffect(() => {
    if (!post) return;

    const origin = window.location.origin;
    const url = `${origin}/blog/${post.slug}`;
    const articleSchema = getArticleSchema({
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || "",
      datePublished: post.publishedAt || post.createdAt || new Date().toISOString(),
      dateModified: post.updatedAt || post.publishedAt || post.createdAt || new Date().toISOString(),
      authorName: post.author?.name || "Editor",
      imageUrl: post.coverImage || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
      url
    });

    const breadcrumbItems = [
      { name: t("nav_home") || "Home", item: origin }
    ];
    if (post.category) {
      breadcrumbItems.push({
        name: post.category.name,
        item: `${origin}/?category=${post.category.id || ""}`
      });
    }
    breadcrumbItems.push({
      name: post.title,
      item: url
    });

    const breadcrumbSchema = getBreadcrumbSchema(breadcrumbItems);

    setPageSeo({
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || "",
      jsonLd: [articleSchema, breadcrumbSchema]
    });

    return () => {
      clearJsonLd();
    };
  }, [post, t]);

  const getReadingTime = (currentPost: Post): number => {
    if (!currentPost || !currentPost.blocks) return 1;
    let wordCount = 0;
    currentPost.blocks.forEach(b => {
      if (b.type === "RICH_TEXT" && b.data?.html) {
        const text = b.data.html.replace(/<[^>]*>/g, " ");
        wordCount += text.split(/\s+/).filter(Boolean).length;
      } else if (b.type === "CODE_SNIPPET" && b.data?.code) {
        wordCount += b.data.code.split(/\s+/).filter(Boolean).length;
      }
    });
    wordCount += currentPost.title.split(/\s+/).filter(Boolean).length;
    if (currentPost.excerpt) {
      wordCount += currentPost.excerpt.split(/\s+/).filter(Boolean).length;
    }
    const min = Math.ceil(wordCount / 200);
    return min < 1 ? 1 : min;
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center text-neutral-500 font-medium animate-pulse">
        {t("post_fetch_details")}
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-neutral-900">{t("post_not_found")}</h2>
        <p className="text-neutral-500 mt-1">{error || t("post_not_found_desc")}</p>
        <Link to="/" className="mt-6 inline-flex items-center text-sm font-semibold text-brand hover:underline cursor-pointer">
          {t("post_return_btn")}
        </Link>
      </div>
    );
  }

  const coverUrl = post.coverImage || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97";
  const dateLocale = locale === "fa" ? "fa-IR" : "en-US";
  const formattedDate = post.publishedAt 
    ? new Date(post.publishedAt).toLocaleDateString(dateLocale, { year: "numeric", month: "long", day: "numeric" })
    : t("post_draft_mode");

  const readingTime = getReadingTime(post);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Back to index link */}
      <Link to="/" className="inline-flex items-center text-xs font-mono font-bold text-neutral-400 hover:text-neutral-700 transition-colors">
        {t("post_back_link")}
      </Link>

      <article className="space-y-8 text-start">
        {/* Category & Tags */}
        <div className="flex flex-wrap gap-2 items-center">
          {post.category && (
            <span className="bg-brand-light text-brand text-xs font-bold px-3 py-1 rounded-full">
              {post.category.name}
            </span>
          )}
          {post.tags?.map((tag) => (
            <span key={tag.id} className="text-xs text-neutral-500 font-mono">
              #{tag.name}
            </span>
          ))}
        </div>

        {/* Title & Metadata */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 font-display tracking-tight leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-mono text-neutral-500">
            <span>{t("post_published_on")} {formattedDate}</span>
            <span>•</span>
            <span>{t("post_by")} {post.author?.name || "Editor"}</span>
            <span>•</span>
            <span className="flex items-center">
              <Clock className="w-3.5 h-3.5 me-1 animate-pulse" /> {readingTime} {t("post_min_read")}
            </span>
          </div>
        </div>

        {/* Featured Image */}
        <div className="aspect-video rounded-2xl overflow-hidden border border-neutral-200 shadow-md">
          <img 
            src={coverUrl} 
            alt={post.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-lg text-neutral-600 font-medium italic border-s-4 border-brand ps-4 leading-relaxed my-6">
            {post.excerpt}
          </p>
        )}

        {/* Article Blocks Loop */}
        <div className="space-y-6 mt-8">
          {post.blocks?.map((block) => (
            <BlockRenderer key={block.id || block.order} block={block} />
          ))}
        </div>
      </article>

      {/* Related Posts Section */}
      {relatedPosts.length > 0 && (
        <section className="pt-10 border-t border-neutral-200 space-y-6">
          <div className="space-y-1 text-start">
            <span className="text-[9px] font-mono font-bold tracking-widest text-brand uppercase block">
              {t("post_related_title")}
            </span>
            <h3 className="text-lg font-bold text-neutral-900 font-display tracking-tight">
              {t("post_related_subtitle")} {post.category?.name || t("dashboard_uncategorized")}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedPosts.map((related) => (
              <Link 
                key={related.id} 
                to={`/blog/${related.slug}`}
                className="group flex flex-col space-y-2.5 hover:opacity-95 block text-start"
              >
                <div className="aspect-video rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 relative" dir="ltr">
                  <img 
                    src={related.coverImage || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97"} 
                    alt={related.title} 
                    className="w-full h-full object-cover group-hover:scale-101 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  {related.blocks?.some(b => b.type === "CODE_SNIPPET") && (
                    <span className="absolute top-2 right-2 bg-neutral-950/80 text-[8px] font-mono px-1.5 py-0.5 rounded text-neutral-300">
                      CODE
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-neutral-400">
                    {related.publishedAt ? new Date(related.publishedAt).toLocaleDateString(dateLocale, { month: "short", year: "numeric" }) : t("post_draft_mode")}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-neutral-900 group-hover:text-brand transition-colors line-clamp-2 leading-snug">
                    {related.title}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}

// ==========================================
// 3. ADMIN PORTAL LOGIN SCREEN
// ==========================================
function Login() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login verification failed");
      }

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Navigate to Admin home
      navigate("/admin");
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.includes("verification") || msg.includes("failed")) {
        setError(t("login_error_failed"));
      } else if (msg.includes("credentials")) {
        setError(t("login_error_invalid"));
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-24">
      <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-xl space-y-6">
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl font-extrabold font-display tracking-tight text-neutral-900">{t("login_title")}</h2>
          <p className="text-xs text-neutral-500">{t("login_subtitle")}</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-150 rounded-lg flex items-center text-xs text-red-700">
            <AlertCircle className="w-4 h-4 me-2 shrink-0 animate-pulse" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 block text-start">{t("login_email")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@betavan.ir"
              required
              className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand focus:bg-white transition-colors text-start"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 block text-start">{t("login_password")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand focus:bg-white transition-colors text-start"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neutral-900 hover:bg-brand text-white font-bold text-sm py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            {loading ? t("login_authenticating") : t("login_btn")}
          </button>
        </form>

        <div className="pt-4 border-t border-neutral-100 text-center">
          <span className="text-[10px] text-neutral-400 font-mono">
            {t("login_default_credentials")}
          </span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. ADMIN DASHBOARD SCREEN
// ==========================================
function AdminDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"posts" | "categories" | "tags" | "pages">("posts");

  // Category & Tag form states
  const [newCatName, setNewCatName] = useState("");
  const [newTagName, setNewTagName] = useState("");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("accessToken");

      const [postsRes, catRes, tagRes] = await Promise.all([
        fetch("/api/posts?status="), // Load all including drafts
        fetch("/api/categories"),
        fetch("/api/tags")
      ]);

      if (postsRes.ok) {
        const postData = await postsRes.json();
        setPosts(postData.posts || []);
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }
      if (tagRes.ok) {
        const tagData = await tagRes.json();
        setTags(tagData);
      }
    } catch (err: any) {
      setError(t("dashboard_loading_error") || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleDeletePost = async (id: string) => {
    if (!window.confirm(t("dashboard_delete_confirm"))) return;
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Delete failed");
      await loadDashboardData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: newCatName })
      });
      if (res.ok) {
        setNewCatName("");
        await loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName) return;
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: newTagName })
      });
      if (res.ok) {
        setNewTagName("");
        await loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-start">
          <h2 className="text-2xl font-extrabold text-neutral-900 font-display tracking-tight">{t("dashboard_title")}</h2>
          <p className="text-xs text-neutral-500">{t("dashboard_subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/posts/new"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-neutral-950 text-white font-semibold text-xs hover:bg-brand transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 me-1.5" /> {t("dashboard_new_post")}
          </Link>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="border-b border-neutral-200">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("posts")}
            className={`py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${activeTab === "posts" ? "border-brand text-brand" : "border-transparent text-neutral-500 hover:text-neutral-800"}`}
          >
            {t("dashboard_tab_articles")} ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${activeTab === "categories" ? "border-brand text-brand" : "border-transparent text-neutral-500 hover:text-neutral-800"}`}
          >
            {t("dashboard_tab_categories")} ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab("tags")}
            className={`py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${activeTab === "tags" ? "border-brand text-brand" : "border-transparent text-neutral-500 hover:text-neutral-800"}`}
          >
            {t("dashboard_tab_tags")} ({tags.length})
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 text-center text-neutral-500 font-medium">{t("dashboard_loading")}</div>
        ) : (
          <>
            {activeTab === "posts" && (
              <div className="overflow-x-auto">
                <table className="w-full text-start text-sm border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold text-xs uppercase tracking-wider">
                      <th className="p-4 text-start">{t("dashboard_table_title")}</th>
                      <th className="p-4 text-start">{t("dashboard_table_category")}</th>
                      <th className="p-4 text-start">{t("dashboard_table_tags")}</th>
                      <th className="p-4 text-start">{t("dashboard_table_status")}</th>
                      <th className="p-4 text-start">{t("dashboard_table_date")}</th>
                      <th className="p-4 text-end">{t("dashboard_table_actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-150">
                    {posts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-neutral-500">
                          {t("dashboard_no_posts")}
                        </td>
                      </tr>
                    ) : (
                      posts.map((post) => (
                        <tr key={post.id} className="hover:bg-neutral-50/50 transition-colors">
                          <td className="p-4 text-start">
                            <span className="font-semibold text-neutral-900 block line-clamp-1">{post.title}</span>
                            <span className="text-[10px] font-mono text-neutral-400">/{post.slug}</span>
                          </td>
                          <td className="p-4 text-start text-xs font-semibold text-neutral-700">
                            {post.category?.name || t("dashboard_uncategorized")}
                          </td>
                          <td className="p-4 text-start">
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {post.tags?.map(t => (
                                <span key={t.id} className="text-[9px] font-mono bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">
                                  {t.name}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-4 text-start">
                            <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${post.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}>
                              {post.status}
                            </span>
                          </td>
                          <td className="p-4 text-start text-xs text-neutral-500 font-mono">
                            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : t("edit_status_draft")}
                          </td>
                          <td className="p-4 text-end">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                to={`/blog/${post.slug}`}
                                className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-neutral-900 transition-colors"
                                title={t("dashboard_preview")}
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <Link
                                to={`/admin/posts/edit/${post.id}`}
                                className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-brand transition-colors"
                                title={t("dashboard_edit")}
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-700 transition-colors"
                                title={t("dashboard_delete")}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "categories" && (
              <div className="p-6 space-y-6">
                <form onSubmit={handleCreateCategory} className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder={t("dashboard_add_category_placeholder")}
                    required
                    className="flex-1 text-sm bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:border-brand focus:bg-white text-start"
                  />
                  <button type="submit" className="bg-neutral-900 hover:bg-brand text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
                    {t("dashboard_add_category_btn")}
                  </button>
                </form>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {categories.map(cat => (
                    <div key={cat.id} className="p-3 border border-neutral-200 rounded-xl bg-neutral-50/50 flex flex-col justify-between text-start">
                      <span className="font-semibold text-neutral-900 text-sm">{cat.name}</span>
                      <span className="text-[10px] font-mono text-neutral-400 mt-1">/{cat.slug}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "tags" && (
              <div className="p-6 space-y-6">
                <form onSubmit={handleCreateTag} className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder={t("dashboard_add_tag_placeholder")}
                    required
                    className="flex-1 text-sm bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:border-brand focus:bg-white text-start"
                  />
                  <button type="submit" className="bg-neutral-900 hover:bg-brand text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
                    {t("dashboard_add_tag_btn")}
                  </button>
                </form>

                <div className="flex flex-wrap gap-2 text-start">
                  {tags.map(tag => (
                    <div key={tag.id} className="px-3 py-1.5 border border-neutral-200 rounded-full bg-white text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
                      <span>#{tag.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 5. POST EDITOR / WRITE SCREEN (ADMIN)
// ==========================================
function EditPost() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const { t, locale } = useLanguage();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [coverImage, setCoverImage] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);

  // SEO Fields
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [ogImage, setOgImage] = useState("");

  // Select Options Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState("");

  // AI draft & SEO state
  const [showAiDraftModal, setShowAiDraftModal] = useState(false);
  const [aiDraftTopic, setAiDraftTopic] = useState("");
  const [aiDraftGenerating, setAiDraftGenerating] = useState(false);
  const [aiSeoGenerating, setAiSeoGenerating] = useState(false);

  // Link suggestion states
  const [linkSuggestions, setLinkSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<{ index: number; type: "md" | "url" } | null>(null);

  const handleAiDraftGenerate = async () => {
    if (!aiDraftTopic.trim()) return;
    try {
      setAiDraftGenerating(true);
      setError("");
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/ai/draft-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ topic: aiDraftTopic })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate draft");
      }

      setTitle(data.title || "");
      setExcerpt(data.excerpt || "");
      setBlocks(data.blocks || []);
      setStatus("DRAFT");
      setShowAiDraftModal(false);
      setAiDraftTopic("");
    } catch (err: any) {
      setError(err.message || "An error occurred during generation");
    } finally {
      setAiDraftGenerating(false);
    }
  };

  const handleAiSeoGenerate = async () => {
    try {
      setAiSeoGenerating(true);
      setError("");
      const token = localStorage.getItem("accessToken");

      const richTexts = blocks
        .filter(b => b.type === "RICH_TEXT" && b.data?.html)
        .map(b => b.data.html.replace(/<[^>]*>/g, ""))
        .join(" ");

      const res = await fetch("/api/ai/seo-meta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          content: richTexts || excerpt || ""
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate SEO Meta");
      }

      if (data.seoTitle) setSeoTitle(data.seoTitle);
      if (data.seoDescription) setSeoDescription(data.seoDescription);
    } catch (err: any) {
      setError(err.message || "Failed to generate SEO metadata");
    } finally {
      setAiSeoGenerating(false);
    }
  };

  const handleAiSuggestLinks = async () => {
    try {
      setLoadingSuggestions(true);
      setError("");
      const token = localStorage.getItem("accessToken");

      const richTexts = blocks
        .filter(b => b.type === "RICH_TEXT" && b.data?.html)
        .map(b => b.data.html.replace(/<[^>]*>/g, ""))
        .join(" ");

      const res = await fetch("/api/ai/suggest-links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          content: richTexts || excerpt || ""
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate link suggestions");
      }

      setLinkSuggestions(data.suggestions || []);
    } catch (err: any) {
      setError(err.message || "Failed to generate internal link suggestions");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleCopySuggestion = (index: number, sugTitle: string, sugSlug: string, type: "md" | "url") => {
    const text = type === "md" ? `[${sugTitle}](/blog/${sugSlug})` : `/blog/${sugSlug}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex({ index, type });
    setTimeout(() => {
      setCopiedIndex(null);
    }, 1500);
  };

  useEffect(() => {
    async function loadEditorOptions() {
      try {
        const [catRes, tagRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/tags")
        ]);
        if (catRes.ok) setCategories(await catRes.json());
        if (tagRes.ok) setTags(await tagRes.json());
      } catch (err) {
        console.error("Option loading error", err);
      }
    }
    loadEditorOptions();
  }, []);

  useEffect(() => {
    if (isNew) return;

    async function loadPostData() {
      try {
        setLoading(true);
        // We load full posts via slug or by querying with specific params
        // Let's support loading via slug/id on endpoint
        const res = await fetch(`/api/posts`);
        if (res.ok) {
          const data = await res.json();
          const target = data.posts?.find((p: any) => p.id === id);
          if (target) {
            setTitle(target.title);
            setSlug(target.slug);
            setExcerpt(target.excerpt || "");
            setStatus(target.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT");
            setCoverImage(target.coverImage || "");
            setCategoryId(target.categoryId || "");
            setTagIds(target.tags?.map((t: any) => t.id) || []);
            setBlocks(target.blocks || []);
            
            setSeoTitle(target.seoTitle || "");
            setSeoDescription(target.seoDescription || "");
            setOgImage(target.ogImage || "");
          } else {
            throw new Error("Article data not found");
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load post for editing");
      } finally {
        setLoading(false);
      }
    }
    loadPostData();
  }, [id, isNew]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    try {
      setSaving(true);
      setError("");
      const token = localStorage.getItem("accessToken");

      const payload = {
        title,
        slug,
        excerpt,
        status,
        coverImage,
        seoTitle,
        seoDescription,
        ogImage,
        categoryId: categoryId || null,
        tagIds,
        blocks: blocks.map((b, index) => ({
          type: b.type,
          order: index,
          data: b.data
        }))
      };

      const endpoint = isNew ? "/api/posts" : `/api/posts/${id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Save operation failed");
      }

      navigate("/admin");
    } catch (err: any) {
      setError(err.message || "An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  const handleTagToggle = (tagId: string) => {
    setTagIds(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  // Dynamic SEO Checklist calculations
  const totalTextLength = blocks
    .filter(b => b.type === "RICH_TEXT" && b.data?.html)
    .reduce((acc, b) => acc + b.data.html.replace(/<[^>]*>/g, "").trim().length, 0);

  const hasEnoughContent = title.trim().length >= 3 && totalTextLength >= 20;

  // 1. SEO Title
  const seoTitleLength = seoTitle.trim().length;
  let seoTitleState: "green" | "yellow" | "red" = "red";
  let seoTitleMsg = t("seo_checklist_title_empty");
  if (seoTitleLength > 0) {
    if (seoTitleLength >= 50 && seoTitleLength <= 60) {
      seoTitleState = "green";
      seoTitleMsg = `${t("seo_checklist_title_perfect")} (${seoTitleLength} ${t("seo_checklist_chars")}).`;
    } else {
      seoTitleState = "yellow";
      seoTitleMsg = `${t("seo_checklist_title_warn")} (${seoTitleLength} ${t("seo_checklist_chars")}).`;
    }
  }

  // 2. SEO Description
  const seoDescLength = seoDescription.trim().length;
  let seoDescState: "green" | "yellow" | "red" = "red";
  let seoDescMsg = t("seo_checklist_desc_empty");
  if (seoDescLength > 0) {
    if (seoDescLength >= 120 && seoDescLength <= 160) {
      seoDescState = "green";
      seoDescMsg = `${t("seo_checklist_desc_perfect")} (${seoDescLength} ${t("seo_checklist_chars")}).`;
    } else {
      seoDescState = "yellow";
      seoDescMsg = `${t("seo_checklist_desc_warn")} (${seoDescLength} ${t("seo_checklist_chars")}).`;
    }
  }

  // 3. Image Alt texts
  const imageBlocks = blocks.filter(b => b.type === "IMAGE");
  let imageAltState: "green" | "yellow" | "red" | "gray" = "gray";
  let imageAltMsg = t("seo_checklist_img_none");
  if (imageBlocks.length > 0) {
    const imagesWithAlt = imageBlocks.filter(b => b.data?.alt && b.data.alt.trim().length > 0);
    if (imagesWithAlt.length > 0) {
      imageAltState = "green";
      imageAltMsg = `${t("seo_checklist_img_perfect")} (${imagesWithAlt.length}/${imageBlocks.length} ${t("seo_checklist_images")}).`;
    } else {
      imageAltState = "red";
      imageAltMsg = t("seo_checklist_img_missing");
    }
  }

  // 4. Category and tag assigned
  const hasCategory = categoryId !== "";
  const hasTags = tagIds.length > 0;
  let catTagState: "green" | "yellow" | "red" = "red";
  let catTagMsg = t("seo_checklist_cattag_none");
  if (hasCategory && hasTags) {
    catTagState = "green";
    catTagMsg = t("seo_checklist_cattag_perfect");
  } else if (hasCategory || hasTags) {
    catTagState = "yellow";
    catTagMsg = hasCategory 
      ? t("seo_checklist_tag_missing")
      : t("seo_checklist_cat_missing");
  }

  // 5. Slug format check
  const hasSlug = slug.trim().length > 0;
  const isSlugLowercase = slug === slug.toLowerCase();
  const isSlugHyphenated = /^[a-z0-9-]+$/.test(slug);
  let slugState: "green" | "yellow" | "red" = "red";
  let slugMsg = t("seo_checklist_slug_empty");
  if (hasSlug) {
    if (isSlugLowercase && isSlugHyphenated) {
      slugState = "green";
      slugMsg = t("seo_checklist_slug_perfect");
    } else {
      slugState = "yellow";
      slugMsg = t("seo_checklist_slug_warn");
    }
  }

  // 6. Heading block exists in body
  const hasHeading = blocks.some(b => b.type === "RICH_TEXT" && b.data?.html && /<h[1-6]/i.test(b.data.html));
  let headingState: "green" | "red" = "red";
  let headingMsg = t("seo_checklist_heading_missing");
  if (hasHeading) {
    headingState = "green";
    headingMsg = t("seo_checklist_heading_perfect");
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center text-neutral-500 font-medium">
        {t("edit_loading")}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link to="/admin" className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 flex items-center">
          <span className="rtl:scale-x-[-1] inline-block me-1.5 font-sans">←</span> {t("edit_back_btn")}
        </Link>
        <span className="text-xs font-mono text-neutral-400">
          {isNew ? t("edit_new_title") : `${t("edit_editing_title")}: ${title}`}
        </span>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-150 rounded-xl flex items-center text-sm text-red-700 text-start">
          <AlertCircle className="w-5 h-5 me-2 shrink-0 animate-pulse" />
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Editor Section */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Title & Slug */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 shadow-xs text-start">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">{t("edit_article_title")}</label>
                <button
                  type="button"
                  onClick={() => setShowAiDraftModal(true)}
                  className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 hover:border-indigo-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>{t("ai_draft_post_btn")}</span>
                </button>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("edit_article_title_placeholder")}
                required
                className="w-full text-lg font-bold bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand focus:bg-white text-start"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">{t("edit_slug")}</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder={t("edit_slug_placeholder")}
                  className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-brand focus:bg-white font-mono text-start"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">{t("edit_cover_img")}</label>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-brand focus:bg-white text-start"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">{t("edit_excerpt")}</label>
              <textarea
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder={t("edit_excerpt_placeholder")}
                className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-brand focus:bg-white leading-relaxed text-start"
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
          {/* Status & Category Panel */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-5 shadow-xs text-start">
            <h4 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3">{t("edit_status_title")}</h4>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">{t("edit_status_label")}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus("DRAFT")}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${status === "DRAFT" ? "bg-neutral-900 border-neutral-900 text-white shadow-xs" : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100"}`}
                >
                  {t("edit_status_draft")}
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("PUBLISHED")}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${status === "PUBLISHED" ? "bg-emerald-600 border-emerald-600 text-white shadow-xs" : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100"}`}
                >
                  {t("edit_status_published")}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">{t("edit_category_label")}</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-brand focus:bg-white font-medium"
              >
                <option value="">{t("dashboard_uncategorized")}</option>
                {(() => {
                  const buildOptionTree = (flatList: any[]) => {
                    const idMap: Record<string, any> = {};
                    flatList.forEach(c => { idMap[c.id] = { ...c, children: [] }; });
                    const roots: any[] = [];
                    flatList.forEach(c => {
                      const node = idMap[c.id];
                      if (node.parentId && idMap[node.parentId]) {
                        idMap[node.parentId].children.push(node);
                      } else {
                        roots.push(node);
                      }
                    });
                    return roots;
                  };

                  const flattenTree = (nodes: any[], level = 0): { id: string; name: string; level: number }[] => {
                    let res: any[] = [];
                    nodes.forEach(n => {
                      res.push({ id: n.id, name: n.name, level });
                      if (n.children && n.children.length > 0) {
                        res = res.concat(flattenTree(n.children, level + 1));
                      }
                    });
                    return res;
                  };

                  const orderedList = flattenTree(buildOptionTree(categories));
                  return orderedList.map(({ id, name, level }) => {
                    const prefix = level > 0 ? "  ".repeat(level) + "↳ " : "";
                    return (
                      <option key={id} value={id}>
                        {prefix}{name}
                      </option>
                    );
                  });
                })()}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">{t("edit_tags_label")}</label>
              <div className="flex flex-wrap gap-1.5">
                {tags.map(tag => {
                  const selected = tagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${selected ? "bg-brand border-brand text-white" : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100"}`}
                    >
                      #{tag.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SEO Metadata Settings */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 shadow-xs text-start">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h4 className="text-sm font-bold text-neutral-900 flex items-center">
                <Settings className="w-4 h-4 me-1.5 text-brand" /> {t("edit_seo_options")}
              </h4>
              <button
                type="button"
                onClick={handleAiSeoGenerate}
                disabled={aiSeoGenerating || !title}
                className="px-2 py-1 text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 hover:border-indigo-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {aiSeoGenerating ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Cpu className="w-3 h-3" />
                )}
                <span>{t("ai_generate_seo_btn")}</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">{t("edit_seo_title")}</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Google Search Title"
                className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-brand focus:bg-white text-start"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">{t("edit_seo_description")}</label>
              <textarea
                rows={3}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Google Snippet Description"
                className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-brand focus:bg-white text-start"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">{t("edit_og_image")}</label>
              <input
                type="text"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                placeholder="OpenGraph Link Image"
                className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-brand focus:bg-white text-start"
              />
            </div>
          </div>

          {/* On-Page SEO Checklist */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 shadow-xs text-start">
            <h4 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3 flex items-center gap-1.5">
              <span className="inline-block p-1 bg-emerald-50 text-emerald-600 rounded-lg">✓</span>
              {t("seo_engine_checklist")}
            </h4>
            
            <div className="space-y-3.5 pt-1">
              {(() => {
                const renderChecklistItem = (itemState: "green" | "yellow" | "red" | "gray", text: string) => {
                  let iconColor = "text-red-500";
                  let textColor = "text-neutral-700 font-medium";
                  let icon = "✗";

                  if (itemState === "green") {
                    iconColor = "text-emerald-500";
                    textColor = "text-neutral-900";
                    icon = "✓";
                  } else if (itemState === "yellow") {
                    iconColor = "text-amber-500";
                    textColor = "text-neutral-700";
                    icon = "⚠";
                  } else if (itemState === "gray") {
                    iconColor = "text-neutral-400";
                    textColor = "text-neutral-400 font-normal";
                    icon = "•";
                  }

                  return (
                    <div className="flex items-start gap-2.5 text-xs text-start">
                      <span className={`font-bold shrink-0 text-sm leading-none ${iconColor}`}>{icon}</span>
                      <span className={textColor}>{text}</span>
                    </div>
                  );
                };

                return (
                  <>
                    {renderChecklistItem(seoTitleState, seoTitleMsg)}
                    {renderChecklistItem(seoDescState, seoDescMsg)}
                    {renderChecklistItem(imageAltState, imageAltMsg)}
                    {renderChecklistItem(catTagState, catTagMsg)}
                    {renderChecklistItem(slugState, slugMsg)}
                    {renderChecklistItem(headingState, headingMsg)}
                  </>
                );
              })()}
            </div>
          </div>

          {/* AI Internal Linking Panel */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 shadow-xs text-start">
            <h4 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-brand" />
              {t("seo_engine_internal_links")}
            </h4>

            {!hasEnoughContent ? (
              <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                {t("seo_engine_write_more")}
              </p>
            ) : (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleAiSuggestLinks}
                  disabled={loadingSuggestions}
                  className="w-full py-2 px-3 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loadingSuggestions ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>{t("seo_engine_suggesting")}</span>
                    </>
                  ) : (
                    <>
                      <Cpu className="w-3.5 h-3.5" />
                      <span>{t("seo_engine_suggest_btn")}</span>
                    </>
                  )}
                </button>

                {linkSuggestions.length > 0 ? (
                  <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                    {linkSuggestions.map((sug, idx) => (
                      <div key={idx} className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 space-y-2 text-start">
                        <div className="font-semibold text-xs text-neutral-800 line-clamp-1">
                          {sug.title}
                        </div>
                        <p className="text-[11px] text-neutral-500 leading-normal italic">
                          {sug.reason}
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopySuggestion(idx, sug.title, sug.slug, "md")}
                            className="flex-1 py-1 px-2 text-[10px] font-bold bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-md transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-2.5 h-2.5" />
                            <span>
                              {copiedIndex?.index === idx && copiedIndex?.type === "md" 
                                ? t("seo_engine_copied_md") 
                                : t("seo_engine_copy_md")}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopySuggestion(idx, sug.title, sug.slug, "url")}
                            className="flex-1 py-1 px-2 text-[10px] font-bold bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-md transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            <span>
                              {copiedIndex?.index === idx && copiedIndex?.type === "url" 
                                ? t("seo_engine_copied_url") 
                                : t("seo_engine_copy_url")}
                            </span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400 text-center py-2">
                    {t("seo_engine_no_suggestions")}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Master Save Trigger */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 px-4 bg-brand hover:bg-brand-hover text-white text-sm font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
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

      {/* AI Draft Prompt Modal */}
      {showAiDraftModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl max-w-md w-full p-6 space-y-4 text-start animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-600" />
                {t("ai_draft_post_title")}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAiDraftModal(false);
                  setError("");
                }}
                className="text-neutral-400 hover:text-neutral-600 font-bold p-1 text-sm leading-none"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-150 rounded-xl text-xs text-red-700 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 block">{t("ai_draft_post_topic")}</label>
              <textarea
                rows={3}
                value={aiDraftTopic}
                onChange={(e) => setAiDraftTopic(e.target.value)}
                placeholder={t("ai_draft_post_topic_placeholder")}
                disabled={aiDraftGenerating}
                className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-xl p-3 focus:outline-none focus:border-brand focus:bg-white text-start resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-neutral-100 pt-3">
              <button
                type="button"
                disabled={aiDraftGenerating}
                onClick={() => {
                  setShowAiDraftModal(false);
                  setError("");
                }}
                className="px-3.5 py-1.5 text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors cursor-pointer"
              >
                {t("categories_cancel")}
              </button>
              <button
                type="button"
                disabled={aiDraftGenerating || !aiDraftTopic.trim()}
                onClick={handleAiDraftGenerate}
                className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {aiDraftGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{t("ai_generating")}</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-3.5 h-3.5" />
                    <span>{t("ai_draft_post_generate_btn")}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 6. MASTER APP ENTRYPOINT (ROUTING)
// ==========================================
function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-white border-t border-neutral-150 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-xs text-neutral-400 font-medium text-center sm:text-start">
          © {new Date().getFullYear()} Betavan.ir. {t("footer_copyright")}
        </span>
        <div className="flex gap-5 flex-wrap text-xs font-mono justify-center sm:justify-start">
          <a href="/sitemap.xml" target="_blank" className="text-neutral-400 hover:text-neutral-700 transition-colors">sitemap.xml</a>
          <a href="/robots.txt" target="_blank" className="text-neutral-400 hover:text-neutral-700 transition-colors">robots.txt</a>
        </div>
      </div>
    </footer>
  );
}

function SiteWideOrganizationSchema() {
  useEffect(() => {
    const origin = window.location.origin;
    const existing = document.getElementById("jsonld-organization");
    if (!existing) {
      const script = document.createElement("script");
      script.id = "jsonld-organization";
      script.type = "application/ld+json";
      script.innerHTML = JSON.stringify(getOrganizationSchema(origin));
      document.head.appendChild(script);
    }
  }, []);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <CartProvider>
          <SiteWideOrganizationSchema />
          <div className="min-h-screen bg-neutral-50 flex flex-col justify-between">
            <div>
              <Navbar />
            <Routes>
              <Route path="/" element={<BlogHome />} />
              <Route path="/blog/:slug" element={<BlogPostView />} />
              <Route path="/shop" element={<Storefront />} />
              <Route path="/shop/:slug" element={<ProductDetail />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-result/:orderId" element={<OrderResult />} />
              <Route path="/login" element={<Login />} />
              <Route path="/search" element={<SearchResults />} />
              
              {/* Protected Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <PrivateRoute>
                    <AdminDashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/admin/categories" 
                element={
                  <PrivateRoute>
                    <AdminTaxonomies />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/admin/taxonomies" 
                element={
                  <PrivateRoute>
                    <AdminTaxonomies />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/admin/settings" 
                element={
                  <PrivateRoute>
                    <AdminSettings />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/admin/posts/new" 
                element={
                  <PrivateRoute>
                    <EditPost />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/admin/posts/edit/:id" 
                element={
                  <PrivateRoute>
                    <EditPost />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/admin/tags" 
                element={
                  <PrivateRoute>
                    <AdminTaxonomies />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/admin/pages" 
                element={
                  <PrivateRoute>
                    <AdminPages />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/admin/pages/new" 
                element={
                  <PrivateRoute>
                    <EditPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/admin/pages/edit/:id" 
                element={
                  <PrivateRoute>
                    <EditPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/admin/products" 
                element={
                  <PrivateRoute>
                    <AdminProducts />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/admin/orders" 
                element={
                  <PrivateRoute>
                    <AdminOrders />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/admin/webhooks" 
                element={
                  <PrivateRoute>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                      <AdminWebhooks />
                    </div>
                  </PrivateRoute>
                } 
              />
              <Route path="/page/:slug" element={<PageView />} />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

          {/* Global Footer */}
          <Footer />
        </div>
        </CartProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
