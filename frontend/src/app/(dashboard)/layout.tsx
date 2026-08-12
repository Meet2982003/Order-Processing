"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Package, PlusCircle, User } from "lucide-react";

const navItems = [
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
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) router.replace("/login");
    else setChecked(true);
  }, [router]);

  function handleLogout() {
    sessionStorage.removeItem("token");
    router.push("/login");
  }

  if (!checked) return null;

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 bg-ink text-paper flex flex-col">
        <div className="px-6 py-5 border-b border-white/10">
          <span className="font-display font-bold text-lg tracking-tight">
            Order Ops
          </span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-cobalt/20 text-white"
                    : "text-paper/70 hover:bg-white/5 hover:text-paper"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-ink/10 flex items-center justify-between px-6">
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
