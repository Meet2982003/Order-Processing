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
import { Lightbulb, ArrowRight, Package, TrendingUp, CheckCircle, Clock, ShoppingBag, MapPin, Compass, Search, CreditCard } from "lucide-react";
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

function AdminDashboard({ orders }: { orders: Order[] }) {
  const tipIndex = useRotatingIndex(TIPS.length);
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
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink tracking-tight">Admin Overview</h1>
          <p className="text-ink/60 text-sm mt-1">Get a bird's-eye view of all platform activity.</p>
        </div>
        <div className="flex items-center gap-3">
           <Link href="/products" className="inline-flex items-center justify-center rounded-xl bg-ink text-white font-semibold px-5 py-2.5 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm">
             Manage Catalog
           </Link>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        <div className="bg-white border border-ink/10 rounded-[1.5rem] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-default">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-shipped/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex items-center justify-between mb-4 relative">
             <p className="text-xs font-bold text-ink/50 uppercase tracking-wider">Total Revenue</p>
             <div className="w-10 h-10 rounded-full bg-shipped/10 text-shipped flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp size={20} />
             </div>
          </div>
          <p className="text-4xl font-display font-bold text-ink relative">₹{totalRevenue.toFixed(2)}</p>
        </div>

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
           <p className="text-sm text-ink/50 mb-8 max-w-sm">Sales and fulfillment charts will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            {/* Orders Chart */}
            <div className="bg-white rounded-[1.5rem] border border-ink/10 p-7 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-lg font-display font-bold text-ink">Orders by Day</p>
                  <p className="text-sm text-ink/50 mt-1">Daily order volume over time</p>
                </div>
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
                        <p key={tipIndex} className="text-sm text-ink/80 leading-relaxed animate-[fadeIn_0.5s_ease-in-out] font-medium min-h-[40px]">
                          {TIPS[tipIndex]}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-ink/40 text-center mt-5">Trend chart will appear once orders span multiple days.</p>
                </div>
              ) : (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} barCategoryGap="20%" margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#10182810" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#10182880", fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#10182880", fontWeight: 500 }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: '#10182805' }} contentStyle={{ borderRadius: '12px', border: '1px solid #10182810', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px' }} />
                      <Bar dataKey="count" fill="#3654E0" radius={[6, 6, 0, 0]} maxBarSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            
            {/* Revenue Chart */}
            <div className="bg-white rounded-[1.5rem] border border-ink/10 p-7 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-lg font-display font-bold text-ink mb-1">Revenue Trend</p>
              <p className="text-sm text-ink/50 mb-8">Daily revenue over time</p>
              {singleDay ? (
                 <div className="h-[250px] flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-shipped/10 flex items-center justify-center mb-3">
                       <TrendingUp size={20} className="text-shipped" />
                    </div>
                    <p className="text-sm text-ink/50">Not enough data points yet.</p>
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
                      <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#10182880", fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                      <YAxis tickFormatter={(value) => `₹${value}`} tick={{ fontSize: 12, fill: "#10182880", fontWeight: 500 }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, "Revenue"]} cursor={{ stroke: '#1F9D6C', strokeWidth: 1, strokeDasharray: '4 4' }} contentStyle={{ borderRadius: '12px', border: '1px solid #10182810', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#1F9D6C" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white rounded-[1.5rem] border border-ink/10 p-6 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-lg font-display font-bold text-ink">Recent Orders</p>
                  <p className="text-sm text-ink/50 mt-0.5">Latest activity</p>
                </div>
                <Link href="/orders" className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-paper text-ink/50 hover:bg-cobalt/10 hover:text-cobalt transition-colors"><ArrowRight size={16} /></Link>
              </div>
              <div className="flex flex-col gap-3 flex-1">
                {recentOrders.map((o) => (
                  <Link key={o.id} href={`/orders/${o.id}`} className="flex flex-col gap-2 p-4 rounded-xl border border-ink/5 hover:border-ink/15 hover:bg-paper hover:shadow-sm transition-all group">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-ink text-sm group-hover:text-cobalt transition-colors">#{o.id.slice(0, 8)}</span>
                      <StatusBadge status={o.status} />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-ink/50 flex items-center gap-1.5 font-medium"><Clock size={12} />{new Date(o.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                      <span className="text-ink font-bold text-sm">₹{o.totalAmount.toFixed(2)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UserDashboard({ orders, email }: { orders: Order[], email: string }) {
  const activeOrders = orders.filter(o => !["DELIVERED", "CANCELLED"].includes(o.status));
  const pastOrders = orders.filter(o => ["DELIVERED", "CANCELLED"].includes(o.status));
  
  const recentActive = activeOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);
  const recentPast = pastOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);

  const firstName = email.split('@')[0].replace(/[^a-zA-Z]/g, ' ');

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 pb-16">
      
      {/* Hero Welcome Section */}
      <div className="relative w-full rounded-[2.5rem] bg-ink overflow-hidden p-10 sm:p-14 shadow-xl">
         {/* Abstract background shapes */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-cobalt/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
         <div className="absolute bottom-0 left-10 w-72 h-72 bg-shipped/20 rounded-full blur-3xl translate-y-1/3"></div>
         
         <div className="relative z-10 max-w-2xl">
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
              Welcome back, <span className="capitalize">{firstName}</span>!
            </h1>
            <p className="text-paper/70 text-lg mb-8 max-w-xl leading-relaxed">
              Ready to explore what's new? Track your current deliveries or discover our latest product collections.
            </p>
            <div className="flex flex-wrap items-center gap-4">
               <Link href="/products" className="inline-flex items-center gap-2 rounded-xl bg-white text-ink font-bold px-6 py-3.5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                  <Compass size={18} /> Discover Products
               </Link>
               {activeOrders.length > 0 && (
                 <Link href="/orders" className="inline-flex items-center gap-2 rounded-xl bg-paper/10 text-white font-semibold border border-white/10 px-6 py-3.5 hover:bg-paper/20 transition-all backdrop-blur-md">
                    <Package size={18} /> View My Deliveries
                 </Link>
               )}
            </div>
         </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
         <div className="bg-white rounded-3xl p-6 border border-ink/5 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-cobalt/10 flex items-center justify-center shrink-0">
               <Package size={24} className="text-cobalt" />
            </div>
            <div>
               <p className="text-3xl font-display font-bold text-ink">{activeOrders.length}</p>
               <p className="text-sm font-semibold text-ink/50 uppercase tracking-wider">Active Orders</p>
            </div>
         </div>
         <div className="bg-white rounded-3xl p-6 border border-ink/5 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-shipped/10 flex items-center justify-center shrink-0">
               <ShoppingBag size={24} className="text-shipped" />
            </div>
            <div>
               <p className="text-3xl font-display font-bold text-ink">{orders.length}</p>
               <p className="text-sm font-semibold text-ink/50 uppercase tracking-wider">Total Purchases</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         {/* Active Orders Section */}
         <div className="space-y-6">
            <div className="flex items-center justify-between">
               <h2 className="text-2xl font-display font-bold text-ink flex items-center gap-2">
                  <Clock className="text-cobalt" size={24} /> In Progress
               </h2>
            </div>
            
            {recentActive.length > 0 ? (
               <div className="space-y-4">
                  {recentActive.map(order => (
                     <Link key={order.id} href={`/orders/${order.id}`} className="block bg-white rounded-[1.5rem] p-6 border border-ink/10 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                           <div>
                              <p className="text-xs font-bold text-ink/40 uppercase tracking-wider mb-1">Order #{order.id.slice(0,8)}</p>
                              <p className="font-semibold text-ink">₹{order.totalAmount.toFixed(2)}</p>
                           </div>
                           <StatusBadge status={order.status} />
                        </div>
                        
                        <div className="bg-paper rounded-xl p-4 flex items-center justify-between mt-4 border border-ink/5 group-hover:border-cobalt/20 transition-colors">
                           <div className="flex items-center gap-3 text-sm font-medium text-ink/70">
                              <MapPin size={16} className="text-ink/40" />
                              {order.deliveryAddress || "Delivery details pending"}
                           </div>
                           <ArrowRight size={16} className="text-ink/30 group-hover:text-cobalt transition-colors" />
                        </div>
                     </Link>
                  ))}
               </div>
            ) : (
               <div className="bg-paper rounded-[1.5rem] border border-ink/5 border-dashed p-10 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
                     <Search size={24} className="text-ink/20" />
                  </div>
                  <p className="font-bold text-ink">No active orders</p>
                  <p className="text-sm text-ink/50 mt-1 mb-6">You don't have any orders currently in progress.</p>
                  <Link href="/products" className="text-cobalt font-semibold text-sm hover:underline">Start shopping</Link>
               </div>
            )}
         </div>

         {/* Past Orders Section */}
         <div className="space-y-6">
            <div className="flex items-center justify-between">
               <h2 className="text-2xl font-display font-bold text-ink flex items-center gap-2">
                  <CheckCircle className="text-shipped" size={24} /> Past Orders
               </h2>
               {pastOrders.length > 3 && (
                  <Link href="/orders" className="text-sm font-semibold text-cobalt hover:underline">View All</Link>
               )}
            </div>

            {recentPast.length > 0 ? (
               <div className="space-y-4">
                  {recentPast.map(order => (
                     <Link key={order.id} href={`/orders/${order.id}`} className="block bg-white rounded-[1.5rem] p-5 border border-ink/10 shadow-sm hover:border-ink/20 transition-all">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-paper flex items-center justify-center shrink-0 border border-ink/5">
                                 <Package size={20} className={order.status === 'DELIVERED' ? 'text-shipped' : 'text-alert'} />
                              </div>
                              <div>
                                 <p className="font-bold text-ink text-sm">#{order.id.slice(0, 8)}</p>
                                 <p className="text-xs text-ink/50 mt-0.5">{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric'})}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="font-bold text-ink mb-1">₹{order.totalAmount.toFixed(2)}</p>
                              <StatusBadge status={order.status} />
                           </div>
                        </div>
                     </Link>
                  ))}
               </div>
            ) : (
               <div className="bg-paper rounded-[1.5rem] border border-ink/5 border-dashed p-10 text-center flex flex-col items-center justify-center h-full min-h-[250px]">
                  <p className="text-sm text-ink/40 font-medium">Your completed orders will appear here.</p>
               </div>
            )}
         </div>
      </div>

    </div>
  );
}

export default function OverviewPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setRole(payload.role);
        setEmail(payload.email || payload.sub || "User");
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

  if (role === "ADMIN") {
    return <AdminDashboard orders={orders} />;
  }

  return <UserDashboard orders={orders} email={email} />;
}
