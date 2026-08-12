"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function AccountPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await apiFetch("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update password",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto py-10">
      {/* <h1 className="font-display text-2xl font-bold text-ink mb-6">Account</h1> */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-ink/10 p-6"
      >
        <h2 className="text-lg font-semibold text-ink mb-5">Change password</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Current password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              New password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-transparent"
            />
          </div>

          {error && <p className="text-sm text-alert">{error}</p>}
          {message && <p className="text-sm text-shipped">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-gradient-to-r from-cobalt to-cobalt-dark text-white text-sm font-semibold px-5 py-2.5 shadow-md shadow-cobalt/25 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            {loading ? "Updating…" : "Update password"}
          </button>
        </div>
      </form>
    </div>
  );
}
