import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ShoppingBag, 
  Search, 
  Tag, 
  ArrowLeft, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Compass, 
  Sparkles,
  RefreshCw,
  ChevronRight,
  ArrowRight,
  X
} from "lucide-react";
import { useLanguage } from "../i18n.js";
import { useCart } from "../CartContext.js";
import { Product, Category } from "../types.js";

export function Storefront() {
  const { t, locale } = useLanguage();
  const { cartItems, addToCart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  
  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Sidebar Cart State (Toggle show mini-cart)
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load Products and Categories
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/categories")
      ]);

      if (!prodRes.ok || !catRes.ok) {
        throw new Error("Failed to load storefront assets");
      }

      const prodData = await prodRes.json();
      const catData = await catRes.json();

      setProducts(prodData || []);
      setCategories(catData || []);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === "all" || p.categoryId === selectedCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const formatToman = (num: number) => {
    return num.toLocaleString("fa-IR") + " تومان";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Hero Banner Section */}
      <div className="relative overflow-hidden bg-neutral-900 text-white rounded-2xl p-8 sm:p-12 shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(40,40,40,0.5),transparent)] pointer-events-none"></div>
        <div className="relative max-w-2xl space-y-4 text-start">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800 text-neutral-300 text-xs font-semibold uppercase tracking-wider font-mono">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            {locale === "fa" ? "فروشگاه کدهای آماده" : "Ready-made Code Assets"}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display text-white">
            {locale === "fa" ? "افزونه‌ها و کدهای اورجینال توان" : "Premium Code Snippets & Custom Plugins"}
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed sm:text-base">
            {locale === "fa" 
              ? "پکیج‌های پیشرفته اتوماسیون، کدهای آماده وب‌سایت و ابزارهای بهینه‌سازی را مستقیماً تهیه کنید. تمامی فایل‌ها با لایسنس آزاد و پشتیبانی فنی عرضه می‌شوند."
              : "Acquire professional web automation packages, WordPress plugins, and high-fidelity code components. Free licenses and clean configurations built by experts."}
          </p>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6 text-start">
          
          {/* Search Box */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
              {locale === "fa" ? "جستجوی محصولات" : "Search store"}
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={locale === "fa" ? "عنوان محصول..." : "Search product title..."}
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-neutral-200 text-sm bg-white focus:outline-hidden focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Categories Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
              {locale === "fa" ? "دسته‌بندی‌های محصول" : "Product Categories"}
            </label>
            <div className="space-y-1.5 flex flex-col">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`w-full text-start px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-between cursor-pointer ${
                  selectedCategory === "all" 
                    ? "bg-neutral-900 text-white" 
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                }`}
              >
                <span>{locale === "fa" ? "همه دسته‌بندی‌ها" : "All Categories"}</span>
                <span className="text-xs opacity-60 font-mono">({products.length})</span>
              </button>
              {categories.map((cat) => {
                const count = products.filter(p => p.categoryId === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-start px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-between cursor-pointer ${
                      selectedCategory === cat.id 
                        ? "bg-neutral-900 text-white" 
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-xs opacity-60 font-mono">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mini Cart Panel (Visible on large screens if item count > 0) */}
          {cartCount > 0 && (
            <div className="hidden lg:block bg-neutral-50 border border-neutral-150 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                <div className="flex items-center gap-1.5 font-bold text-neutral-900 text-sm">
                  <ShoppingCart className="w-4.5 h-4.5" />
                  <span>{locale === "fa" ? "سبد خرید شما" : "Shopping Cart"}</span>
                </div>
                <span className="font-mono text-xs bg-neutral-900 text-white px-2 py-0.5 rounded-full">{cartCount}</span>
              </div>

              <div className="space-y-3 max-h-[220px] overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex gap-2 justify-between text-xs py-1">
                    <div className="flex-1">
                      <span className="font-semibold text-neutral-900 line-clamp-1">{item.product.title}</span>
                      <span className="text-neutral-400 block font-mono mt-0.5">
                        {item.quantity} × {locale === "fa" ? formatToman(item.product.price) : `${item.product.price} T`}
                      </span>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-neutral-400 hover:text-red-500 cursor-pointer self-start p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-neutral-200 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-neutral-900">
                  <span>{locale === "fa" ? "جمع کل سبد:" : "Subtotal:"}</span>
                  <span className="font-mono text-sm">
                    {locale === "fa" ? formatToman(cartTotal) : `${cartTotal.toLocaleString()} T`}
                  </span>
                </div>
                <Link
                  to="/checkout"
                  className="w-full py-2 bg-neutral-950 hover:bg-neutral-850 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{locale === "fa" ? "تکمیل و پرداخت سفارش" : "Proceed to Checkout"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Header & Cart trigger */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900 font-display">
              {locale === "fa" ? "فهرست محصولات کارگاه" : "Available Technical Packages"}
            </h2>
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="lg:hidden relative p-2.5 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5 text-neutral-800" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-neutral-950 text-white text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Loading States */}
          {loading ? (
            <div className="py-24 text-center text-neutral-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-neutral-400" />
              <span>{locale === "fa" ? "در حال دریافت لیست محصولات..." : "Loading premium products catalog..."}</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="border border-dashed border-neutral-200 rounded-2xl p-16 text-center text-neutral-500">
              <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="font-bold text-lg text-neutral-900">{locale === "fa" ? "محصولی یافت نشد" : "No products matches"}</h3>
              <p className="text-neutral-400 text-sm mt-1">
                {locale === "fa" ? "هیچ محصولی با شرایط جستجوی شما مطابقت ندارد." : "Try adjusting your search query or category filters."}
              </p>
            </div>
          ) : (
            /* Products Bento/Card Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((p) => (
                <div 
                  key={p.id} 
                  className="bg-white border border-neutral-150 rounded-xl overflow-hidden hover:shadow-md transition flex flex-col justify-between group h-full"
                >
                  <Link to={`/shop/${p.slug}`} className="block relative aspect-video overflow-hidden bg-neutral-50 border-b border-neutral-100">
                    {p.coverImage ? (
                      <img
                        src={p.coverImage}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-300">
                        <ShoppingBag className="w-10 h-10" />
                      </div>
                    )}
                    {p.category && (
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-neutral-900 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-xs">
                        {p.category.name}
                      </span>
                    )}
                  </Link>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-start">
                    <div className="space-y-1.5">
                      <Link to={`/shop/${p.slug}`} className="block">
                        <h3 className="font-bold text-neutral-900 hover:text-neutral-700 transition leading-snug text-base">
                          {p.title}
                        </h3>
                      </Link>
                      <p className="text-neutral-500 text-xs line-clamp-2 leading-relaxed">
                        {p.description || (locale === "fa" ? "بدون توضیحات اضافی." : "No additional descriptions provided.")}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-neutral-950 text-sm">
                        {locale === "fa" ? formatToman(p.price) : `${p.price.toLocaleString()} T`}
                      </span>
                      
                      <button
                        onClick={() => addToCart(p, 1)}
                        className="px-3.5 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{locale === "fa" ? "خرید" : "Add"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* Mini Cart Sidebar Overlay for Mobile */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs lg:hidden">
          <div className="w-full max-w-sm bg-white h-full p-6 flex flex-col justify-between shadow-xl">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-150 pb-4">
                <div className="flex items-center gap-2 font-bold text-neutral-900">
                  <ShoppingCart className="w-5 h-5" />
                  <span>{locale === "fa" ? "سبد خرید شما" : "Shopping Cart"}</span>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 hover:bg-neutral-100 rounded-lg cursor-pointer text-neutral-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center py-16 text-neutral-400 space-y-2">
                  <ShoppingCart className="w-10 h-10 mx-auto opacity-40" />
                  <p className="text-sm">{locale === "fa" ? "سبد خرید خالی است" : "Your cart is empty"}</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="flex gap-3 justify-between items-center py-2.5 border-b border-neutral-100 last:border-0 text-start">
                      <div className="flex-1 space-y-1">
                        <span className="font-semibold text-neutral-900 text-sm line-clamp-1">{item.product.title}</span>
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs text-neutral-400 font-mono">
                            {locale === "fa" ? formatToman(item.product.price) : `${item.product.price} T`}
                          </span>
                          <div className="flex items-center border border-neutral-200 rounded">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="p-1 hover:bg-neutral-50 text-neutral-500 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 font-mono text-xs font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="p-1 hover:bg-neutral-50 text-neutral-500 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="border-t border-neutral-150 pt-5 space-y-4">
                <div className="flex justify-between items-center text-sm font-bold text-neutral-900 text-start">
                  <span>{locale === "fa" ? "جمع کل سبد خرید:" : "Subtotal:"}</span>
                  <span className="font-mono text-base">
                    {locale === "fa" ? formatToman(cartTotal) : `${cartTotal.toLocaleString()} T`}
                  </span>
                </div>
                <Link
                  to="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-3 bg-neutral-950 hover:bg-neutral-850 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{locale === "fa" ? "تکمیل خرید و پرداخت" : "Proceed to Checkout"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
export default Storefront;
