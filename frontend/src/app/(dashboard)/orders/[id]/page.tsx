"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { Order } from "@/lib/types";
import StatusBadge from "@/app/components/status-badge";
import { OrderJourney } from "@/app/components/order-journey";
import { User, CreditCard, Calendar, MapPin, Hash, ArrowLeft, Package, Clock } from "lucide-react";
import Link from "next/link";

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
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-cobalt border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="w-16 h-16 rounded-full bg-alert/10 flex items-center justify-center mx-auto mb-4">
           <Hash size={24} className="text-alert" />
        </div>
        <p className="text-xl font-bold text-ink mb-2">Order Not Found</p>
        <p className="text-sm text-ink/60 mb-6">{error || "We couldn't find the order you're looking for."}</p>
        <Link href="/orders" className="text-cobalt font-semibold hover:underline">
           Return to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 pb-16">
      
      {/* Top Navigation */}
      <div>
         <Link href="/orders" className="inline-flex items-center text-sm font-semibold text-ink/50 hover:text-ink transition-colors mb-4">
            <ArrowLeft size={16} className="mr-1.5" /> Back to orders
         </Link>
         
         <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl font-bold text-ink tracking-tight flex items-center gap-3">
                 Order <span className="text-ink/30 font-mono text-3xl">#{order.id.slice(0, 8)}</span>
              </h1>
              <p className="text-ink/50 mt-2 flex items-center gap-2 text-sm">
                 <Calendar size={14} />
                 Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white border border-ink/10 px-4 py-2.5 rounded-2xl shadow-sm">
               <span className="text-xs font-bold text-ink/40 uppercase tracking-wider">Status:</span>
               <StatusBadge status={order.status} />
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* Left Side: Map */}
        <div className="relative w-full min-h-[500px] lg:min-h-full rounded-[2rem] overflow-hidden shadow-sm border border-ink/10 bg-paper">
          <OrderJourney
            status={order.status}
            pickup={[order.pickupLat!, order.pickupLng!]}
            delivery={[order.deliveryLat!, order.deliveryLng!]}
            className="absolute inset-0 h-full w-full"
            mapClassName="h-full w-full"
          />
        </div>

        {/* Right Side: Details Stack */}
        <div className="flex flex-col space-y-6">
          
          {/* Customer & Delivery Card */}
          <div className="bg-white rounded-[1.5rem] border border-ink/10 p-8 shadow-sm flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-cobalt/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500"></div>
            
            <h3 className="text-lg font-display font-bold text-ink mb-6">Delivery Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-1">
                  <p className="text-xs font-bold text-ink/40 uppercase tracking-wider flex items-center gap-2">
                     <User size={14} /> Customer
                  </p>
                  <p className="text-base font-semibold text-ink pt-1">{order.customerEmail}</p>
               </div>
               
               <div className="space-y-1">
                  <p className="text-xs font-bold text-ink/40 uppercase tracking-wider flex items-center gap-2">
                     <MapPin size={14} /> Destination
                  </p>
                  <p className="text-base font-semibold text-ink pt-1 leading-relaxed">
                     {order.deliveryAddress || "Address not provided"}
                  </p>
               </div>
               
               <div className="space-y-1 md:col-span-2 pt-4 border-t border-ink/5">
                  <p className="text-xs font-bold text-ink/40 uppercase tracking-wider flex items-center gap-2">
                     <Clock size={14} /> Order Timeline
                  </p>
                  <p className="text-sm text-ink/60 pt-1 leading-relaxed">
                     This order was registered at {new Date(order.createdAt).toLocaleTimeString()}. The map on the left reflects the live routing data computed for delivery fulfillment.
                  </p>
               </div>
            </div>
          </div>

          {/* Order Value Card */}
        <div className="bg-white rounded-[1.5rem] border border-ink/10 p-8 shadow-sm flex flex-col flex-1">
          <h3 className="text-lg font-display font-bold text-ink mb-6">Order Value</h3>
          
          <div className="flex-1 flex flex-col justify-center items-center text-center bg-paper rounded-2xl p-8 border border-ink/5 mb-8">
             <div className="w-12 h-12 rounded-full bg-cobalt/10 flex items-center justify-center mb-4">
                <Package size={20} className="text-cobalt" />
             </div>
             <p className="text-xs font-bold text-ink/40 uppercase tracking-wider mb-2">Total Amount</p>
             <p className="text-5xl font-display font-bold text-ink text-transparent bg-clip-text bg-gradient-to-br from-ink to-ink/70">
                ₹{order.totalAmount.toFixed(2)}
             </p>
          </div>
          
          <div className="mb-6 space-y-3">
             <h4 className="text-sm font-bold text-ink/60 uppercase tracking-wider">Order Items</h4>
             <div className="divide-y divide-ink/5 border-t border-ink/5">
                {order.items?.map((item) => (
                   <div key={item.productId} className="py-3 flex justify-between items-center">
                      <div className="flex flex-col">
                         <span className="text-sm font-semibold text-ink">{item.productName}</span>
                         <span className="text-xs text-ink/50">Qty: {item.quantity} × ₹{item.priceAtPurchase.toFixed(2)}</span>
                      </div>
                      <span className="text-sm font-bold text-ink">₹{(item.quantity * item.priceAtPurchase).toFixed(2)}</span>
                   </div>
                ))}
                {(!order.items || order.items.length === 0) && (
                   <div className="py-3 text-sm text-ink/50 italic">No items details available</div>
                )}
             </div>
          </div>
          
          <div className="pt-4 border-t border-ink/5 flex items-center justify-between mt-auto">
             <span className="text-xs font-bold text-ink/60 uppercase tracking-wider">Invoice Ref</span>
             <span className="font-mono text-xs text-ink/40">INV-{order.id.slice(0, 10).toUpperCase()}</span>
          </div>
        </div>
          
        </div>
      </div>
    </div>
  );
}
