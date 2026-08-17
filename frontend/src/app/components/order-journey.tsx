"use client";

import {
  generateRandomRoute,
  getRouteBetween,
  LatLng,
} from "@/lib/random-route";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useCallback } from "react";

const OrderJourneyMap = dynamic(() => import("./OrderJourneyMap"), {
  ssr: false,
});

interface OrderJourneyProps {
  status?: string;
  demo?: boolean;
  pickup?: LatLng;
  delivery?: LatLng;
  className?: string;
  mapClassName?: string;
}

const TRAVEL_MS = 26000;
const PAUSE_MS = 2800;
const START_DELAY_MS = 4500;

// maps a real order status to a fixed point along the route (0 = pickup, 1 = delivered)
const STATUS_PROGRESS: Record<string, number> = {
  CREATED: 0,
  PAID: 0.15,
  SHIPPED: 0.55,
  DELIVERED: 1,
};

type Phase = "loading" | "waiting" | "traveling" | "paused";

export function OrderJourney({
  status,
  demo = false,
  pickup,
  delivery,
  className,
  mapClassName,
}: OrderJourneyProps) {
  const [route, setRoute] = useState<LatLng[] | null>(null);
  const [zoom, setZoom] = useState(13);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<Phase>("loading");
  const [mapReady, setMapReady] = useState(false);

  const rafRef = useRef<number>(null);
  const travelStartRef = useRef<number>(0);
  const waitTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const loadRoute = useCallback(async () => {
    const { route, zoom } = await generateRandomRoute();
    setRoute(route);
    setZoom(zoom);
  }, []);

  // ---- REAL MODE: cancelled orders don't get a route at all ----
  if (!demo && status === "CANCELLED") {
    return (
      <div className={`${mapClassName || "h-48 sm:h-56 lg:h-72"} rounded-2xl bg-ink border border-paper/10 flex flex-col items-center justify-center gap-2`}>
        <span className="text-alert font-mono text-xs tracking-wide">
          STATUS: CANCELLED
        </span>
        <span className="text-paper/40 text-xs">
          This order will not be delivered
        </span>
      </div>
    );
  }

  // ---- REAL MODE: load a route once, then just sit at the point matching status ----
  useEffect(() => {
    if (demo || route || !pickup || !delivery) return;
    let cancelled = false;
    getRouteBetween(pickup, delivery).then((r) => {
      if (!cancelled) setRoute(r);
    });
    return () => {
      cancelled = true;
    };
  }, [demo, route, pickup, delivery]);

  useEffect(() => {
    if (demo) return;
    const target = status ? (STATUS_PROGRESS[status] ?? 0) : 0;
    setProgress(target);
  }, [demo, status]);

  // ---- DEMO MODE: unchanged from before ----
  useEffect(() => {
    if (!demo) return;
    let cancelled = false;
    loadRoute().then(() => {
      if (!cancelled) setPhase("loading");
    });
    return () => {
      cancelled = true;
    };
  }, [demo, loadRoute]);

  useEffect(() => {
    if (!demo || !route || !mapReady) return;
    if (phase !== "loading") return;

    setPhase("waiting");
    waitTimeoutRef.current = setTimeout(() => {
      setPhase("traveling");
      travelStartRef.current = performance.now();
    }, START_DELAY_MS);

    return () => {
      if (waitTimeoutRef.current) clearTimeout(waitTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, route, mapReady]);

  useEffect(() => {
    if (!demo || phase !== "traveling" || !route) return;

    const tick = (now: number) => {
      const elapsed = now - travelStartRef.current;
      const t = Math.min(elapsed / TRAVEL_MS, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setProgress(eased);

      if (t >= 1) {
        setPhase("paused");
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [demo, phase, route]);

  useEffect(() => {
    if (!demo || phase !== "paused") return;

    let cancelled = false;
    const pauseStart = performance.now();
    const nextRoutePromise = generateRandomRoute();

    const finishPause = async () => {
      const elapsedSincePause = performance.now() - pauseStart;
      const remaining = Math.max(PAUSE_MS - elapsedSincePause, 0);
      const { route: nextRoute, zoom: nextZoom } = await nextRoutePromise;
      if (cancelled) return;

      setTimeout(() => {
        if (cancelled) return;
        setMapReady(false);
        setProgress(0);
        setRoute(nextRoute);
        setZoom(nextZoom);
        setPhase("loading");
      }, remaining);
    };

    finishPause();
    return () => {
      cancelled = true;
    };
  }, [demo, phase]);

  const currentLabel = demo
    ? phase === "loading" || phase === "waiting"
      ? "Preparing"
      : phase === "paused"
        ? "Delivered"
        : "In transit"
    : (status ?? "Unknown");

  const showSkeleton = demo
    ? phase === "loading" || !route || !mapReady
    : !route || !mapReady;

  return (
    <div className={`relative ${className ?? ""}`}>
      {!showSkeleton && (
        <div className="absolute top-3 left-3 z-[1000] font-mono text-xs text-shipped bg-ink/80 px-2 py-1 rounded">
          STATUS: {currentLabel.toUpperCase()}
        </div>
      )}

      {showSkeleton && (
        <div className={`${mapClassName || "h-48 sm:h-56 lg:h-72"} rounded-2xl bg-ink border border-paper/10 flex items-center justify-center`}>
          <span className="text-paper/40 text-xs font-mono animate-pulse">
            plotting route…
          </span>
        </div>
      )}

      {route && (
        <div className={showSkeleton ? "hidden" : "h-full w-full"}>
          <OrderJourneyMap
            route={route}
            zoom={zoom}
            progress={progress}
            onReady={() => setMapReady(true)}
            mapClassName={mapClassName}
          />
        </div>
      )}
    </div>
  );
}
