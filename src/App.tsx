import React, { useState, useEffect } from "react";
import { HashRouter, Routes, Route, Link, useParams, useNavigate, Navigate } from "react-router-dom";
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
  Clock
} from "lucide-react";
import { Post, Category, Tag, Page } from "./types.js";
import { Navbar } from "./components/Navbar.js";
import { BlockRenderer } from "./components/BlockRenderer.js";
import { BlockEditor } from "./components/BlockEditor.js";

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero Banner */}
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
        <h1 className="text-4xl font-extrabold text-neutral-950 font-display tracking-tight sm:text-5xl">
          Empowering Iranian <span className="text-brand">Business & AI</span>
        </h1>
        <p className="text-lg text-neutral-500 font-medium">
          A minimalist platform delivering highly-focused AI insights, copyable code frameworks, and downloadable development assets.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-neutral-200 mb-8 overflow-x-auto">
        <div className="flex space-x-6 pb-px">
          <button
            onClick={() => setSelectedCategory("")}
            className={`py-3.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${!selectedCategory ? "border-brand text-brand" : "border-transparent text-neutral-500 hover:text-neutral-800"}`}
          >
            All Articles
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`py-3.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${selectedCategory === cat.slug ? "border-brand text-brand" : "border-transparent text-neutral-500 hover:text-neutral-800"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Post Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="py-24 text-center text-neutral-500 font-medium animate-pulse">
              Retrieving latest publications...
            </div>
          ) : posts.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-neutral-200 bg-white rounded-2xl p-8">
              <p className="text-sm text-neutral-500 font-medium">No published articles match the selection.</p>
              {(selectedCategory || selectedTag) && (
                <button
                  onClick={() => {
                    setSelectedCategory("");
                    setSelectedTag("");
                  }}
                  className="mt-4 text-xs font-semibold text-brand hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post) => {
                const coverUrl = post.coverImage || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97";
                const formattedDate = post.publishedAt 
                  ? new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                  : "Draft";

                return (
                  <article key={post.id} className="group bg-white rounded-2xl border border-neutral-200 hover:border-brand/30 hover:shadow-lg transition-all overflow-hidden flex flex-col h-full">
                    <Link to={`/blog/${post.slug}`} className="relative block aspect-video overflow-hidden bg-neutral-100">
                      <img 
                        src={coverUrl} 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      {post.category && (
                        <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs text-xs font-semibold px-3 py-1 rounded-full text-brand shadow-sm">
                          {post.category.name}
                        </span>
                      )}
                    </Link>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-2.5">
                        <div className="flex items-center space-x-3.5 text-[11px] font-mono text-neutral-400">
                          <span className="flex items-center">
                            <Clock className="w-3.5 h-3.5 mr-1" /> {formattedDate}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-neutral-900 group-hover:text-brand transition-colors tracking-tight line-clamp-2">
                          <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                        </h3>
                        {post.excerpt && (
                          <p className="text-neutral-500 text-sm line-clamp-3 leading-relaxed">
                            {post.excerpt}
                          </p>
                        )}
                      </div>
                      <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {post.tags?.slice(0, 2).map((tag) => (
                            <span key={tag.id} className="text-[10px] font-mono text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">
                              #{tag.name}
                            </span>
                          ))}
                        </div>
                        <Link to={`/blog/${post.slug}`} className="text-xs font-bold text-neutral-950 hover:text-brand flex items-center">
                          Read Article <ChevronRight className="w-4 h-4 ml-0.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Tag Filter Widget */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4">
            <h4 className="text-sm font-bold text-neutral-900 flex items-center">
              <Filter className="w-4 h-4 mr-1.5 text-brand" /> Filter by Tag
            </h4>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedTag("")}
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${!selectedTag ? "bg-brand text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-250"}`}
              >
                All Tags
              </button>
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setSelectedTag(tag.slug)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${selectedTag === tag.slug ? "bg-brand text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-250"}`}
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Info */}
          <div className="bg-neutral-900 text-neutral-100 rounded-2xl p-5 space-y-3 shadow-md">
            <h4 className="text-sm font-bold font-display tracking-tight text-white">About Betavan CMS</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Designed as a minimal content-hub focusing on embedding Aparat video tutorials, providing downloadable code frameworks with zero signup friction.
            </p>
          </div>
        </div>
      </div>
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

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center text-neutral-500 font-medium animate-pulse">
        Fetching publication details...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-neutral-900">Unable to load article</h2>
        <p className="text-neutral-500 mt-1">{error || "Article does not exist"}</p>
        <Link to="/" className="mt-6 inline-flex items-center text-sm font-semibold text-brand hover:underline">
          Return to directory
        </Link>
      </div>
    );
  }

  const coverUrl = post.coverImage || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97";
  const formattedDate = post.publishedAt 
    ? new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "Draft Mode";

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
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
        <div className="flex items-center space-x-3.5 text-xs font-mono text-neutral-500">
          <span>Published on {formattedDate}</span>
          <span>•</span>
          <span>By {post.author?.name || "Editor"}</span>
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
        <p className="text-lg text-neutral-600 font-medium italic border-l-4 border-brand pl-4 leading-relaxed my-6">
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
  );
}

// ==========================================
// 3. ADMIN PORTAL LOGIN SCREEN
// ==========================================
function Login() {
  const navigate = useNavigate();
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
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-24">
      <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-xl space-y-6">
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl font-extrabold font-display tracking-tight text-neutral-900">Admin Console</h2>
          <p className="text-xs text-neutral-500">Log in with your pre-seeded administrator credentials</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-150 rounded-lg flex items-center text-xs text-red-700">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 block">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@betavan.ir"
              required
              className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand focus:bg-white transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neutral-900 hover:bg-brand text-white font-bold text-sm py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            {loading ? "Authenticating..." : "Log In"}
          </button>
        </form>

        <div className="pt-4 border-t border-neutral-100 text-center">
          <span className="text-[10px] text-neutral-400 font-mono">
            Default sandbox login: admin@betavan.ir / admin123
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
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleDeletePost = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
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
        <div>
          <h2 className="text-2xl font-extrabold text-neutral-900 font-display tracking-tight">Admin Console</h2>
          <p className="text-xs text-neutral-500">Manage all editorial posts, categories, tags, and static content</p>
        </div>
        <div className="flex space-x-2">
          <Link
            to="/admin/posts/new"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-neutral-950 text-white font-semibold text-xs hover:bg-brand transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Write New Post
          </Link>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="border-b border-neutral-200">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab("posts")}
            className={`py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${activeTab === "posts" ? "border-brand text-brand" : "border-transparent text-neutral-500 hover:text-neutral-800"}`}
          >
            Articles ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${activeTab === "categories" ? "border-brand text-brand" : "border-transparent text-neutral-500 hover:text-neutral-800"}`}
          >
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab("tags")}
            className={`py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${activeTab === "tags" ? "border-brand text-brand" : "border-transparent text-neutral-500 hover:text-neutral-800"}`}
          >
            Tags ({tags.length})
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 text-center text-neutral-500 font-medium">Loading dashboard data...</div>
        ) : (
          <>
            {activeTab === "posts" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold text-xs uppercase tracking-wider">
                      <th className="p-4">Title</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Tags</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-150">
                    {posts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-neutral-500">
                          No posts found. Start by writing your first article!
                        </td>
                      </tr>
                    ) : (
                      posts.map((post) => (
                        <tr key={post.id} className="hover:bg-neutral-50/50 transition-colors">
                          <td className="p-4">
                            <span className="font-semibold text-neutral-900 block line-clamp-1">{post.title}</span>
                            <span className="text-[10px] font-mono text-neutral-400">/{post.slug}</span>
                          </td>
                          <td className="p-4 text-xs font-semibold text-neutral-700">
                            {post.category?.name || "Uncategorized"}
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {post.tags?.map(t => (
                                <span key={t.id} className="text-[9px] font-mono bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">
                                  {t.name}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${post.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}>
                              {post.status}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-neutral-500 font-mono">
                            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "Draft"}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <Link
                                to={`/blog/${post.slug}`}
                                className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-neutral-900 transition-colors"
                                title="Preview article"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <Link
                                to={`/admin/posts/edit/${post.id}`}
                                className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-brand transition-colors"
                                title="Edit article"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-700 transition-colors"
                                title="Delete article"
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
                    placeholder="New Category Name (e.g. AI Tutorials)"
                    required
                    className="flex-1 text-sm bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:border-brand focus:bg-white"
                  />
                  <button type="submit" className="bg-neutral-900 hover:bg-brand text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer">
                    Add Category
                  </button>
                </form>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {categories.map(cat => (
                    <div key={cat.id} className="p-3 border border-neutral-200 rounded-xl bg-neutral-50/50 flex flex-col justify-between">
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
                    placeholder="New Tag Name (e.g. ChatGPT)"
                    required
                    className="flex-1 text-sm bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:border-brand focus:bg-white"
                  />
                  <button type="submit" className="bg-neutral-900 hover:bg-brand text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer">
                    Add Tag
                  </button>
                </form>

                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <div key={tag.id} className="px-3 py-1.5 border border-neutral-200 rounded-full bg-white text-xs font-semibold text-neutral-700 flex items-center space-x-1.5">
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

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center text-neutral-500 font-medium">
        Loading post details...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link to="/admin" className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 flex items-center">
          ← Back to Console
        </Link>
        <span className="text-xs font-mono text-neutral-400">
          {isNew ? "Creating New Article" : `Editing: ${title}`}
        </span>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-150 rounded-xl flex items-center text-sm text-red-700">
          <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Editor Section */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Title & Slug */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">Article Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Aparat embeds inside blog post tutorials..."
                required
                className="w-full text-lg font-bold bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">Slug URL</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="aparat-embeds-tutorial"
                  className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-brand focus:bg-white font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">Featured Cover Image URL</label>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-brand focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">Short Excerpt</label>
              <textarea
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Write a highly concise summary of the article..."
                className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-brand focus:bg-white leading-relaxed"
              />
            </div>
          </div>

          {/* Visual Block Editor */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs">
            <BlockEditor blocks={blocks} onChange={setBlocks} />
          </div>

        </div>

        {/* Sidebar Controls Section */}
        <div className="space-y-6">
          {/* Status & Category Panel */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-5 shadow-xs">
            <h4 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3">Status & Publishing</h4>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">Publication State</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus("DRAFT")}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${status === "DRAFT" ? "bg-neutral-900 border-neutral-900 text-white" : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100"}`}
                >
                  Draft
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("PUBLISHED")}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${status === "PUBLISHED" ? "bg-emerald-600 border-emerald-600 text-white shadow-sm" : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100"}`}
                >
                  Publish Now
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-brand focus:bg-white font-medium"
              >
                <option value="">Uncategorized</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">Article Tags</label>
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
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 shadow-xs">
            <h4 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3 flex items-center">
              <Settings className="w-4 h-4 mr-1.5 text-brand" /> SEO Meta Options
            </h4>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">SEO Title</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Google Search Title"
                className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-brand focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">SEO Description</label>
              <textarea
                rows={3}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Google Snippet Description"
                className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-brand focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">OG Share Image URL</label>
              <input
                type="text"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                placeholder="OpenGraph Link Image"
                className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-brand focus:bg-white"
              />
            </div>
          </div>

          {/* Master Save Trigger */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 px-4 bg-brand hover:bg-brand-hover text-white text-sm font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center space-x-1.5"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving updates...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Article Structure</span>
              </>
            )}
          </button>

        </div>
      </form>
    </div>
  );
}

// ==========================================
// 6. MASTER APP ENTRYPOINT (ROUTING)
// ==========================================
export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-neutral-50 flex flex-col justify-between">
        <div>
          <Navbar />
          <Routes>
            <Route path="/" element={<BlogHome />} />
            <Route path="/blog/:slug" element={<BlogPostView />} />
            <Route path="/login" element={<Login />} />
            
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
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {/* Global Footer */}
        <footer className="bg-white border-t border-neutral-150 py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-neutral-400 font-medium">
              © {new Date().getFullYear()} Betavan.ir. Developed by Betavan. All content and files are open.
            </span>
            <div className="flex space-x-5 text-xs font-mono">
              <a href="/sitemap.xml" target="_blank" className="text-neutral-400 hover:text-neutral-700 transition-colors">sitemap.xml</a>
              <a href="/robots.txt" target="_blank" className="text-neutral-400 hover:text-neutral-700 transition-colors">robots.txt</a>
            </div>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
}
