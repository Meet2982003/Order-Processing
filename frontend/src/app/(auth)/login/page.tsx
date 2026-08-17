"use client";

import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      sessionStorage.setItem("token", data.token);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-ink/5 border border-ink/5 p-8">
      {" "}
      <h1 className="font-display text-2xl font-bold  text-ink mb-1">
        Welcome back
      </h1>
      <p className="text-sm text-ink/60 mv-8">Log in to your account</p>
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
            className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cobalt"
          />
        </div>

        <div>
          <div className="flex item-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-ink">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-cobalt font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cobalt"
          />
        </div>
        {error && <p className="text-sm text-alert">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-ink text-white text-sm font-medium py-2.5  hover:bg-ink/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
      <p className="text-sm text-ink/60 mt-6 text-center">
        Don't have an acount?{" "}
        <Link href="/register" className="text-cobalt font-medium">
          Sign up
        </Link>
      </p>
    </div>
  );
}
