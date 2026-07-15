import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Check, 
  X, 
  RefreshCw, 
  Truck, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  ChevronDown, 
  Calendar,
  CreditCard
} from "lucide-react";
import { useLanguage } from "../i18n.js";
import { Order } from "../types.js";

export function AdminOrders() {
  const { t, locale } = useLanguage();
  
  // Data State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  // Selected Order for detail modal
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Load Orders
  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/admin/orders", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error("Failed to load orders");
      }

      const data = await res.json();
      setOrders(data || []);
    } catch (err: any) {
      setError(err.message || "An error occurred while loading orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Update order status manually
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      setError("");
      setSuccessMsg("");
      const token = localStorage.getItem("accessToken");
      
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update status");
      }

      setSuccessMsg(locale === "fa" ? "وضعیت سفارش با موفقیت به روز رسانی شد" : "Order status updated successfully");
      
      // Refresh current list and selected order
      loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err: any) {
      setError(err.message || "Failed to update order status");
    }
  };

  // View Details Modal helper
  const handleViewDetails = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedOrder(data);
      }
    } catch (err) {
      console.error("Failed to load order details", err);
    }
  };

  // Format Persian Currency
  const formatToman = (num: number) => {
    return num.toLocaleString("fa-IR") + " تومان";
  };

  // Filtered Orders
  const filteredOrders = orders.filter(o => {
    if (activeTab === "all") return true;
    return o.status === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 font-display">
            {locale === "fa" ? "مدیریت سفارش‌ها" : "Order Management"}
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            {locale === "fa" 
              ? "سفارش‌های ثبت شده، پرداخت‌های ZarinPal و وضعیت ارسال محصولات را پیگیری کنید." 
              : "Track customer orders, ZarinPal payments, and product delivery status."}
          </p>
        </div>
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

      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-200 pb-px">
        {[
          { key: "all", label_fa: "همه", label_en: "All" },
          { key: "pending", label_fa: "در انتظار", label_en: "Pending" },
          { key: "paid", label_fa: "پرداخت شده", label_en: "Paid" },
          { key: "shipped", label_fa: "ارسال شده", label_en: "Shipped" },
          { key: "failed", label_fa: "ناموفق", label_en: "Failed" }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 cursor-pointer transition ${
              activeTab === tab.key 
                ? "border-neutral-950 text-neutral-900" 
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            {locale === "fa" ? tab.label_fa : tab.label_en}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-24 text-center text-neutral-500">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-neutral-400" />
          <span>{locale === "fa" ? "در حال دریافت سفارش‌ها..." : "Loading orders list..."}</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="border border-dashed border-neutral-200 rounded-xl p-16 text-center text-neutral-500">
          <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="font-bold text-lg text-neutral-900 font-display">
            {locale === "fa" ? "هیچ سفارشی یافت نشد" : "No orders found"}
          </h3>
          <p className="text-neutral-400 text-sm mt-1">
            {locale === "fa" 
              ? "در حال حاضر هیچ سفارشی در این وضعیت وجود ندارد." 
              : "There are currently no orders under this status."}
          </p>
        </div>
      ) : (
        /* Orders Table */
        <div className="bg-white border border-neutral-150 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse text-sm">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-150 text-neutral-500 font-medium">
                  <th className="px-5 py-4 text-start font-semibold">{locale === "fa" ? "شناسه سفارش / مشتری" : "Order ID / Customer"}</th>
                  <th className="px-5 py-4 text-start font-semibold">{locale === "fa" ? "مبلغ کل" : "Total Price"}</th>
                  <th className="px-5 py-4 text-start font-semibold">{locale === "fa" ? "وضعیت پرداخت" : "Status"}</th>
                  <th className="px-5 py-4 text-start font-semibold">{locale === "fa" ? "کد مرجع زرین‌پال" : "ZarinPal Ref ID"}</th>
                  <th className="px-5 py-4 text-start font-semibold">{locale === "fa" ? "تاریخ ثبت" : "Date"}</th>
                  <th className="px-5 py-4 text-end font-semibold">{locale === "fa" ? "عملیات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-neutral-50/50 transition">
                    {/* Order ID & Customer */}
                    <td className="px-5 py-4 text-start">
                      <div>
                        <span className="font-mono font-bold text-neutral-900 block">#{o.id.substring(0, 8).toUpperCase()}</span>
                        <span className="text-neutral-500 text-xs block mt-0.5">{o.customerName}</span>
                      </div>
                    </td>

                    {/* Total */}
                    <td className="px-5 py-4 text-start">
                      <span className="font-mono font-bold text-neutral-900">
                        {locale === "fa" ? formatToman(o.total) : `${o.total.toLocaleString()} Toman`}
                      </span>
                    </td>

                    {/* Status Select/Badge */}
                    <td className="px-5 py-4 text-start">
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border-0 ring-1 cursor-pointer focus:outline-hidden ${
                          o.status === "paid" 
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-200" 
                            : o.status === "shipped" 
                            ? "bg-blue-50 text-blue-700 ring-blue-200" 
                            : o.status === "pending" 
                            ? "bg-amber-50 text-amber-700 ring-amber-200" 
                            : "bg-red-50 text-red-700 ring-red-200"
                        }`}
                      >
                        <option value="pending">{locale === "fa" ? "در انتظار" : "Pending"}</option>
                        <option value="paid">{locale === "fa" ? "پرداخت شده" : "Paid"}</option>
                        <option value="shipped">{locale === "fa" ? "ارسال شده" : "Shipped"}</option>
                        <option value="cancelled">{locale === "fa" ? "لغو شده" : "Cancelled"}</option>
                        <option value="failed">{locale === "fa" ? "ناموفق" : "Failed"}</option>
                      </select>
                    </td>

                    {/* ZarinPal RefId / Authority */}
                    <td className="px-5 py-4 text-start">
                      {o.zarinpalRefId ? (
                        <span className="font-mono text-xs font-semibold text-neutral-800 bg-neutral-100 px-2 py-1 rounded">
                          {o.zarinpalRefId}
                        </span>
                      ) : o.zarinpalAuthority ? (
                        <span className="font-mono text-xs text-neutral-400 block truncate max-w-[120px]" title={o.zarinpalAuthority}>
                          {o.zarinpalAuthority.substring(0, 12)}...
                        </span>
                      ) : (
                        <span className="text-neutral-400 text-xs">—</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-xs font-mono text-neutral-500 text-start">
                      {new Date(o.createdAt).toLocaleDateString(locale === "fa" ? "fa-IR" : "en-US")}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-end">
                      <button
                        onClick={() => handleViewDetails(o.id)}
                        className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 rounded text-xs font-bold transition cursor-pointer"
                      >
                        {locale === "fa" ? "مشاهده فاکتور" : "Invoice"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Invoice Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-neutral-100 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-neutral-50 border-b border-neutral-100">
              <div>
                <h3 className="text-base font-bold text-neutral-900 font-display">
                  {locale === "fa" ? "جزئیات فاکتور خرید" : "Order Invoice"}
                </h3>
                <span className="text-xs font-mono text-neutral-400 block mt-0.5">#{selectedOrder.id.toUpperCase()}</span>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Customer Details */}
              <div className="space-y-3 bg-neutral-50 p-4 rounded-xl text-start">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  {locale === "fa" ? "مشخصات خریدار" : "Customer Information"}
                </h4>
                <div className="space-y-2 text-sm text-neutral-800">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-neutral-400" />
                    <span className="font-bold">{selectedOrder.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-neutral-400" />
                    <span className="font-mono">{selectedOrder.customerPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-neutral-400" />
                    <span className="font-mono text-xs">{selectedOrder.customerEmail}</span>
                  </div>
                  {selectedOrder.shippingAddress && (
                    <div className="flex items-start gap-2 pt-1 border-t border-neutral-100 mt-2">
                      <MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                      <span className="text-neutral-600 text-xs leading-relaxed">{selectedOrder.shippingAddress}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3 text-start">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  {locale === "fa" ? "اقلام سفارش" : "Purchased Items"}
                </h4>
                <div className="divide-y divide-neutral-100">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="py-2.5 flex justify-between items-center text-sm">
                      <div>
                        <div className="font-semibold text-neutral-900">{item.product?.title || "Product"}</div>
                        <div className="text-xs text-neutral-400 mt-0.5">
                          {item.quantity} × {locale === "fa" ? formatToman(item.price) : `${item.price.toLocaleString()} Toman`}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-neutral-900">
                        {locale === "fa" ? formatToman(item.price * item.quantity) : `${(item.price * item.quantity).toLocaleString()} Toman`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment details */}
              <div className="pt-4 border-t border-neutral-100 text-start space-y-2.5 text-sm text-neutral-600">
                <div className="flex justify-between font-bold text-base text-neutral-950">
                  <span>{locale === "fa" ? "مبلغ قابل پرداخت:" : "Total Paid:"}</span>
                  <span className="font-mono">
                    {locale === "fa" ? formatToman(selectedOrder.total) : `${selectedOrder.total.toLocaleString()} Toman`}
                  </span>
                </div>
                
                <div className="flex justify-between text-xs pt-1">
                  <span>{locale === "fa" ? "تاریخ تراکنش:" : "Transaction Date:"}</span>
                  <span className="font-mono">{new Date(selectedOrder.createdAt).toLocaleString(locale === "fa" ? "fa-IR" : "en-US")}</span>
                </div>

                {selectedOrder.zarinpalAuthority && (
                  <div className="flex justify-between text-xs font-mono">
                    <span>Authority:</span>
                    <span>{selectedOrder.zarinpalAuthority}</span>
                  </div>
                )}
                {selectedOrder.zarinpalRefId && (
                  <div className="flex justify-between text-xs font-mono">
                    <span>ZarinPal RefID:</span>
                    <span className="text-emerald-600 font-semibold">{selectedOrder.zarinpalRefId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex justify-end gap-2">
              {selectedOrder.status === "paid" && (
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, "shipped")}
                  className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>{locale === "fa" ? "تغییر وضعیت به ارسال شده" : "Mark as Shipped"}</span>
                </button>
              )}
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                {locale === "fa" ? "بستن" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default AdminOrders;
