import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Check, 
  RefreshCw, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  HelpCircle
} from "lucide-react";
import { useLanguage } from "../i18n.js";
import { useCart } from "../CartContext.js";
import { Product } from "../types.js";

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { locale } = useLanguage();
  const { addToCart } = useCart();

  // Data State
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        
        const res = await fetch(`/api/products/${slug}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error(locale === "fa" ? "محصول مورد نظر یافت نشد" : "Product not found");
          }
          throw new Error("Failed to load product details");
        }

        const data = await res.json();
        setProduct(data);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug, locale]);

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 3000);
  };

  const formatToman = (num: number) => {
    return num.toLocaleString("fa-IR") + " تومان";
  };

  if (loading) {
    return (
      <div className="py-32 text-center text-neutral-500 max-w-7xl mx-auto px-4">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-neutral-400" />
        <span className="text-sm font-medium">{locale === "fa" ? "در حال دریافت اطلاعات محصول..." : "Loading product details..."}</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-24 max-w-7xl mx-auto px-4 text-center space-y-4">
        <ShoppingBag className="w-16 h-16 text-neutral-300 mx-auto" />
        <h2 className="text-xl font-bold text-neutral-900">{locale === "fa" ? "خطا در بارگذاری محصول" : "Failed to load product"}</h2>
        <p className="text-neutral-500 text-sm">{error || "Product could not be fetched."}</p>
        <Link 
          to="/shop" 
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-850 rounded-lg text-sm font-semibold transition cursor-pointer"
        >
          {locale === "fa" ? "بازگشت به فروشگاه" : "Return to store"}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Back button link */}
      <div className="text-start">
        <Link 
          to="/shop" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-900 transition uppercase tracking-wider"
        >
          {locale === "fa" ? (
            <>
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت به فروشگاه توان</span>
            </>
          ) : (
            <>
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Storefront</span>
            </>
          )}
        </Link>
      </div>

      {/* Main detail block */}
      <div className="bg-white border border-neutral-150 rounded-2xl overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8">
        
        {/* Left Side: Image display */}
        <div className="relative aspect-video sm:aspect-square md:aspect-auto rounded-xl overflow-hidden border border-neutral-150 bg-neutral-50 flex items-center justify-center">
          {product.coverImage ? (
            <img 
              src={product.coverImage} 
              alt={product.title} 
              className="w-full h-full object-cover max-h-[500px]"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="text-neutral-300 p-12 text-center space-y-2">
              <ShoppingBag className="w-16 h-16 mx-auto opacity-60" />
              <span className="text-xs text-neutral-400 block">{locale === "fa" ? "بدون تصویر شاخص" : "No image available"}</span>
            </div>
          )}
        </div>

        {/* Right Side: Product Details & Purchase Form */}
        <div className="flex flex-col justify-between space-y-6 text-start py-2">
          
          <div className="space-y-4">
            {/* Category tag */}
            {product.category && (
              <span className="inline-flex items-center px-2.5 py-1 rounded bg-neutral-100 text-neutral-800 text-xs font-semibold uppercase tracking-wider">
                {product.category.name}
              </span>
            )}

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-display leading-tight">
              {product.title}
            </h1>

            {/* Price */}
            <div className="py-2.5 border-y border-neutral-100 flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                {locale === "fa" ? "مبلغ قابل پرداخت" : "Unit Price"}
              </span>
              <span className="font-mono text-xl sm:text-2xl font-black text-neutral-950">
                {locale === "fa" ? formatToman(product.price) : `${product.price.toLocaleString()} Toman`}
              </span>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                {locale === "fa" ? "توضیحات و جزئیات فنی" : "Technical Details"}
              </h3>
              <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-wrap bg-neutral-50 p-4 rounded-xl border border-neutral-100 font-sans">
                {product.description || (locale === "fa" ? "هیچ توضیحی برای این محصول ثبت نشده است." : "No description has been published for this product.")}
              </p>
            </div>
          </div>

          {/* Action section */}
          <div className="space-y-4 pt-4 border-t border-neutral-100">
            
            {/* Success message popup inside component */}
            {addedMessage && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-3.5 rounded-lg text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {locale === "fa" 
                    ? `تعداد ${quantity} عدد به سبد خرید شما اضافه شد!` 
                    : `Added ${quantity} units to your shopping cart!`}
                </span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Quantity Counter */}
              <div className="flex items-center justify-between border border-neutral-200 rounded-xl px-3 py-2 bg-neutral-50 sm:w-32">
                <button
                  onClick={handleDecrement}
                  className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 cursor-pointer transition"
                  title={locale === "fa" ? "کاهش تعداد" : "Decrease quantity"}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-mono font-bold text-neutral-900 text-sm px-2">
                  {locale === "fa" ? quantity.toLocaleString("fa-IR") : quantity}
                </span>
                <button
                  onClick={handleIncrement}
                  className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 cursor-pointer transition"
                  title={locale === "fa" ? "افزایش تعداد" : "Increase quantity"}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart button */}
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3 bg-neutral-950 hover:bg-neutral-850 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <ShoppingBag className="w-4.5 h-4.5" />
                <span>{locale === "fa" ? "افزودن به سبد خرید" : "Add to Shopping Cart"}</span>
              </button>
            </div>

            {/* Guarantee Badge */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{locale === "fa" ? "تضمین اصالت فایل" : "Authentic Asset"}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>{locale === "fa" ? "تحویل آنی لینک" : "Instant Delivery"}</span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
export default ProductDetail;
