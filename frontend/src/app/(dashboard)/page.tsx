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
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { Lightbulb, ArrowRight, Package, TrendingUp, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import StatusBadge from "@/app/components/status-badge";

const STATUS_COLORS: Record<string, string> = {
  CREATED: "#101828",
  PAID: "#3654E0",
  SHIPPED: "#C88719",
  DELIVERED: "#1F9D6C",
  CANCELLED: "#D64545",
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

export default function OverviewPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const tipIndex = useRotatingIndex(TIPS.length);

  useEffect(() => {
    const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setRole(payload.role);
      } catch (e) {
        console.error("Failed to parse token", e);
      }
    }

    apiFetch("/orders/for-user")
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="w-8 h-8 border-4 border-cobalt border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const revenueByDay = orders.reduce<Record<string, number>>((acc, o) => {
    const day = new Date(o.createdAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    acc[day] = (acc[day] || 0) + o.totalAmount;
    return acc;
  }, {});
  const revenueData = Object.entries(revenueByDay).map(([day, revenue]) => ({ day, revenue }));

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

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink tracking-tight">Overview</h1>
          <p className="text-ink/60 text-sm mt-1">Get a bird's-eye view of your account activity.</p>
        </div>
        <div className="flex items-center gap-3">
           <Link href="/products" className="inline-flex items-center justify-center rounded-xl bg-cobalt text-white font-semibold px-5 py-2.5 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm">
             Browse Products
           </Link>
        </div>
      </div>

      {/* Top Metrics */}
      <div className={`grid grid-cols-1 md:grid-cols-${role === 'ADMIN' ? '3' : '2'} gap-6`}>
        <div className="bg-white border border-ink/10 rounded-[1.5rem] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-default">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-cobalt/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex items-center justify-between mb-4 relative">
             <p className="text-xs font-bold text-ink/50 uppercase tracking-wider">Total Orders</p>
             <div className="w-10 h-10 rounded-full bg-cobalt/10 text-cobalt flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package size={20} />
             </div>
          </div>
          <p className="text-4xl font-display font-bold text-ink relative">{orders.length}</p>
        </div>

        {role === 'ADMIN' && (
          <div className="bg-white border border-ink/10 rounded-[1.5rem] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-default">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-shipped/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex items-center justify-between mb-4 relative">
               <p className="text-xs font-bold text-ink/50 uppercase tracking-wider">Total Spending</p>
               <div className="w-10 h-10 rounded-full bg-shipped/10 text-shipped flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp size={20} />
               </div>
            </div>
            <p className="text-4xl font-display font-bold text-ink relative">₹{totalRevenue.toFixed(2)}</p>
          </div>
        )}

        <div className="bg-white border border-ink/10 rounded-[1.5rem] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-default">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex items-center justify-between mb-4 relative">
             <p className="text-xs font-bold text-ink/50 uppercase tracking-wider">Delivered</p>
             <div className="w-10 h-10 rounded-full bg-amber/10 text-amber flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle size={20} />
             </div>
          </div>
          <p className="text-4xl font-display font-bold text-ink relative">{statusCounts.DELIVERED || 0}</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-ink/10 p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[300px]">
           <div className="w-20 h-20 rounded-full bg-paper flex items-center justify-center mb-6">
              <Package size={32} className="text-ink/30" />
           </div>
           <h3 className="text-xl font-display font-bold text-ink mb-2">No data yet</h3>
           <p className="text-sm text-ink/50 mb-8 max-w-sm">Place an order to see your sales and fulfillment charts here.</p>
           <Link href="/products" className="inline-flex items-center justify-center rounded-xl bg-ink text-white font-semibold px-6 py-3 hover:bg-ink/90 transition-all shadow-md">
             Browse Products
           </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Charts Area */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-[1.5rem] border border-ink/10 p-7 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-lg font-display font-bold text-ink">Orders by Day</p>
                  <p className="text-sm text-ink/50 mt-1">Daily order volume over time</p>
                </div>
                {singleDay && (
                  <span className="text-xs font-medium bg-ink/5 text-ink/60 px-3 py-1 rounded-full border border-ink/10">
                    {barData[0].count} on {barData[0].day}
                  </span>
                )}
              </div>

              {singleDay ? (
                <div className="h-[250px] flex flex-col justify-center">
                  <div className="rounded-2xl bg-gradient-to-br from-paper to-white border border-ink/5 p-6 shadow-sm relative overflow-hidden mx-auto max-w-md w-full">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cobalt/5 rounded-bl-full -z-10"></div>
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-cobalt/10 flex items-center justify-center shrink-0">
                        <Lightbulb size={20} className="text-cobalt" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-cobalt uppercase tracking-wider mb-2">Pro Tip</p>
                        <p
                          key={tipIndex}
                          className="text-sm text-ink/80 leading-relaxed animate-[fadeIn_0.5s_ease-in-out] font-medium min-h-[40px]"
                        >
                          {TIPS[tipIndex]}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center gap-2 mt-6">
                    {TIPS.map((_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          i === tipIndex ? "w-6 bg-cobalt" : "w-2 bg-ink/10"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-ink/40 text-center mt-5">
                    Trend chart will appear once orders span multiple days.
                  </p>
                </div>
              ) : (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} barCategoryGap="20%" margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#10182810" vertical={false} />
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 12, fill: "#10182880", fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 12, fill: "#10182880", fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        cursor={{ fill: '#10182805' }}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #10182810', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px' }}
                      />
                      <Bar
                        dataKey="count"
                        fill="#3654E0"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={60}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            
            {role === 'ADMIN' && (
              <div className="bg-white rounded-[1.5rem] border border-ink/10 p-7 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-lg font-display font-bold text-ink mb-1">Revenue Trend</p>
              <p className="text-sm text-ink/50 mb-8">Daily revenue over time</p>
              
              {singleDay ? (
                 <div className="h-[250px] flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-shipped/10 flex items-center justify-center mb-3">
                       <TrendingUp size={20} className="text-shipped" />
                    </div>
                    <p className="text-sm text-ink/50">Not enough data points yet.</p>
                    <p className="text-xs text-ink/40 mt-1 max-w-[200px]">Check back tomorrow to see your revenue growth chart!</p>
                 </div>
              ) : (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1F9D6C" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#1F9D6C" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#10182810" vertical={false} />
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 12, fill: "#10182880", fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                      />
                      <YAxis
                        tickFormatter={(value) => `₹${value}`}
                        tick={{ fontSize: 12, fill: "#10182880", fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, "Revenue"]}
                        cursor={{ stroke: '#1F9D6C', strokeWidth: 1, strokeDasharray: '4 4' }}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #10182810', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#1F9D6C"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            )}
          </div>

          {/* Recent Orders Area */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[1.5rem] border border-ink/10 p-6 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-lg font-display font-bold text-ink">Recent Orders</p>
                  <p className="text-sm text-ink/50 mt-0.5">Latest activity</p>
                </div>
                <Link
                  href="/orders"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-paper text-ink/50 hover:bg-cobalt/10 hover:text-cobalt transition-colors"
                  title="View all orders"
                >
                  <ArrowRight size={16} />
                </Link>
              </div>
              
              <div className="flex flex-col gap-3 flex-1">
                {recentOrders.map((o) => (
                  <Link
                    key={o.id}
                    href={`/orders/${o.id}`}
                    className="flex flex-col gap-2 p-4 rounded-xl border border-ink/5 hover:border-ink/15 hover:bg-paper hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-ink text-sm group-hover:text-cobalt transition-colors">
                        #{o.id.slice(0, 8)}
                      </span>
                      <StatusBadge status={o.status} />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-ink/50 flex items-center gap-1.5 font-medium">
                        <Clock size={12} />
                        {new Date(o.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="text-ink font-bold text-sm">
                        ₹{o.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-ink/5">
                 <Link href="/orders" className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-paper text-ink font-semibold text-sm hover:bg-ink/5 transition-colors">
                    View All Activity <ArrowRight size={14} />
                 </Link>
              </div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
