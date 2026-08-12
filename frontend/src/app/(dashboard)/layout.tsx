"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  User,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/orders", label: "Orders", icon: Package },
  { href: "/orders/new", label: "New Order", icon: PlusCircle },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
      <aside
        className={`shrink-0 bg-ink text-paper flex flex-col transition-all duration-500 ease-in-out overflow-hidden ${
          sidebarOpen ? "w-64" : "w-16"
        }`}
      >
        <div className="px-4 py-5 border-b border-white/10 flex items-center justify-between">
          <span
            className={`font-display font-bold text-lg tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300 ${
              sidebarOpen ? "opacity-100 max-w-[160px]" : "opacity-0 max-w-0"
            }`}
          >
            Order Ops
          </span>
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-1.5 rounded-md text-paper/70 hover:bg-white/10 hover:text-paper transition-colors shrink-0"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? (
              <PanelLeftClose size={18} />
            ) : (
              <PanelLeftOpen size={18} />
            )}
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={!sidebarOpen ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-cobalt/20 text-white"
                    : "text-paper/70 hover:bg-white/5 hover:text-paper"
                }`}
              >
                <item.icon size={18} className="shrink-0" />
                <span
                  className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
                    sidebarOpen
                      ? "opacity-100 max-w-[160px]"
                      : "opacity-0 max-w-0"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <Link
            href="/account"
            title={!sidebarOpen ? "Account" : undefined}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              pathname === "/account"
                ? "bg-cobalt/20 text-white"
                : "text-paper/70 hover:bg-white/5 hover:text-paper"
            }`}
          >
            <User size={18} className="shrink-0" />
            <span
              className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
                sidebarOpen ? "opacity-100 max-w-[160px]" : "opacity-0 max-w-0"
              }`}
            >
              Account
            </span>
          </Link>
        </div>
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
