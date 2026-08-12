"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, otp, newPassword }),
      });
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-ink/5 border border-ink/5 p-8">
      <h1 className="font-display text-2xl font-bold text-ink mb-1">
        Reset password
      </h1>
      <p className="text-sm text-ink/60 mb-8">
        Enter the code sent to your email
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            OTP
          </label>
          <input
            type="text"
            required
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-transparent"
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
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gradient-to-r from-cobalt to-cobalt-dark text-white text-sm font-semibold py-2.5 shadow-md shadow-cobalt/25 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
        >
          {loading ? "Resetting…" : "Reset password"}
        </button>
      </form>

      <p className="text-sm text-ink/60 mt-6 text-center">
        <Link href="/login" className="text-cobalt font-medium">
          Back to login
        </Link>
      </p>
    </div>
  );
}
