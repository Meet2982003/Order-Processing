"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { Product } from "@/lib/types";
import { ShoppingCart, Package } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    apiFetch("/products")
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  async function handleAddToCart(productId: string) {
    setAddingId(productId);
    setMessage("");
    try {
      await apiFetch("/cart/items", {
        method: "POST",
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      setMessage("Added to cart");
      setTimeout(() => setMessage(""), 1500);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to add");
    } finally {
      setAddingId(null);
    }
  }

  if (loading) return <p className="text-sm text-ink/50">Loading products…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Products</h1>
        {message && <span className="text-sm text-shipped">{message}</span>}
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-full bg-ink/5 flex items-center justify-center mb-3">
            <Package size={20} className="text-ink/40" />
          </div>
          <p className="text-sm text-ink/50">No products available</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-ink/10 p-5 flex flex-col"
            >
              <span className="text-xs font-mono text-cobalt mb-2">
                {product.category}
              </span>
              <h3 className="font-semibold text-ink mb-1">{product.name}</h3>
              <p className="text-sm text-ink/50 mb-4 flex-1">
                {product.description}
              </p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-lg font-bold text-ink">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-xs text-ink/40">
                  {product.stock} in stock
                </span>
              </div>
              <button
                onClick={() => handleAddToCart(product.id)}
                disabled={addingId === product.id || product.stock === 0}
                className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cobalt to-cobalt-dark text-white text-sm font-semibold py-2 shadow-md shadow-cobalt/25 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
              >
                <ShoppingCart size={15} />
                {addingId === product.id
                  ? "Adding…"
                  : product.stock === 0
                    ? "Out of stock"
                    : "Add to cart"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
