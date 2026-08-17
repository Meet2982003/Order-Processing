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
      const order = await apiFetch("/orders/create", {
        method: "POST",
        body: JSON.stringify({ deliveryAddress: address }),
      });
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setCheckingOut(false);
    }
  }

  if (loading) return <p className="text-sm text-ink/50">Loading cart…</p>;

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="max-w-2xl">
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
        <>
          <div className="bg-white rounded-2xl border border-ink/10 divide-y divide-ink/5 mb-6">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink">
                    {item.productName}
                  </p>
                  <p className="text-xs text-ink/40 font-mono">
                    ₹{item.price.toFixed(2)} each
                  </p>
                </div>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(item.id, Number(e.target.value))
                  }
                  className="w-16 rounded-lg border border-ink/15 px-2 py-1.5 text-sm text-center"
                />
                <span className="text-sm font-semibold text-ink w-20 text-right">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-ink/30 hover:text-alert transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mb-6 px-1">
            <span className="text-sm font-medium text-ink/60">Total</span>
            <span className="text-xl font-bold text-ink">
              ₹{cart.total.toFixed(2)}
            </span>
          </div>

          <form
            onSubmit={handleCheckout}
            className="bg-white rounded-2xl border border-ink/10 p-6 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                Delivery address
              </label>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, city, state, country"
                className="w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-transparent resize-none"
              />
            </div>
            {error && <p className="text-sm text-alert">{error}</p>}
            <button
              type="submit"
              disabled={checkingOut}
              className="w-full rounded-lg bg-ink text-white text-sm font-semibold py-2.5 shadow-md shadow-ink/25 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
            >
              {checkingOut
                ? "Placing order…"
                : `Checkout — ₹${cart.total.toFixed(2)}`}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
