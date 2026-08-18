"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { Cart } from "@/lib/types";
import { Trash2, ShoppingBag, ShoppingCart } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  function loadCart() {
    apiFetch("/cart")
      .then(setCart)
      .finally(() => setLoading(false));
  }

  useEffect(loadCart, []);

  async function updateQuantity(itemId: string, quantity: number) {
    try {
      const updated = await apiFetch(`/cart/items/${itemId}`, {
        method: "PUT",
        body: JSON.stringify({ quantity }),
      });
      setCart(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    }
  }

  async function removeItem(itemId: string) {
    const updated = await apiFetch(`/cart/items/${itemId}`, {
      method: "DELETE",
    });
    setCart(updated);
  }

  async function handleCheckout(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setCheckingOut(true);
    try {
      const data = await apiFetch("/orders/create", {
        method: "POST",
        body: JSON.stringify({ deliveryAddress: address }),
      });
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        router.push(`/orders/${data.orderId || data.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setCheckingOut(false);
    }
  }

  if (loading) return <p className="text-sm text-ink/50">Loading cart…</p>;

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="w-full max-w-5xl mx-auto pb-12">
      <h1 className="font-display text-2xl font-bold text-ink mb-6">Cart</h1>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-24 text-center overflow-hidden bg-white rounded-[2rem] border border-ink/10 shadow-sm relative w-full">
           {/* Animated Track/Road */}
           <div className="absolute bottom-[40%] w-full border-b-2 border-dashed border-ink/5"></div>
           
           {/* Running Trolley */}
           <div className="relative mb-8 w-full flex justify-center">
              <div className="animate-[cartRun_4s_linear_infinite] flex items-center relative z-10">
                 {/* Speed lines */}
                 <div className="absolute right-full mr-3 flex flex-col gap-1.5 opacity-40">
                    <div className="h-0.5 w-6 bg-ink/30 rounded-full animate-[wind_0.5s_linear_infinite]"></div>
                    <div className="h-0.5 w-4 bg-ink/30 rounded-full animate-[wind_0.5s_linear_infinite_0.2s]"></div>
                 </div>
                 <ShoppingCart size={56} className="text-ink/30 transform -rotate-12 animate-truck-bounce" strokeWidth={1.5} />
              </div>
           </div>
           
           <h3 className="text-2xl font-display font-bold text-ink mb-2 z-10">Your cart is empty</h3>
           <p className="text-sm text-ink/50 mb-8 z-10">Looks like you haven't added anything yet.</p>
           
           <Link href="/products" className="inline-flex items-center justify-center rounded-xl bg-ink text-white font-semibold px-6 py-3 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all z-10">
              Start Shopping
           </Link>

           <style dangerouslySetInnerHTML={{__html: `
             @keyframes cartRun {
               0% { transform: translateX(-50vw); }
               100% { transform: translateX(50vw); }
             }
             @keyframes wind {
               0% { transform: translateX(10px); opacity: 0; }
               50% { opacity: 1; }
               100% { transform: translateX(-10px); opacity: 0; }
             }
           `}} />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 w-full space-y-4">
            <h2 className="text-sm font-bold text-ink/40 uppercase tracking-wider mb-2">Your Items</h2>
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="bg-white rounded-[1.5rem] border border-ink/10 p-5 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-ink/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                  
                  <div className="flex-1">
                    <p className="text-lg font-display font-bold text-ink group-hover:text-cobalt transition-colors">
                      {item.productName}
                    </p>
                    <p className="text-sm text-ink/50 mt-1">
                      ₹{item.price.toFixed(2)} each
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
                    <div className="flex items-center border border-ink/10 rounded-xl overflow-hidden bg-paper">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="px-3 py-2 hover:bg-ink/5 text-ink/60 transition-colors"
                      >
                        -
                      </button>
                      <span className="px-4 py-2 text-sm font-semibold min-w-[2.5rem] text-center bg-white border-x border-ink/5">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-2 hover:bg-ink/5 text-ink/60 transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-ink min-w-[4rem] text-right">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl text-ink/30 hover:text-alert hover:bg-alert/10 transition-all"
                        title="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-80 shrink-0">
            <h2 className="text-sm font-bold text-ink/40 uppercase tracking-wider mb-2 lg:mb-4">Order Summary</h2>
            <div className="bg-white rounded-[1.5rem] border border-ink/10 p-6 shadow-sm sticky top-8">
              <div className="space-y-3 mb-6 pb-6 border-b border-ink/5">
                <div className="flex justify-between text-sm">
                  <span className="text-ink/60">Subtotal</span>
                  <span className="font-semibold text-ink">₹{cart.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink/60">Shipping</span>
                  <span className="font-semibold text-shipped">Calculated next</span>
                </div>
              </div>
              
              <div className="flex items-end justify-between mb-8">
                <span className="text-sm font-bold text-ink/80 uppercase">Total</span>
                <span className="text-3xl font-display font-bold text-ink text-transparent bg-clip-text bg-gradient-to-br from-ink to-ink/70">
                  ₹{cart.total.toFixed(2)}
                </span>
              </div>

              <form onSubmit={handleCheckout} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-ink/40 uppercase tracking-wider mb-2">
                    Delivery address
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street, city, state, country..."
                    className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-transparent resize-none transition-shadow"
                  />
                </div>
                {error && (
                  <div className="p-3 rounded-xl bg-alert/10 text-alert text-xs font-semibold border border-alert/20 flex items-center justify-between">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={checkingOut || cart.items.length === 0}
                  className="relative w-full flex items-center justify-center gap-2 rounded-xl text-sm font-semibold py-3.5 shadow-md shadow-ink/20 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 disabled:shadow-none overflow-hidden bg-ink text-white hover:bg-ink/90"
                >
                  {checkingOut ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <ShoppingBag size={18} />
                      Proceed to Checkout
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
