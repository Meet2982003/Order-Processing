"use client";

import { apiFetch } from "@/lib/api";
import { LayoutDashboard, Link, Package, PlusCircle, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const navItem = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/orders", label: "Orders", icon: Package },
  { href: "/orders/new", label: "New Order", icon: PlusCircle },
  { href: "/account", label: "Account", icon: User },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      router.replace("/login");
    } else {
      setChecked(true);
    }
  }, [router]);

  async function handleLogout() {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {
    } finally {
      sessionStorage.removeItem("token");
      router.push("/login");
    }
  }

  if (!checked) return null;

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 bg-ink text-paper flex flex-col">
        <div className="px-6 py-6 border-b border-white/10">
          <span className="font-display font-bold text-lg tracking-tight">
            Order Ops
          </span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItem.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex item-center gap-3 px-3 py-2 rounded-md text-sm text-paper/70 hover:bg-white/5 hover:text-paper transition-colors"
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-ink/10 flex item-center justify-between px-6">
          <span className="font-mono text-sm text-ink/50">
            Order Processing Platform
          </span>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-ink/80 hover:text-alert transition-colors"
          >
            Log out
          </button>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
