"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { Product } from "@/lib/types";
import { ShoppingCart, Package, Plus, Check } from "lucide-react";
import Link from "next/link";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    apiFetch("/products")
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  async function handleAddToCart(productId: string) {
    setAddingId(productId);
    setErrorMsg(null);
    try {
      await apiFetch("/cart/items", {
        method: "POST",
        body: JSON.stringify({ productId, quantity: quantities[productId] || 1 }),
      });
      setSuccessId(productId);
      setTimeout(() => setSuccessId(null), 2000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to add item to cart");
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setAddingId(null);
    }
  }

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="w-8 h-8 border-4 border-cobalt border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink tracking-tight">Products</h1>
          <p className="text-ink/60 text-sm mt-1">Browse our catalog and add items to your cart.</p>
        </div>
        <div className="flex items-center gap-3">
           <Link href="/cart" className="inline-flex items-center justify-center rounded-xl bg-white text-ink font-semibold px-5 py-2.5 shadow-sm hover:shadow-md transition-all text-sm border border-ink/10">
             <ShoppingCart size={16} className="mr-2" />
             View Cart
           </Link>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-alert/10 text-alert text-sm font-semibold border border-alert/20 flex items-center justify-between animate-[fadeIn_0.3s_ease-out]">
          {errorMsg}
          <button onClick={() => setErrorMsg(null)} className="text-alert/70 hover:text-alert font-bold">×</button>
        </div>
      )}

      {products.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-ink/10 p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[300px]">
           <div className="w-20 h-20 rounded-full bg-paper flex items-center justify-center mb-6">
              <Package size={32} className="text-ink/30" />
           </div>
           <h3 className="text-xl font-display font-bold text-ink mb-2">No products available</h3>
           <p className="text-sm text-ink/50 mb-8 max-w-sm">Our catalog is currently empty. Please check back later when we've restocked.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {products.map((product) => {
            const isAdding = addingId === product.id;
            const isSuccess = successId === product.id;
            const isOut = product.stock === 0;

            return (
              <div
                key={product.id}
                className="bg-white rounded-[1.5rem] border border-ink/10 p-6 flex flex-col shadow-sm hover:shadow-md transition-all duration-300 hover:border-ink/20 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-ink/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-cobalt/10 text-[10px] font-bold text-cobalt uppercase tracking-wider mb-4 w-fit">
                  {product.category}
                </span>
                
                <h3 className="text-lg font-display font-bold text-ink mb-2 leading-tight group-hover:text-cobalt transition-colors">{product.name}</h3>
                
                <p className="text-sm text-ink/60 mb-6 flex-1 line-clamp-3">
                  {product.description}
                </p>
                
                <div className="flex flex-col gap-4 mt-auto pt-4 border-t border-ink/5">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs font-bold text-ink/40 uppercase tracking-wider mb-0.5">Price</p>
                      <span className="text-2xl font-bold text-ink">
                        ₹{product.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-md ${isOut ? 'bg-alert/10 text-alert' : 'bg-shipped/10 text-shipped'}`}>
                        {isOut ? 'Out of stock' : `${product.stock} in stock`}
                      </span>
                      {!isOut && (
                        <div className="flex items-center border border-ink/10 rounded-lg overflow-hidden">
                          <button
                            disabled={isAdding || isSuccess}
                            onClick={() => setQuantities(prev => ({ ...prev, [product.id]: Math.max(1, (prev[product.id] || 1) - 1) }))}
                            className="px-2 py-1 bg-paper hover:bg-ink/5 text-ink/60 transition-colors"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 text-sm font-semibold min-w-[2rem] text-center">
                            {quantities[product.id] || 1}
                          </span>
                          <button
                            disabled={isAdding || isSuccess || (quantities[product.id] || 1) >= product.stock}
                            onClick={() => setQuantities(prev => ({ ...prev, [product.id]: Math.min(product.stock, (prev[product.id] || 1) + 1) }))}
                            className="px-2 py-1 bg-paper hover:bg-ink/5 text-ink/60 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    disabled={isAdding || isOut || isSuccess}
                    className={`relative w-full flex items-center justify-center gap-2 rounded-xl text-sm font-semibold py-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 disabled:shadow-none overflow-hidden ${
                      isSuccess 
                        ? "bg-shipped text-white"
                        : "bg-ink text-white hover:bg-ink/90"
                    }`}
                  >
                    {isSuccess ? (
                      <>
                        <Check size={16} />
                        Added to cart
                      </>
                    ) : isAdding ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : isOut ? (
                      "Out of stock"
                    ) : (
                      <>
                        <Plus size={16} />
                        Add to cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
