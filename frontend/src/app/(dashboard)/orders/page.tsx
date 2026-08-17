"use client";

import StatusBadge from "@/app/components/status-badge";
import { apiFetch } from "@/lib/api";
import { Order } from "@/lib/types";
import { Package, ChevronRight, Clock, Receipt, ShoppingBag } from "lucide-react";
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
    <div className="w-full max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink tracking-tight">Orders</h1>
          <p className="text-ink/60 text-sm mt-1">Track, manage, and review your recent purchases.</p>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-20">
           <div className="w-8 h-8 border-4 border-cobalt border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-alert/10 border border-alert/20 text-alert p-4 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-white border border-ink/10 rounded-[2rem] shadow-sm">
          <div className="w-20 h-20 rounded-full bg-paper flex items-center justify-center mb-6">
            <ShoppingBag size={32} className="text-ink/30" />
          </div>
          <h3 className="text-xl font-display font-bold text-ink mb-2">No orders yet</h3>
          <p className="text-sm text-ink/50 mb-8 max-w-sm">Looks like you haven't placed any orders. Browse our products to get started.</p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-xl bg-ink text-white font-semibold px-6 py-3 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            Browse Products
          </Link>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <Link href={`/orders/${order.id}`} key={order.id} className="block group">
              <div className="flex items-center justify-between p-5 md:p-6 bg-white border border-ink/10 rounded-2xl shadow-sm hover:shadow-md hover:border-ink/20 transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-full bg-paper flex items-center justify-center text-ink/40 group-hover:bg-cobalt/10 group-hover:text-cobalt transition-colors shrink-0">
                    <Package size={24} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-1.5">
                      <h3 className="font-semibold text-ink text-base">Order #{order.id.slice(0, 8)}</h3>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-ink/50 flex flex-wrap items-center gap-2 font-medium">
                      <span className="flex items-center gap-1.5"><Clock size={14} /> {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      <span className="hidden sm:inline mx-1 text-ink/20">•</span>
                      <span className="flex items-center gap-1.5"><Receipt size={14} /> ₹{order.totalAmount.toFixed(2)}</span>
                    </p>
                  </div>
                </div>
                
                <div className="hidden sm:flex items-center text-ink/30 group-hover:text-cobalt transition-colors group-hover:translate-x-1 duration-300">
                  <ChevronRight size={24} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
