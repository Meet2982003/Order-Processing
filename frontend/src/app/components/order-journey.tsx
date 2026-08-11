"use client";

import { generateRandomRoute, LatLng } from "@/lib/random-route";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useCallback } from "react";

const OrderJourneyMap = dynamic(() => import("./OrderJourneyMap"), {
  ssr: false,
});

interface OrderJourneyProps {
  status?: string;
  demo?: boolean;
  className?: string;
}

const TRAVEL_MS = 26000; // slower drive
const PAUSE_MS = 2800; // hold at delivery
const START_DELAY_MS = 4500; // wait after map is actually visible, before truck moves

type Phase = "loading" | "waiting" | "traveling" | "paused";

export function OrderJourney({
  status,
  demo = false,
  className,
}: OrderJourneyProps) {
  const [route, setRoute] = useState<LatLng[] | null>(null);
  const [zoom, setZoom] = useState(13);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<Phase>("loading");
  const [mapReady, setMapReady] = useState(false);

  const rafRef = useRef<number>();
  const travelStartRef = useRef<number>(0);
  const waitTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const loadRoute = useCallback(async () => {
    const { route, zoom } = await generateRandomRoute();
    setRoute(route);
    setZoom(zoom);
  }, []);

  // initial route load
  useEffect(() => {
    if (!demo) return;
    let cancelled = false;
    loadRoute().then(() => {
      if (!cancelled) setPhase("loading"); // stays "loading" until mapReady fires too
    });
    return () => {
      cancelled = true;
    };
  }, [demo, loadRoute]);

  // once BOTH the route exists and Leaflet has actually painted tiles,
  // wait a fixed grace period before the truck starts moving
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
    // intentionally omitting `phase` — including it causes this effect to
    // re-run (and cancel its own timeout) the moment it calls setPhase("waiting")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, route, mapReady]);

  // travel animation
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

  // pause -> fetch a NEW route in the background -> reset to loading state
  // (which re-triggers the mapReady + start-delay flow above for the new city)
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
        setMapReady(false); // new city's tiles need to load fresh
        setProgress(0);
        setRoute(nextRoute);
        setZoom(nextZoom);
        setPhase("loading"); // re-enters loading -> waiting -> traveling flow
      }, remaining);
    };

    finishPause();
    return () => {
      cancelled = true;
    };
  }, [demo, phase]);

  const currentLabel =
    phase === "loading" || phase === "waiting"
      ? "Preparing"
      : phase === "paused"
        ? "Delivered"
        : "In transit";

  if (!demo) {
    return null; // unchanged — wire up real status-driven mode as before
  }

  const showSkeleton = phase === "loading" || !route || !mapReady;

  return (
    <div className={`relative ${className ?? ""}`}>
      {!showSkeleton && (
        <div className="absolute top-3 left-3 z-[1000] font-mono text-xs text-shipped bg-ink/80 px-2 py-1 rounded">
          STATUS: {currentLabel.toUpperCase()}
        </div>
      )}

      {showSkeleton && (
        <div className="h-48 sm:h-56 lg:h-72 rounded-2xl bg-ink border border-paper/10 flex items-center justify-center">
          <span className="text-paper/40 text-xs font-mono animate-pulse">
            plotting route…
          </span>
        </div>
      )}

      {route && (
        <div className={showSkeleton ? "hidden" : ""}>
          <OrderJourneyMap
            route={route}
            zoom={zoom}
            progress={progress}
            onReady={() => setMapReady(true)}
          />
        </div>
      )}
    </div>
  );
}
