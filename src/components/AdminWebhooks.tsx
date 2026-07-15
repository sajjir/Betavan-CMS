import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Check, 
  X, 
  RefreshCw,
  Settings,
  Link as LinkIcon,
  ToggleLeft,
  ToggleRight,
  Activity,
  AlertCircle
} from "lucide-react";
import { useLanguage } from "../i18n.js";
import { WebhookConfig, WebhookLog } from "../types.js";

export function AdminWebhooks() {
  const { t, locale } = useLanguage();
  
  // States
  const [configs, setConfigs] = useState<WebhookConfig[]>([]);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Create Form State
  const [newEvent, setNewEvent] = useState("order.paid");
  const [newUrl, setNewUrl] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = localStorage.getItem("accessToken");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [configsRes, logsRes] = await Promise.all([
        fetch("/api/webhooks", {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch("/api/webhooks/logs?limit=30", {
          headers: { "Authorization": `Bearer ${token}` }
        })
      ]);

      if (!configsRes.ok || !logsRes.ok) {
        throw new Error("Failed to load webhook configuration from server");
      }

      const configsData = await configsRes.json();
      const logsData = await logsRes.json();

      setConfigs(configsData || []);
      setLogs(logsData || []);
    } catch (err: any) {
      setError(err.message || "Error occurred while fetching webhooks data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;

    try {
      setError("");
      setMessage("");
      setIsSubmitting(true);
      
      const res = await fetch("/api/webhooks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          event: newEvent,
          url: newUrl,
          enabled: true
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not create webhook config");
      }

      setNewUrl("");
      setIsCreating(false);
      setMessage(locale === "fa" ? "وب‌هووک با موفقیت ایجاد شد." : "Webhook created successfully!");
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (config: WebhookConfig) => {
    try {
      setError("");
      setMessage("");
      
      const res = await fetch(`/api/webhooks/${config.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          enabled: !config.enabled
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update webhook state");
      }

      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("webhooks_delete_confirm"))) return;

    try {
      setError("");
      setMessage("");
      
      const res = await fetch(`/api/webhooks/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete webhook configuration");
      }

      setMessage(locale === "fa" ? "تنظیمات وب‌هووک با موفقیت حذف شد." : "Webhook deleted successfully!");
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-8" id="admin-webhooks-container">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900" id="webhooks-title">
            {t("webhooks_title")}
          </h1>
          <p className="text-sm text-gray-500 mt-1" id="webhooks-subtitle">
            {t("webhooks_subtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => loadData()}
            className="p-2 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition"
            title="Refresh"
            id="btn-refresh-webhooks"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition text-sm font-medium"
            id="btn-new-webhook"
          >
            <Plus className="w-4 h-4" />
            {t("webhooks_new")}
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-md flex items-start gap-2 text-sm border border-red-100" id="webhooks-error-msg">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
          <span>{error}</span>
        </div>
      )}
      {message && (
        <div className="p-4 bg-green-50 text-green-800 rounded-md flex items-start gap-2 text-sm border border-green-100" id="webhooks-success-msg">
          <Check className="w-5 h-5 shrink-0 text-green-500" />
          <span>{message}</span>
        </div>
      )}

      {/* Create New Webhook Block */}
      {isCreating && (
        <form onSubmit={handleCreate} className="p-5 bg-gray-50 rounded-lg border border-gray-200 space-y-4" id="form-create-webhook">
          <h2 className="text-base font-bold text-gray-900">{t("webhooks_new")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t("webhooks_event")}</label>
              <select
                value={newEvent}
                onChange={(e) => setNewEvent(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-md p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
                id="select-webhook-event"
              >
                <option value="order.paid">{t("webhooks_event_order_paid")}</option>
                <option value="post.published">{t("webhooks_event_post_published")}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t("webhooks_url")}</label>
              <input
                type="url"
                required
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://n8n.yourdomain.com/webhook/..."
                className="w-full text-sm border border-gray-200 rounded-md p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-gray-900 ltr-input"
                id="input-webhook-url"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-100 transition"
              id="btn-cancel-create-webhook"
            >
              {locale === "fa" ? "لغو" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50"
              id="btn-submit-create-webhook"
            >
              {isSubmitting ? (locale === "fa" ? "در حال ایجاد..." : "Creating...") : t("webhooks_create_btn")}
            </button>
          </div>
        </form>
      )}

      {/* Webhook Configurations Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden" id="webhooks-configs-card">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-gray-400" />
            {locale === "fa" ? "تنظیمات وب‌هووک‌های فعال" : "Active Webhook Configurations"}
          </h2>
        </div>

        {configs.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            {locale === "fa" ? "هیچ وب‌هووکی پیکربندی نشده است." : "No webhooks configured yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 font-medium">
                  <th className="p-4 text-right rtl:text-right ltr:text-left">{t("webhooks_event")}</th>
                  <th className="p-4 text-right rtl:text-right ltr:text-left">{t("webhooks_url")}</th>
                  <th className="p-4 text-center">{t("webhooks_enabled")}</th>
                  <th className="p-4 text-center">{locale === "fa" ? "عملیات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {configs.map((config) => (
                  <tr key={config.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 text-right rtl:text-right ltr:text-left font-medium text-gray-900">
                      <span className="inline-block px-2.5 py-1 bg-gray-100 rounded text-xs font-mono">
                        {config.event}
                      </span>
                    </td>
                    <td className="p-4 text-right rtl:text-right ltr:text-left">
                      <div className="flex items-center gap-1.5 text-gray-600 font-mono text-xs max-w-md truncate">
                        <LinkIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{config.url}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggle(config)}
                        className="inline-flex items-center justify-center p-1 text-gray-500 hover:text-gray-900 transition"
                        title={config.enabled ? "Disable" : "Enable"}
                      >
                        {config.enabled ? (
                          <ToggleRight className="w-9 h-6 text-emerald-600" />
                        ) : (
                          <ToggleLeft className="w-9 h-6 text-gray-300" />
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(config.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition"
                        title="Delete Webhook"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Webhook Triggers Execution Logs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden" id="webhooks-logs-card">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-gray-400" />
            {t("webhooks_logs_title")}
          </h2>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-medium">
            {locale === "fa" ? `نمایش آخرین ${logs.length} مورد` : `Showing last ${logs.length} items`}
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            {t("webhooks_no_logs")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 font-medium">
                  <th className="p-4 text-right rtl:text-right ltr:text-left">{t("webhooks_event")}</th>
                  <th className="p-4 text-right rtl:text-right ltr:text-left">{t("webhooks_url")}</th>
                  <th className="p-4 text-center">{t("webhooks_log_status")}</th>
                  <th className="p-4 text-right rtl:text-right ltr:text-left">{t("webhooks_log_response")}</th>
                  <th className="p-4 text-right rtl:text-right ltr:text-left">{t("webhooks_log_time")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 text-right rtl:text-right ltr:text-left font-mono text-xs">
                      <span className="inline-block px-2 py-0.5 bg-gray-100 rounded text-gray-700">
                        {log.event}
                      </span>
                    </td>
                    <td className="p-4 text-right rtl:text-right ltr:text-left font-mono text-xs max-w-xs truncate" title={log.url}>
                      {log.url}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold ${
                        log.success 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                          : "bg-rose-50 text-rose-700 border border-rose-100"
                      }`}>
                        {log.success ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {log.statusCode || (log.success ? "200" : "Network Error")}
                      </span>
                    </td>
                    <td className="p-4 text-right rtl:text-right ltr:text-left">
                      {log.responseBody ? (
                        <div className="relative group max-w-xs">
                          <div className="text-xs font-mono text-gray-500 truncate cursor-help bg-gray-50 p-1.5 rounded border border-gray-100">
                            {log.responseBody}
                          </div>
                          {/* Hover Tooltip/Detail box */}
                          <div className="absolute z-10 hidden group-hover:block bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono max-w-sm whitespace-pre-wrap shadow-lg border border-gray-800 -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full rtl:translate-x-1/2">
                            {log.responseBody}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-4 text-right rtl:text-right ltr:text-left text-xs text-gray-400 font-mono">
                      {new Date(log.createdAt).toLocaleString(locale === "fa" ? "fa-IR" : "en-US")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
