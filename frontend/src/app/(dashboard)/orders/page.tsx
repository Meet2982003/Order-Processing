"use client";

import StatusBadge from "@/app/components/status-badge";
import { apiFetch } from "@/lib/api";
import { Order } from "@/lib/types";
import { Package } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function OrderPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/orders/for-user")
      .then((data) => setOrders(data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load orders"),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink mb-6">Orders</h1>
      {loading && <p className="text-sm text-ink/50">Loading orders…</p>}
      {error && <p className="text-sm text-alert">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-full bg-ink/5 flex items-center justify-center mb-3">
            <Package size={20} className="text-ink/40" />
          </div>
          <p className="text-sm text-ink/50 mb-4">No orders yet</p>
          <Link
            href="/products"
            className="text-sm font-medium text-cobalt hover:underline"
          >
            Browse products
          </Link>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="bg-white rounded-2xl border border-ink/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10 bg-ink/[0.02]">
                <th className="text-left font-medium text-ink/50 px-5 py-3">
                  Order ID
                </th>
                <th className="text-left font-medium text-ink/50 px-5 py-3">
                  Amount
                </th>
                <th className="text-left font-medium text-ink/50 px-5 py-3">
                  Status
                </th>
                <th className="text-left font-medium text-ink/50 px-5 py-3">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.02] transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/orders/${order.id}`}
                      className="font-mono text-xs text-cobalt hover:underline"
                    >
                      {order.id.slice(0, 8)}…
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-ink/80">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-3.5 text-ink/50 font-mono text-xs">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
