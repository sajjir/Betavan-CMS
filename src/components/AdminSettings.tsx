import React, { useState } from "react";
import { AlertCircle, CheckCircle, Lock, RefreshCw } from "lucide-react";
import { useLanguage } from "../i18n.js";

export function AdminSettings() {
  const { t } = useLanguage();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 6) {
      setError(t("newPasswordLengthError") || "New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("settings_error_mismatch"));
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/auth/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update password");
      }

      setSuccess(t("settings_success"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-start">
        <h2 className="text-2xl font-extrabold text-neutral-900 font-display tracking-tight">{t("settings_title")}</h2>
        <p className="text-xs text-neutral-500">{t("settings_subtitle")}</p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs text-start">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-150 rounded-xl flex items-center text-xs text-red-700">
              <AlertCircle className="w-5 h-5 me-2 shrink-0 animate-pulse" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-150 rounded-xl flex items-center text-xs text-emerald-700">
              <CheckCircle className="w-5 h-5 me-2 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">
                {t("settings_current_pass")}
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-brand focus:bg-white text-start"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">
                {t("settings_new_pass")}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-brand focus:bg-white text-start"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">
                {t("settings_confirm_pass")}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-brand focus:bg-white text-start"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-brand hover:bg-brand-hover text-white text-sm font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t("edit_saving")}</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>{t("settings_change_btn")}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
