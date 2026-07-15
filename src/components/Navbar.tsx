import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, User, Cpu, Compass, Search } from "lucide-react";
import { useLanguage } from "../i18n.js";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { locale, setLocale, t } = useLanguage();
  const [searchQuery, setSearchQuery] = React.useState("");
  
  const token = localStorage.getItem("accessToken");
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isAdminOrLogin = location.pathname.startsWith("/admin") || location.pathname === "/login";

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-neutral-200 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center text-white font-bold text-base font-display">
              B
            </div>
            <span className="text-lg font-bold text-neutral-900 font-display tracking-tight hover:text-brand transition-colors hidden xs:inline">
              Betavan <span className="text-brand font-mono text-sm font-medium">CMS</span>
            </span>
          </Link>

          {/* Search Input Form */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-[140px] xs:max-w-[180px] sm:max-w-xs relative mx-2 sm:mx-4">
            <input
              type="text"
              placeholder={t("search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white text-xs px-3 py-1.5 rounded-lg border border-neutral-200 focus:border-neutral-900 focus:outline-none transition-all font-sans"
              dir={locale === "fa" ? "rtl" : "ltr"}
              style={{
                paddingLeft: locale === "fa" ? "12px" : "28px",
                paddingRight: locale === "fa" ? "28px" : "12px",
              }}
            />
            <Search className={`w-3.5 h-3.5 text-neutral-400 absolute top-1/2 -translate-y-1/2 ${locale === "fa" ? "right-2.5" : "left-2.5"}`} />
          </form>

          {/* Navigation Links */}
          <nav className="hidden md:flex gap-6 items-center">
            <Link to="/" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors flex items-center">
              <Compass className="w-4 h-4 me-1.5 text-neutral-400" /> {t("nav_back_to_blog")}
            </Link>
            <Link to="/shop" className="text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors">
              {locale === "fa" ? "فروشگاه توان" : "Storefront"}
            </Link>
            {token && user && (
              <>
                <span className="text-neutral-300">|</span>
                <Link to="/admin" className="text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors">
                  {t("nav_admin_posts")}
                </Link>
                <Link to="/admin/products" className="text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors">
                  {locale === "fa" ? "محصولات" : "Products"}
                </Link>
                <Link to="/admin/orders" className="text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors">
                  {locale === "fa" ? "سفارش‌ها" : "Orders"}
                </Link>
                <Link to="/admin/taxonomies" className="text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors">
                  {locale === "fa" ? "طبقه‌بندی‌ها" : "Taxonomies"}
                </Link>
                <Link to="/admin/pages" className="text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors">
                  {t("nav_admin_pages")}
                </Link>
                <Link to="/admin/settings" className="text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors">
                  {t("nav_admin_settings")}
                </Link>
                <Link to="/admin/webhooks" className="text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors">
                  {t("nav_admin_webhooks")}
                </Link>
              </>
            )}
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            {/* Always visible so visitors can switch language */}
            <div className="flex items-center bg-neutral-100 rounded-lg p-0.5 border border-neutral-200">
              <button
                onClick={() => setLocale("en")}
                className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${locale === "en" ? "bg-neutral-900 text-white shadow-xs" : "text-neutral-500 hover:text-neutral-800"}`}
              >
                EN
              </button>
              <button
                onClick={() => setLocale("fa")}
                className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all font-sans ${locale === "fa" ? "bg-neutral-900 text-white shadow-xs" : "text-neutral-500 hover:text-neutral-800"}`}
              >
                فا
              </button>
            </div>

            {token && user ? (
              <div className="flex items-center gap-3">
                <Link 
                  to="/admin" 
                  className="inline-flex items-center text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors"
                >
                  <User className="w-3.5 h-3.5 me-1.5 text-neutral-500" /> {t("nav_console")}
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title={t("nav_logout")}
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-neutral-900 text-white font-semibold text-xs hover:bg-brand transition-colors shadow-sm cursor-pointer"
              >
                {t("nav_login")}
              </Link>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}

