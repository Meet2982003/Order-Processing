"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { Order } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  CREATED: "#101828",
  PAID: "#3654E0",
  SHIPPED: "#C88719",
  DELIVERED: "#1F9D6C",
  CANCELLED: "#D64545",
};

export default function OverviewPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/orders/for-user")
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-ink/50">Loading overview…</p>;

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  const byDay = orders.reduce<Record<string, number>>((acc, o) => {
    const day = new Date(o.createdAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});
  const barData = Object.entries(byDay).map(([day, count]) => ({ day, count }));

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-ink">Overview</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-ink/10 p-5">
          <p className="text-xs font-medium text-ink/40 uppercase tracking-wide mb-1">
            Total orders
          </p>
          <p className="text-2xl font-bold text-ink">{orders.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-ink/10 p-5">
          <p className="text-xs font-medium text-ink/40 uppercase tracking-wide mb-1">
            Total revenue
          </p>
          <p className="text-2xl font-bold text-ink">
            ${totalRevenue.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-ink/10 p-5">
          <p className="text-xs font-medium text-ink/40 uppercase tracking-wide mb-1">
            Delivered
          </p>
          <p className="text-2xl font-bold text-shipped">
            {statusCounts.DELIVERED || 0}
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-ink/10 p-10 text-center text-sm text-ink/50">
          No data yet — create an order to see charts here.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-ink/10 p-5">
            <p className="text-sm font-semibold text-ink mb-4">Orders by day</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#10182810" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "#10182880" }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#10182880" }}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#3654E0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-ink/10 p-5">
            <p className="text-sm font-semibold text-ink mb-4">
              Status breakdown
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={STATUS_COLORS[entry.name] || "#10182880"}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
