import React, { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { 
  CheckCircle, 
  XCircle, 
  Loader, 
  ShoppingBag, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  RefreshCw, 
  ArrowLeft, 
  Download, 
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import { useLanguage } from "../i18n.js";
import { Order } from "../types.js";

export function OrderResult() {
  const { orderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();
  const { locale } = useLanguage();

  // Query parameter status fallback (sometimes ZarinPal redirects back directly)
  const queryStatus = searchParams.get("Status"); // "OK" or "NOK"

  // Data State
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      setError("");
      
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) {
        throw new Error(locale === "fa" ? "سفارش مورد نظر یافت نشد" : "Order not found");
      }

      const data = await res.json();
      setOrder(data);
    } catch (err: any) {
      setError(err.message || "Failed to load order result");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId]);

  const formatToman = (num: number) => {
    return num.toLocaleString("fa-IR") + " تومان";
  };

  if (loading) {
    return (
      <div className="py-32 text-center text-neutral-500 max-w-7xl mx-auto px-4">
        <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-neutral-400" />
        <span className="text-sm font-medium">{locale === "fa" ? "در حال دریافت تاییدیه تراکنش بانک..." : "Verifying bank transaction with ZarinPal..."}</span>
      </div>
    );
  }

  // Determine if payment was successful based on the order status in the DB
  const isPaid = order && (order.status === "paid" || order.status === "shipped");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* 1. HEADER HERO OUTCOME CARD */}
      <div className="bg-white border border-neutral-150 rounded-2xl p-6 sm:p-10 text-center space-y-5 shadow-xs">
        
        {isPaid ? (
          <div className="space-y-4">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
            <div className="space-y-1.5">
              <h1 className="text-2xl font-extrabold text-neutral-900 font-display">
                {locale === "fa" ? "پرداخت با موفقیت تأیید شد!" : "Payment Completed Successfully!"}
              </h1>
              <p className="text-emerald-700 text-sm font-semibold">
                {locale === "fa" ? "تراکنش مالی شما معتبر بوده و فاکتور نهایی صادر شد." : "Your transaction has been authorized by ZarinPal."}
              </p>
            </div>
            {order?.zarinpalRefId && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-mono font-bold">
                <span>RefID:</span>
                <span>{order.zarinpalRefId}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            <div className="space-y-1.5">
              <h1 className="text-2xl font-extrabold text-neutral-900 font-display">
                {locale === "fa" ? "پرداخت ناموفق یا لغو شده" : "Payment Verification Failed"}
              </h1>
              <p className="text-red-700 text-sm font-semibold">
                {locale === "fa" ? "خطا در تایید تراکنش بانکی. مبلغی از حساب شما کسر نشده است." : "The bank rejected or cancelled this transaction."}
              </p>
            </div>
            <div className="text-xs text-neutral-500 max-w-md mx-auto">
              {locale === "fa" 
                ? "اگر مبلغی از حساب شما کسر شده است، حداکثر ظرف ۷۲ ساعت توسط بانک صادرکننده کارت بازگردانده خواهد شد." 
                : "If any funds were frozen by your bank, they will automatically clear within 24-72 hours."}
            </div>
          </div>
        )}

        {/* Navigation Action */}
        <div className="pt-4 border-t border-neutral-100 flex flex-wrap justify-center gap-3">
          <Link 
            to="/shop" 
            className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-850 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{locale === "fa" ? "بازگشت به فروشگاه" : "Return to Store"}</span>
          </Link>
          {!isPaid && (
            <Link 
              to="/checkout" 
              className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>{locale === "fa" ? "تلاش مجدد و تسویه حساب" : "Try Checkout Again"}</span>
            </Link>
          )}
        </div>

      </div>

      {/* 2. ORDER DETAILS INVOICE SUMMARY (Only if order exists) */}
      {order && (
        <div className="bg-white border border-neutral-150 rounded-2xl overflow-hidden shadow-xs text-start">
          
          <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-neutral-900 text-sm font-display">
                {locale === "fa" ? "جزئیات سفارش ثبت شده" : "Invoice summary"}
              </h3>
              <span className="text-xs font-mono text-neutral-400 block mt-0.5">#{order.id.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-500">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              <span>{new Date(order.createdAt).toLocaleString(locale === "fa" ? "fa-IR" : "en-US")}</span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            
            {/* Customer Details info */}
            <div className="space-y-3 bg-neutral-50 p-4 rounded-xl text-sm text-neutral-800">
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                {locale === "fa" ? "مشخصات خریدار" : "Customer Details"}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-neutral-400" />
                  <span className="font-medium">{order.customerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-neutral-400" />
                  <span className="font-mono text-xs">{order.customerPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-neutral-400" />
                  <span className="font-mono text-xs">{order.customerEmail}</span>
                </div>
              </div>
              {order.shippingAddress && (
                <div className="flex items-start gap-2 pt-2.5 border-t border-neutral-100 mt-2.5">
                  <MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                  <span className="text-neutral-600 text-xs leading-relaxed">{order.shippingAddress}</span>
                </div>
              )}
            </div>

            {/* Items Purchased List */}
            <div className="space-y-3 text-start">
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                {locale === "fa" ? "اقلام خریداری شده" : "Purchased Items"}
              </h4>
              <div className="divide-y divide-neutral-100">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-3 flex justify-between items-center text-sm">
                    <div>
                      <div className="font-bold text-neutral-900">{item.product?.title || "Product"}</div>
                      <div className="text-xs text-neutral-400 mt-0.5">
                        {item.quantity} × {locale === "fa" ? formatToman(item.price) : `${item.price.toLocaleString()} T`}
                      </div>
                    </div>
                    <span className="font-mono font-bold text-neutral-900">
                      {locale === "fa" ? formatToman(item.price * item.quantity) : `${(item.price * item.quantity).toLocaleString()} T`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment verification statistics */}
            <div className="pt-4 border-t border-neutral-150 space-y-3 text-sm">
              <div className="flex justify-between font-bold text-base text-neutral-950">
                <span>{locale === "fa" ? "مبلغ نهایی پرداخت شده:" : "Total Amount:"}</span>
                <span className="font-mono text-lg text-neutral-950">
                  {locale === "fa" ? formatToman(order.total) : `${order.total.toLocaleString()} Toman`}
                </span>
              </div>

              {isPaid && (
                <div className="bg-emerald-50 rounded-xl p-4 flex gap-3 text-start border border-emerald-100">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-emerald-800">
                      {locale === "fa" ? "فایل‌های آماده بارگیری هستند" : "Your files are ready to download"}
                    </h5>
                    <p className="text-emerald-700 text-[11px] leading-relaxed">
                      {locale === "fa" 
                        ? "خرید شما تایید شد. لینک مستقیم دانلود سورس کدها و جزئیات به ایمیل وارد شده ارسال گردید."
                        : "A transaction confirmation email containing download links and credentials has been dispatched."}
                    </p>
                    <button
                      onClick={() => alert(locale === "fa" ? "دریافت بسته‌ی کدهای خریداری شده..." : "Downloading technical assets zip package...")}
                      className="mt-2 inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded text-[10px] font-bold transition cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>{locale === "fa" ? "دانلود پکیج سورس کد" : "Download Code Package"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
export default OrderResult;
