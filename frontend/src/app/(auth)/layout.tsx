"use client";

import { OrderJourney } from "../components/order-journey";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh w-full flex flex-col lg:flex-row">
      {/* Brand panel — full width + shorter on mobile/tablet, half width + full height on lg+ */}
      <div className="w-full lg:w-1/2 bg-ink relative overflow-hidden flex flex-col justify-between p-6 sm:p-8 lg:p-12">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #3654E0 0%, transparent 40%), radial-gradient(circle at 80% 80%, #1F9D6C 0%, transparent 40%)",
          }}
        />
        <span className="relative font-display font-bold text-lg sm:text-xl text-paper tracking-tight">
          Order Ops
        </span>

        <div className="relative">
          <OrderJourney demo />
        </div>

        {/* Copy: hidden on the smallest screens to keep the panel compact, shown from sm up */}
        <div className="relative hidden sm:block">
          <p className="font-display text-2xl lg:text-3xl font-bold text-paper leading-tight mb-3">
            Every order,
            <br />
            tracked end to end.
          </p>
          <p className="text-paper/60 text-sm max-w-sm">
            From checkout to confirmation — a live view of your order pipeline,
            backed by event-driven infrastructure.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 relative flex items-center justify-center px-4 py-12 bg-gradient-to-br from-cobalt/5 via-paper to-shipped/5 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#101828 1px, transparent 1px), linear-gradient(90deg, #101828 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}
