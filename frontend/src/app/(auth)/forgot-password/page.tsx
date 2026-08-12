"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
    } catch {
      // deliberately silent - same response whether email exists or not
    } finally {
      setLoading(false);
      setSent(true);
    }
  }

  return (
    <div className="w-full max-w-sm bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-ink/5 border border-ink/5 p-8">
      <h1 className="font-display text-2xl font-bold text-ink mb-1">
        Forgot password
      </h1>
      <p className="text-sm text-ink/60 mb-8">
        We&apos;ll send a code to your email
      </p>

      {sent ? (
        <div className="space-y-4">
          <p className="text-sm text-shipped">
            If an account exists for that email, a code has been sent.
          </p>
          <Link
            href={`/reset-password?email=${encodeURIComponent(email)}`}
            className="block w-full text-center rounded-lg bg-gradient-to-r from-cobalt to-cobalt-dark text-white text-sm font-semibold py-2.5 shadow-md shadow-cobalt/25 hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            I have my code
          </Link>
        </div>
      ) : (
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
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-cobalt to-cobalt-dark text-white text-sm font-semibold py-2.5 shadow-md shadow-cobalt/25 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            {loading ? "Sending…" : "Send code"}
          </button>
        </form>
      )}

      <p className="text-sm text-ink/60 mt-6 text-center">
        <Link href="/login" className="text-cobalt font-medium">
          Back to login
        </Link>
      </p>
    </div>
  );
}
