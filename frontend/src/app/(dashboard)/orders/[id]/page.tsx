"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { Order } from "@/lib/types";
import StatusBadge from "@/app/components/status-badge";
import { OrderJourney } from "@/app/components/order-journey";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch(`/orders/get-order-by-id/${id}`)
      .then((data) => setOrder(data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Order not found"),
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="text-sm text-ink/50">Loading order…</p>;
  }

  if (error || !order) {
    return (
      <div className="max-w-lg">
        <p className="text-sm text-alert">{error || "Order not found"}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink mb-1">
            Order{" "}
            <span className="font-mono text-lg text-ink/50">
              #{order.id.slice(0, 8)}
            </span>
          </h1>
          <p className="text-sm text-ink/50">{order.customerEmail}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="bg-ink rounded-2xl overflow-hidden">
        <OrderJourney
          status={order.status}
          pickup={[order.pickupLat!, order.pickupLng!]}
          delivery={[order.deliveryLat!, order.deliveryLng!]}
        />
      </div>

      <div className="bg-white rounded-2xl border border-ink/10 p-6 grid grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-medium text-ink/40 uppercase tracking-wide mb-1">
            Total amount
          </p>
          <p className="text-lg font-semibold text-ink">
            ₹{order.totalAmount.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink/40 uppercase tracking-wide mb-1">
            Placed
          </p>
          <p className="text-lg font-semibold text-ink">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-xs font-medium text-ink/40 uppercase tracking-wide mb-1">
            Order ID
          </p>
          <p className="font-mono text-sm text-ink/70">{order.id}</p>
        </div>
      </div>
    </div>
  );
}
