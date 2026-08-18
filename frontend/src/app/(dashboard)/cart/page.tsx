"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { Cart } from "@/lib/types";
import { Trash2, ShoppingBag, ShoppingCart, ShieldCheck, CreditCard, ChevronRight, Package, ArrowRight } from "lucide-react";
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

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="w-8 h-8 border-4 border-cobalt border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const isEmpty = !cart || cart.items.length === 0;

  // Generate a consistent vibrant gradient based on product name length
  const getGradient = (name: string) => {
    const gradients = [
      'from-blue-500 to-indigo-600',
      'from-emerald-400 to-teal-600',
      'from-amber-400 to-orange-500',
      'from-rose-400 to-red-600',
      'from-purple-500 to-fuchsia-600'
    ];
    return gradients[name.length % gradients.length];
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-20 space-y-10">
      
      {/* Clean, Elegant Header */}
      <div className="flex items-end justify-between border-b border-ink/10 pb-6">
         <div>
            <div className="flex items-center gap-2 text-ink/50 text-sm font-semibold mb-2 uppercase tracking-widest">
               <Link href="/products" className="hover:text-ink transition-colors">Shop</Link>
               <ChevronRight size={14} />
               <span>Checkout</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-ink tracking-tight">
               Your Cart
            </h1>
         </div>
         {!isEmpty && (
           <div className="hidden sm:flex items-center gap-2 bg-white border border-ink/10 px-4 py-2 rounded-full text-sm font-bold text-ink/70 shadow-sm">
              <ShoppingBag size={16} />
              <span>{cart.items.reduce((acc, item) => acc + item.quantity, 0)} Items</span>
           </div>
         )}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-[2rem] border border-ink/5 shadow-sm">
           <div className="w-24 h-24 rounded-full bg-paper flex items-center justify-center mb-6">
              <ShoppingCart size={40} className="text-ink/20" />
           </div>
           <h3 className="text-2xl font-display font-bold text-ink mb-2">Your cart is empty</h3>
           <p className="text-sm text-ink/50 mb-8 max-w-sm">Looks like you haven't added anything yet. Discover our premium selection of products.</p>
           <Link href="/products" className="inline-flex items-center gap-2 rounded-full bg-ink text-white font-bold px-8 py-4 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
              <ShoppingBag size={18} /> Start Shopping
           </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Cart Items List */}
          <div className="flex-1 w-full">
            <div className="bg-white rounded-[2rem] border border-ink/10 shadow-sm overflow-hidden">
               {/* List Header */}
               <div className="hidden sm:grid grid-cols-12 gap-4 p-6 border-b border-ink/5 bg-paper/50 text-xs font-bold text-ink/40 uppercase tracking-wider">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-3 text-center">Quantity</div>
                  <div className="col-span-3 text-right">Total</div>
               </div>

               <div className="divide-y divide-ink/5">
                 {cart.items.map((item) => (
                   <div key={item.id} className="p-6 flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-6 hover:bg-paper/30 transition-colors">
                     
                     {/* Product Info */}
                     <div className="col-span-6 flex items-center gap-5">
                       {/* Vibrant Thumbnail */}
                       <div className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center text-2xl font-display font-bold text-white shadow-inner bg-gradient-to-br ${getGradient(item.productName)}`}>
                          {item.productName.charAt(0).toUpperCase()}
                       </div>
                       
                       <div>
                         <Link href="/products" className="text-lg font-bold text-ink hover:text-cobalt transition-colors line-clamp-1">
                           {item.productName}
                         </Link>
                         <p className="text-sm font-semibold text-ink/50 mt-0.5">
                           ₹{item.price.toFixed(2)}
                         </p>
                       </div>
                     </div>

                     {/* Quantity Selector */}
                     <div className="col-span-3 flex justify-start sm:justify-center">
                       <div className="flex items-center border border-ink/10 rounded-full overflow-hidden bg-white shadow-sm">
                         <button
                           onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                           className="w-8 h-8 flex items-center justify-center hover:bg-ink/5 text-ink/60 transition-colors"
                         >
                           -
                         </button>
                         <span className="w-10 h-8 flex items-center justify-center text-sm font-bold bg-paper/50">
                           {item.quantity}
                         </span>
                         <button
                           onClick={() => updateQuantity(item.id, item.quantity + 1)}
                           className="w-8 h-8 flex items-center justify-center hover:bg-ink/5 text-ink/60 transition-colors"
                         >
                           +
                         </button>
                       </div>
                     </div>

                     {/* Price & Remove */}
                     <div className="col-span-3 flex items-center justify-between sm:justify-end gap-4">
                       <div className="text-right">
                          <p className="text-lg font-bold text-ink">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                       </div>
                       
                       <button
                         onClick={() => removeItem(item.id)}
                         className="w-8 h-8 flex items-center justify-center rounded-full text-ink/30 hover:text-alert hover:bg-alert/10 transition-all border border-transparent hover:border-alert/20"
                         title="Remove item"
                       >
                         <Trash2 size={16} />
                       </button>
                     </div>
                     
                   </div>
                 ))}
               </div>
            </div>
          </div>

          {/* Checkout Summary */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="bg-ink rounded-[2rem] p-8 shadow-xl text-white sticky top-8 relative overflow-hidden">
              {/* Decorative subtle gradient */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

              <h2 className="text-xl font-display font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 pb-6 border-b border-white/10">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60 font-medium">Subtotal</span>
                  <span className="font-bold">₹{cart.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60 font-medium">Taxes</span>
                  <span className="font-medium text-white/40">Calculated next</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60 font-medium">Shipping</span>
                  <span className="font-bold text-white flex items-center gap-1">Free</span>
                </div>
              </div>
              
              <div className="flex items-end justify-between mb-8">
                <span className="text-sm font-bold text-white/50 uppercase tracking-wider">Total</span>
                <span className="text-4xl font-display font-bold text-white">
                  ₹{cart.total.toFixed(2)}
                </span>
              </div>

              <form onSubmit={handleCheckout} className="space-y-5 relative z-10">
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
                    Delivery address
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter full street address, city, state..."
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 resize-none transition-all placeholder:text-white/20"
                  />
                </div>
                {error && (
                  <div className="p-3 rounded-xl bg-alert/20 text-red-200 text-sm font-semibold border border-alert/30">
                    {error}
                  </div>
                )}
                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={checkingOut || cart.items.length === 0}
                    className="relative w-full flex items-center justify-center gap-3 rounded-full text-sm font-bold py-4 shadow-xl hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0 disabled:shadow-none bg-white text-ink overflow-hidden group"
                  >
                    {checkingOut ? (
                      <div className="w-5 h-5 border-2 border-ink/30 border-t-ink rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <CreditCard size={18} className="group-hover:scale-110 transition-transform" />
                        Checkout via Stripe
                        <ArrowRight size={16} className="absolute right-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                      </>
                    )}
                  </button>
                </div>
              </form>
              
              {/* Trust Badges */}
              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-6">
                 <div className="flex flex-col items-center gap-2 text-white/40">
                    <ShieldCheck size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-center leading-tight">Secure<br/>Checkout</span>
                 </div>
                 <div className="w-px h-8 bg-white/5"></div>
                 <div className="flex flex-col items-center gap-2 text-white/40">
                    <Package size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-center leading-tight">Fast<br/>Delivery</span>
                 </div>
              </div>
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
