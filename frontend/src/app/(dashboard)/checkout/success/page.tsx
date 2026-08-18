"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="w-full max-w-2xl mx-auto py-20">
      <div className="bg-white rounded-[2rem] border border-ink/10 p-10 text-center shadow-sm flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-shipped/10 flex items-center justify-center mb-6 animate-[pulse_2s_infinite]">
          <CheckCircle2 size={40} className="text-shipped" />
        </div>
        
        <h1 className="text-3xl font-display font-bold text-ink mb-4">
          Payment Successful!
        </h1>
        
        <p className="text-ink/60 mb-8 max-w-md mx-auto leading-relaxed">
          Thank you for your purchase. Your payment has been processed successfully.
          {orderId && (
            <span className="block mt-2 font-mono text-xs text-ink/40 bg-paper py-2 px-4 rounded-lg">
              Order Ref: {orderId}
            </span>
          )}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {orderId ? (
            <Link 
              href={`/orders/${orderId}`}
              className="inline-flex items-center justify-center rounded-xl bg-ink text-white font-semibold px-8 py-3.5 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all group"
            >
              View Order Details
              <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <Link 
              href="/orders"
              className="inline-flex items-center justify-center rounded-xl bg-ink text-white font-semibold px-8 py-3.5 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              View My Orders
            </Link>
          )}
          
          <Link 
            href="/products"
            className="inline-flex items-center justify-center rounded-xl bg-white text-ink font-semibold px-8 py-3.5 border border-ink/10 hover:border-ink/20 shadow-sm hover:shadow-md transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
