"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function NewOrderPage() {
  const router = useRouter();
  const [customerEmail, setCustomerEmail] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const order = await apiFetch("/orders/create", {
        method: "POST",
        body: JSON.stringify({
          customerEmail,
          totalAmount: parseFloat(totalAmount),
        }),
      });
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create order");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl font-bold text-ink mb-6">
        New order
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-ink/10 p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            Customer email
          </label>
          <input
            type="email"
            required
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="customer@example.com"
            className="w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-transparent transition-shadow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            Total amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 text-sm">
              $
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-ink/15 pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-transparent transition-shadow"
            />
          </div>
        </div>

        {error && <p className="text-sm text-alert">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gradient-to-r from-cobalt to-cobalt-dark text-white text-sm font-semibold py-2.5 shadow-md shadow-cobalt/25 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {loading ? "Creating…" : "Create order"}
        </button>
      </form>
    </div>
  );
}
