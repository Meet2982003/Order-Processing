"use client";

import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-ink/5 border border-ink/5 p-8">
      {" "}
      <h1 className="font-display text-2xl font-bold text-ink mb-1">
        Create account
      </h1>
      <p className="text-sm text-ink/60 mb-8">Start managing orders</p>
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
            className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus:ring-2 focus:ring-cobalt"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            Password
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cobalt"
          />
        </div>
        {error && <p className="text-sm text-alert">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg  bg-cobalt  text-white text-sm font-medium py-2.5 hover:bg-cobalt-dark transition-colors disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="text-sm text-ink/60 mt-6 text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-cobalt font-medium">
          Log in
        </Link>
      </p>
    </div>
  );
}
