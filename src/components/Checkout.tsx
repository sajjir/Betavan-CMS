import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ShoppingBag, 
  ArrowLeft, 
  Check, 
  CreditCard, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  ChevronRight,
  ShieldAlert,
  Loader,
  ArrowRight,
  HelpCircle,
  Play
} from "lucide-react";
import { useLanguage } from "../i18n.js";
import { useCart } from "../CartContext.js";

export function Checkout() {
  const { locale } = useLanguage();
  const { cartItems, cartTotal, cartCount, clearCart } = useCart();
  const navigate = useNavigate();

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [simulationOrder, setSimulationOrder] = useState<any | null>(null);

  const formatToman = (num: number) => {
    return num.toLocaleString("fa-IR") + " تومان";
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setError(locale === "fa" ? "سبد خرید شما خالی است" : "Your cart is empty");
      return;
    }
    if (!customerName || !customerEmail || !customerPhone) {
      setError(locale === "fa" ? "لطفاً اطلاعات ضروری ستاره‌دار را تکمیل کنید" : "Please fill all required fields");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const itemsPayload = cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress: shippingAddress || null,
          items: itemsPayload
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit order");
      }

      const result = await res.json();
      
      // Clear the client-side cart upon placing order
      clearCart();

      if (result.paymentUrl) {
        // Redirect to real ZarinPal gateway
        window.location.href = result.paymentUrl;
      } else {
        // Sandbox fallback: No paymentUrl returned because Merchant ID is not set or in test mode.
        // We will store the order data so user can simulate payment.
        setSimulationOrder(result);
      }
    } catch (err: any) {
      setError(err.message || "Failed to process transaction");
    } finally {
      setSubmitting(false);
    }
  };

  // Simulate gateway redirection
  const handleSimulateGatewaySuccess = () => {
    if (!simulationOrder) return;
    // ZarinPal redirect callback is /api/orders/verify?Authority=xxx&Status=OK
    // To simulate, we navigate the browser to our verify API route, which does the server-to-server check, 
    // or since this is a client, we redirect directly to the verified order outcome screen.
    // Let's redirect to `/api/orders/verify?Authority=${simulationOrder.authority}&Status=OK`
    // This runs the server-side verification and redirects to `/order-result/:orderId`
    window.location.href = `/api/orders/verify?Authority=${simulationOrder.authority}&Status=OK`;
  };

  const handleSimulateGatewayCancel = () => {
    if (!simulationOrder) return;
    window.location.href = `/api/orders/verify?Authority=${simulationOrder.authority}&Status=NOK`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Back to store */}
      <div className="text-start">
        <Link 
          to="/shop" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-900 transition uppercase tracking-wider"
        >
          {locale === "fa" ? (
            <>
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت به فروشگاه</span>
            </>
          ) : (
            <>
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Storefront</span>
            </>
          )}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Checkout form (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-neutral-150 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-neutral-100 pb-4 text-start">
            <h1 className="text-xl font-extrabold text-neutral-900 font-display">
              {locale === "fa" ? "مشخصات و اطلاعات ارسال" : "Checkout Information"}
            </h1>
            <p className="text-neutral-500 text-xs mt-1">
              {locale === "fa" 
                ? "لطفاً اطلاعات هویتی و تماسی خود را جهت ثبت نهایی سفارش و ارسال فاکتور وارد کنید." 
                : "Enter your contact and shipping details to authorize secure order processing."}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-800 p-4 rounded-xl text-sm text-start">
              <span>{error}</span>
            </div>
          )}

          {/* SIMULATION MODAL/DRAWER (If paymentUrl is missing) */}
          {simulationOrder && (
            <div className="bg-neutral-900 text-white border border-neutral-800 rounded-xl p-6 text-start space-y-4 shadow-lg animate-fade-in">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
                <h3 className="font-bold text-base font-display">
                  {locale === "fa" ? "شبیه‌ساز درگاه پرداخت زرین‌پال" : "ZarinPal Merchant Sandbox Simulator"}
                </h3>
              </div>
              <p className="text-neutral-400 text-xs leading-relaxed">
                {locale === "fa" 
                  ? "سفارش شما با موفقیت در پایگاه داده ثبت شد. به دلیل عدم وجود کلید تراکنش واقعی در فایل .env، می‌توانید فرآیند پرداخت زرین‌پال را در محیط امن تست شبیه‌سازی کنید."
                  : "Your order has been recorded successfully! Since no live ZARINPAL_MERCHANT_ID was placed in your secret keys, you can simulate a successful or failed response from the ZarinPal Gateway below."}
              </p>
              
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={handleSimulateGatewaySuccess}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{locale === "fa" ? "تأیید پرداخت موفق (OK)" : "Simulate Successful Payment"}</span>
                </button>
                <button
                  onClick={handleSimulateGatewayCancel}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{locale === "fa" ? "لغو پرداخت تراکنش (NOK)" : "Simulate Cancelled/Failed"}</span>
                </button>
              </div>
            </div>
          )}

          {!simulationOrder && (
            <form onSubmit={handleSubmitOrder} className="space-y-5">
              
              {/* Name */}
              <div className="space-y-1.5 text-start">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                  <span>{locale === "fa" ? "نام و نام خانوادگی خریدار *" : "Customer Name *"}</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={locale === "fa" ? "مانند: علی رضایی" : "e.g. John Doe"}
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-hidden focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                  />
                  <User className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div className="space-y-1.5 text-start">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    {locale === "fa" ? "نشانی ایمیل (دریافت فایل) *" : "Email Address *"}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-hidden focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 font-mono"
                    />
                    <Mail className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1.5 text-start">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    {locale === "fa" ? "شماره همراه (پیامک تراکنش) *" : "Mobile Phone *"}
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="09123456789"
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-hidden focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 font-mono"
                    />
                    <Phone className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              {/* Address (optional) */}
              <div className="space-y-1.5 text-start">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  {locale === "fa" ? "نشانی کامل پستی (اختیاری)" : "Shipping Address (Optional)"}
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder={locale === "fa" ? "استان، شهر، آدرس دقیق کوچه و پلاک..." : "Street details, postal code, city..."}
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-hidden focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                  />
                  <MapPin className="w-4 h-4 text-neutral-400 absolute right-3.5 top-4" />
                </div>
              </div>

              {/* Security Warning */}
              <div className="bg-neutral-50 rounded-xl p-4 flex gap-3 text-start">
                <ShieldAlert className="w-5 h-5 text-neutral-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-neutral-800">
                    {locale === "fa" ? "امنیت درگاه پرداخت بانکی" : "Secure Payment Authorization"}
                  </h4>
                  <p className="text-neutral-500 text-[11px] leading-relaxed">
                    {locale === "fa" 
                      ? "کلیه قیمت‌های سبد خرید شما در سمت سرور مجدداً اعتبارسنجی می‌شوند. به محض کلیک بر روی دکمه زیر، به شبکه پرداخت شتاب زرین‌پال متصل خواهید شد."
                      : "All order totals are verified securely server-side. Click 'Proceed to Pay' to open the official, encrypted ZarinPal bank gateway."}
                  </p>
                </div>
              </div>

              {/* Pay Button */}
              <button
                type="submit"
                disabled={submitting || cartItems.length === 0}
                className="w-full py-3.5 bg-neutral-950 hover:bg-neutral-850 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>{locale === "fa" ? "در حال اتصال به بانک..." : "Redirecting to bank gateway..."}</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4.5 h-4.5" />
                    <span>{locale === "fa" ? "اتصال به درگاه بانکی زرین‌پال" : "Proceed to Secure Payment"}</span>
                  </>
                )}
              </button>

            </form>
          )}

        </div>

        {/* Right column: Cart Summary list (5 cols) */}
        <div className="lg:col-span-5 bg-neutral-50 border border-neutral-150 rounded-2xl p-6 space-y-5">
          <div className="border-b border-neutral-200 pb-3 text-start">
            <h2 className="font-bold text-neutral-900 text-sm font-display">
              {locale === "fa" ? "خلاصه فاکتور خرید" : "Order Summary"}
            </h2>
          </div>

          {/* Cart item listing */}
          {cartItems.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 space-y-2">
              <ShoppingBag className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-xs">{locale === "fa" ? "هیچ محصولی در سبد خرید نیست" : "No items selected."}</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-200 overflow-y-auto max-h-[300px]">
              {cartItems.map((item) => (
                <div key={item.product.id} className="py-3 flex gap-3 justify-between text-start text-sm">
                  <div className="flex-1 space-y-0.5">
                    <span className="font-bold text-neutral-900 block">{item.product.title}</span>
                    <span className="text-neutral-400 text-xs block">
                      {item.quantity} × {locale === "fa" ? formatToman(item.product.price) : `${item.product.price} T`}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-neutral-950">
                    {locale === "fa" ? formatToman(item.product.price * item.quantity) : `${(item.product.price * item.quantity).toLocaleString()} T`}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Subtotals */}
          <div className="border-t border-neutral-200 pt-4 text-start space-y-2.5 text-sm text-neutral-600">
            <div className="flex justify-between">
              <span>{locale === "fa" ? "تعداد اقلام:" : "Total Items:"}</span>
              <span className="font-mono font-semibold text-neutral-900">{cartCount}</span>
            </div>
            <div className="flex justify-between">
              <span>{locale === "fa" ? "حمل و تحویل فایل:" : "Delivery:"}</span>
              <span className="text-emerald-600 font-bold">{locale === "fa" ? "آنی و الکترونیکی (رایگان)" : "Instant / Free"}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-neutral-200 font-bold text-base text-neutral-950">
              <span>{locale === "fa" ? "مبلغ نهایی فاکتور:" : "Grand Total:"}</span>
              <span className="font-mono text-lg">
                {locale === "fa" ? formatToman(cartTotal) : `${cartTotal.toLocaleString()} T`}
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
export default Checkout;
