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
  Legend,
} from "recharts";
import { Lightbulb, ArrowRight } from "lucide-react";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  CREATED: "#101828",
  PAID: "#3654E0",
  SHIPPED: "#C88719",
  DELIVERED: "#1F9D6C",
  CANCELLED: "#D64545",
};

const STATUS_BG: Record<string, string> = {
  CREATED: "bg-ink/5 text-ink/70",
  PAID: "bg-cobalt/10 text-cobalt",
  SHIPPED: "bg-amber-500/10 text-amber-700",
  DELIVERED: "bg-shipped/10 text-shipped",
  CANCELLED: "bg-alert/10 text-alert",
};

const TIPS = [
  "Orders sitting in CREATED for too long usually mean payment follow-up is overdue.",
  "A steady SHIPPED → DELIVERED ratio is the best early signal your fulfillment pipeline is healthy.",
  "Reviewing cancelled orders weekly often reveals a pattern worth fixing upstream.",
  "Revenue per order is a quieter metric than order count, but it moves less noisily.",
  "The gap between PAID and SHIPPED is usually where operational delays hide.",
  "Come back tomorrow — this chart gets more useful with every extra day of data.",
];

function useRotatingIndex(length: number, intervalMs = 5000) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [length, intervalMs]);
  return index;
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide ${
        STATUS_BG[status] || "bg-ink/5 text-ink/60"
      }`}
    >
      {status}
    </span>
  );
}

export default function OverviewPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const tipIndex = useRotatingIndex(TIPS.length);

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
  const singleDay = barData.length === 1;
  const singleStatus = pieData.length === 1;

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

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
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-ink/10 p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-ink">Orders by day</p>
                {singleDay && (
                  <span className="text-xs text-ink/40">
                    {barData[0].count} on {barData[0].day}
                  </span>
                )}
              </div>

              {singleDay ? (
                <div className="h-[160px] flex flex-col justify-center">
                  <div className="rounded-xl bg-ink/[0.03] border border-ink/5 p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-7 w-7 rounded-full bg-cobalt/10 flex items-center justify-center shrink-0">
                        <Lightbulb size={14} className="text-cobalt" />
                      </div>
                      <p
                        key={tipIndex}
                        className="text-sm text-ink/70 leading-relaxed pt-0.5 animate-[fadeIn_0.4s_ease-in-out]"
                      >
                        {TIPS[tipIndex]}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-center gap-1.5 mt-3">
                    {TIPS.map((_, i) => (
                      <span
                        key={i}
                        className={`h-1 rounded-full transition-all duration-300 ${
                          i === tipIndex ? "w-4 bg-cobalt" : "w-1 bg-ink/15"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-ink/30 text-center mt-3">
                    Trend chart appears once orders span multiple days.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={barData} barCategoryGap="30%">
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
                    <Bar
                      dataKey="count"
                      fill="#3654E0"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={48}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-ink/10 p-5">
              <p className="text-sm font-semibold text-ink mb-4">
                Status breakdown
              </p>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={38}
                    outerRadius={60}
                    paddingAngle={singleStatus ? 0 : 3}
                    stroke="#fff"
                    strokeWidth={singleStatus ? 0 : 2}
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={STATUS_COLORS[entry.name] || "#10182880"}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span className="text-xs text-ink/70">
                        {value}
                        <span className="text-ink/40">
                          {" "}
                          · {statusCounts[value]}
                        </span>
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-ink/10 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-ink">Recent orders</p>
              <Link
                href="/orders"
                className="inline-flex items-center gap-1 text-xs font-medium text-cobalt hover:text-cobalt-dark transition-colors"
              >
                View all
                <ArrowRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-ink/5">
              {recentOrders.map((o) => (
                <Link
                  key={o.id}
                  href={`/orders/${o.id}`}
                  className="flex items-center justify-between py-3 -mx-2 px-2 rounded-lg text-sm hover:bg-ink/[0.03] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs text-ink/40 shrink-0">
                      #{o.id.slice(0, 8)}
                    </span>
                    <StatusBadge status={o.status} />
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <span className="text-xs text-ink/40">
                      {new Date(o.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="text-ink font-semibold w-16 text-right">
                      ${o.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
