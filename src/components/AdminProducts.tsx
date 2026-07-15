import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  ShoppingBag, 
  X, 
  Check, 
  RefreshCw, 
  Image as ImageIcon, 
  FileText,
  DollarSign,
  Cpu
} from "lucide-react";
import { useLanguage } from "../i18n.js";
import { Product, Category } from "../types.js";
import { MediaModal } from "./MediaModal.js";

export function AdminProducts() {
  const { t, locale } = useLanguage();
  
  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Edit / Create Form Modal State
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null); // null means creating
  
  // Form values
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCoverImage, setFormCoverImage] = useState("");
  const [formStatus, setFormStatus] = useState<"draft" | "published">("draft");
  const [formCategoryId, setFormCategoryId] = useState("");

  const [aiGenerating, setAiGenerating] = useState(false);

  const handleAiGenerateDescription = async () => {
    if (!formTitle.trim()) return;
    try {
      setAiGenerating(true);
      setError("");
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/ai/product-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title: formTitle })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate description");
      }

      setFormDescription(data.description || "");
    } catch (err: any) {
      setError(err.message || "Failed to generate description");
    } finally {
      setAiGenerating(false);
    }
  };

  // Media picker modal state
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  // Load Data
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem("accessToken");
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/products?status=all", {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch("/api/categories")
      ]);

      if (!prodRes.ok) {
        throw new Error("Failed to load products");
      }
      if (!catRes.ok) {
        throw new Error("Failed to load categories");
      }

      const prodData = await prodRes.json();
      const catData = await catRes.json();

      setProducts(prodData || []);
      setCategories(catData || []);
    } catch (err: any) {
      setError(err.message || "An error occurred while loading data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Form toggle helpers
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormTitle("");
    setFormSlug("");
    setFormPrice("");
    setFormDescription("");
    setFormCoverImage("");
    setFormStatus("draft");
    setFormCategoryId("");
    setIsOpenForm(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormTitle(p.title);
    setFormSlug(p.slug);
    setFormPrice(String(p.price));
    setFormDescription(p.description || "");
    setFormCoverImage(p.coverImage || "");
    setFormStatus(p.status);
    setFormCategoryId(p.categoryId || "");
    setIsOpenForm(true);
  };

  // Slug auto-generation helper
  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    if (!editingProduct) {
      // Auto-generate draft slug
      const generated = val
        .toString()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\u0600-\u06FF-]+/g, "")
        .replace(/--+/g, "-");
      setFormSlug(generated);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formPrice) {
      setError(locale === "fa" ? "عنوان و قیمت الزامی هستند" : "Title and Price are required");
      return;
    }

    try {
      setError("");
      setSuccessMsg("");
      const token = localStorage.getItem("accessToken");

      const payload = {
        title: formTitle,
        slug: formSlug || undefined,
        price: Number(formPrice),
        description: formDescription || null,
        coverImage: formCoverImage || null,
        status: formStatus,
        categoryId: formCategoryId || null
      };

      let res;
      if (editingProduct) {
        // Edit Product
        res = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        // Create Product
        res = await fetch("/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save product");
      }

      setSuccessMsg(
        editingProduct 
          ? (locale === "fa" ? "محصول با موفقیت ویرایش شد" : "Product updated successfully")
          : (locale === "fa" ? "محصول با موفقیت ایجاد شد" : "Product created successfully")
      );
      setIsOpenForm(false);
      loadData();
    } catch (err: any) {
      setError(err.message || "Failed to save product");
    }
  };

  // Delete product
  const handleDelete = async (id: string) => {
    const confirmMsg = locale === "fa" 
      ? "آیا از حذف این محصول اطمینان دارید؟" 
      : "Are you sure you want to delete this product?";
    
    if (!window.confirm(confirmMsg)) return;

    try {
      setError("");
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete product");
      }

      setSuccessMsg(locale === "fa" ? "محصول با موفقیت حذف شد" : "Product deleted successfully");
      loadData();
    } catch (err: any) {
      setError(err.message || "Failed to delete product");
    }
  };

  // Format Persian currency
  const formatToman = (num: number) => {
    return num.toLocaleString("fa-IR") + " تومان";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 font-display">
            {locale === "fa" ? "مدیریت فروشگاه و محصولات" : "Storefront & Product Management"}
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            {locale === "fa" 
              ? "محصولات فروشگاه خود را ایجاد، ویرایش و دسته‌بندی کنید." 
              : "Create, edit, and categorize your storefront products."}
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-neutral-950 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-neutral-800 transition cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>{locale === "fa" ? "افزودن محصول جدید" : "Create New Product"}</span>
        </button>
      </div>

      {/* Success / Error Messages */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-lg text-sm flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-800 p-4 rounded-lg text-sm">
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="py-24 text-center text-neutral-500">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-neutral-400" />
          <span>{t("dashboard_loading") || "Loading database products..."}</span>
        </div>
      ) : products.length === 0 ? (
        <div className="border border-dashed border-neutral-200 rounded-xl p-16 text-center text-neutral-500">
          <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="font-bold text-lg text-neutral-900">
            {locale === "fa" ? "هیچ محصولی یافت نشد" : "No products found"}
          </h3>
          <p className="text-neutral-400 text-sm mt-1">
            {locale === "fa" 
              ? "اولین محصول فروشگاه خود را اضافه کنید." 
              : "Start by creating your first storefront product!"}
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 inline-flex items-center gap-2 bg-neutral-100 text-neutral-900 hover:bg-neutral-200 px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{locale === "fa" ? "ایجاد محصول" : "Create Product"}</span>
          </button>
        </div>
      ) : (
        /* Products Table */
        <div className="bg-white border border-neutral-150 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse text-sm">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-150 text-neutral-500 font-medium">
                  <th className="px-5 py-4 text-start font-semibold">{locale === "fa" ? "تصویر و عنوان" : "Image & Title"}</th>
                  <th className="px-5 py-4 text-start font-semibold">{locale === "fa" ? "دسته‌بندی" : "Category"}</th>
                  <th className="px-5 py-4 text-start font-semibold">{locale === "fa" ? "قیمت" : "Price"}</th>
                  <th className="px-5 py-4 text-start font-semibold">{locale === "fa" ? "وضعیت" : "Status"}</th>
                  <th className="px-5 py-4 text-start font-semibold">{locale === "fa" ? "تاریخ" : "Date"}</th>
                  <th className="px-5 py-4 text-end font-semibold">{locale === "fa" ? "عملیات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50/50 transition">
                    {/* Title & Image */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {p.coverImage ? (
                          <img
                            src={p.coverImage}
                            alt={p.title}
                            className="w-10 h-10 object-cover rounded-lg border border-neutral-100 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-neutral-100 flex items-center justify-center rounded-lg text-neutral-400 border border-neutral-100 shrink-0">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-neutral-900">{p.title}</div>
                          <div className="text-xs text-neutral-400 font-mono mt-0.5">{p.slug}</div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-4">
                      {p.category ? (
                        <span className="inline-flex items-center px-2 py-1 rounded bg-neutral-100 text-neutral-800 text-xs font-medium">
                          {p.category.name}
                        </span>
                      ) : (
                        <span className="text-neutral-400 text-xs">—</span>
                      )}
                    </td>

                    {/* Price */}
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-neutral-900">
                        {locale === "fa" ? formatToman(p.price) : `${p.price.toLocaleString()} Toman`}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      {p.status === "published" ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          {locale === "fa" ? "منتشر شده" : "Published"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-neutral-100 text-neutral-600 text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400"></span>
                          {locale === "fa" ? "پیش‌نویس" : "Draft"}
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-xs font-mono text-neutral-500">
                      {new Date(p.createdAt).toLocaleDateString(locale === "fa" ? "fa-IR" : "en-US")}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-end">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          title={locale === "fa" ? "ویرایش محصول" : "Edit Product"}
                          className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition cursor-pointer"
                        >
                          <Edit className="w-4.5 h-4.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          title={locale === "fa" ? "حذف محصول" : "Delete Product"}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit / Create Form Modal */}
      {isOpenForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-neutral-100 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h2 className="text-lg font-bold text-neutral-900 font-display">
                {editingProduct 
                  ? (locale === "fa" ? `ویرایش محصول: ${editingProduct.title}` : `Edit Product: ${editingProduct.title}`)
                  : (locale === "fa" ? "ایجاد محصول جدید" : "Create New Product")}
              </h2>
              <button 
                onClick={() => setIsOpenForm(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1">
              {/* Title & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-start">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                    {locale === "fa" ? "عنوان محصول" : "Product Title"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder={locale === "fa" ? "مانند: افزونه هوشمند ورود با پیامک" : "e.g. Smart SMS Login Plugin"}
                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-hidden focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                  />
                </div>
                <div className="space-y-1.5 text-start">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                    {locale === "fa" ? "شناسه اسلاگ (URL)" : "Slug (URL)"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="smart-sms-login-plugin"
                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-hidden focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                  />
                </div>
              </div>

              {/* Price & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-start">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                    {locale === "fa" ? "قیمت (تومان)" : "Price (Toman)"}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="0"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="150000"
                      className="w-full pl-4 pr-12 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-hidden focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 font-mono"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-xs text-neutral-400 font-medium">
                      {locale === "fa" ? "تومان" : "Toman"}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-start">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                    {locale === "fa" ? "دسته‌بندی" : "Category"}
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-hidden focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                  >
                    <option value="">{locale === "fa" ? "بدون دسته‌بندی" : "Uncategorized"}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5 text-start">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                    {locale === "fa" ? "توضیحات محصول" : "Product Description"}
                  </label>
                  <button
                    type="button"
                    onClick={handleAiGenerateDescription}
                    disabled={aiGenerating || !formTitle.trim()}
                    className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 hover:border-indigo-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {aiGenerating ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Cpu className="w-3 h-3" />
                    )}
                    <span>{t("ai_generate_desc_btn")}</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder={locale === "fa" ? "توضیحات محصول را بنویسید..." : "Write details about this product..."}
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-hidden focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                />
              </div>

              {/* Cover Image URL / Picker */}
              <div className="space-y-1.5 text-start">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                  {locale === "fa" ? "تصویر محصول" : "Product Cover Image"}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formCoverImage}
                    onChange={(e) => setFormCoverImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-hidden focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setIsMediaModalOpen(true)}
                    className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>{locale === "fa" ? "انتخاب رسانه" : "Browse"}</span>
                  </button>
                </div>
                {formCoverImage && (
                  <div className="mt-2 relative inline-block">
                    <img 
                      src={formCoverImage} 
                      alt="Preview" 
                      className="h-20 w-20 object-cover rounded-lg border border-neutral-150"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => setFormCoverImage("")}
                      className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Status Toggle */}
              <div className="space-y-1.5 text-start">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                  {locale === "fa" ? "وضعیت انتشار" : "Publishing Status"}
                </label>
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={formStatus === "draft"}
                      onChange={() => setFormStatus("draft")}
                      className="accent-neutral-950 w-4 h-4"
                    />
                    <span>{locale === "fa" ? "پیش‌نویس" : "Draft"}</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={formStatus === "published"}
                      onChange={() => setFormStatus("published")}
                      className="accent-neutral-950 w-4 h-4"
                    />
                    <span>{locale === "fa" ? "انتشار عمومی" : "Published Now"}</span>
                  </label>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsOpenForm(false)}
                  className="px-4 py-2.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-sm font-bold transition cursor-pointer"
                >
                  {locale === "fa" ? "انصراف" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-white text-sm font-bold transition cursor-pointer"
                >
                  {editingProduct 
                    ? (locale === "fa" ? "ذخیره تغییرات" : "Save Changes") 
                    : (locale === "fa" ? "ایجاد محصول" : "Create Product")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Modal */}
      {isMediaModalOpen && (
        <MediaModal
          onClose={() => setIsMediaModalOpen(false)}
          onSelect={(url) => {
            setFormCoverImage(url);
            setIsMediaModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
export default AdminProducts;
