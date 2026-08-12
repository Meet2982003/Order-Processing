"use client";

import { Fragment, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLng } from "../../lib/random-route";
import { useEffect } from "react";
import { buildCumulativeDistances } from "@/lib/random-route";

function bearingBetween(a: LatLng, b: LatLng) {
  const [lat1, lon1] = a.map((d) => (d * Math.PI) / 180);
  const [lat2, lon2] = b.map((d) => (d * Math.PI) / 180);
  const dLon = lon2 - lon1;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

function interpolate(a: LatLng, b: LatLng, t: number): LatLng {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

function pointAtProgressByDistance(
  route: LatLng[],
  cumDist: number[],
  progress: number,
) {
  const totalDist = cumDist[cumDist.length - 1];
  const targetDist = Math.min(Math.max(progress, 0), 1) * totalDist;

  // find the segment whose distance range contains targetDist
  let seg = 0;
  while (seg < cumDist.length - 2 && cumDist[seg + 1] < targetDist) {
    seg++;
  }

  const segStart = cumDist[seg];
  const segEnd = cumDist[seg + 1];
  const segLen = segEnd - segStart;
  const localT = segLen > 0 ? (targetDist - segStart) / segLen : 0;

  const a = route[seg];
  const b = route[seg + 1];
  return { pos: interpolate(a, b, localT), angle: bearingBetween(a, b) };
}

function truckIcon(angle: number) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width: 36px; height: 36px; border-radius: 10px;
      background: #6366f1; display:flex; align-items:center; justify-content:center;
      box-shadow: 0 4px 14px rgba(99,102,241,0.6);
      transform: rotate(${angle}deg);
      border: 2px solid white;
    ">
      <div style="transform: rotate(${-angle}deg); font-size:16px; line-height:1;">🚚</div>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function stopIcon(icon: string, color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width: 28px; height: 28px; border-radius: 999px;
      background: #0f0f14; border: 2px solid ${color};
      display:flex; align-items:center; justify-content:center;
      font-size: 13px;
    ">${icon}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function labelIcon(text: string, color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="
      font-family: monospace; font-size: 10px; color: ${color};
      background: rgba(15,15,20,0.85); padding: 2px 6px; border-radius: 4px;
      white-space: nowrap; transform: translateY(6px);
    ">${text}</div>`,
    iconSize: [0, 0],
    iconAnchor: [-16, -10],
  });
}

function MapPanner({ pos }: { pos: LatLng }) {
  const map = useMap();
  useEffect(() => {
    map.panTo(pos, { animate: true, duration: 0.3 });
  }, [pos, map]);
  return null;
}

interface OrderJourneyMapProps {
  route: LatLng[];
  zoom: number;
  progress: number;
  /** fires once Leaflet has actually painted tiles, so the parent can fade this in */
  onReady?: () => void;
}

function MapSizeFixer() {
  const map = useMap();

  useEffect(() => {
    // fire once immediately after mount, after the browser has painted
    const raf = requestAnimationFrame(() => {
      map.invalidateSize();
    });

    // and keep watching the actual container element in case layout
    // settles even later (fonts, responsive breakpoints, etc.)
    const container = map.getContainer();
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [map]);

  return null;
}
export default function OrderJourneyMap({
  route,
  zoom,
  progress,
  onReady,
}: OrderJourneyMapProps) {
  const [tilesLoaded, setTilesLoaded] = useState(false);

  const cumDist = useMemo(() => buildCumulativeDistances(route), [route]);

  const stops = useMemo(
    () => [
      { pos: route[0], label: "Pickup", icon: "📦", color: "#a3a3a3" },
      {
        pos: route[Math.floor(route.length / 2)],
        label: "In transit",
        icon: "🚚",
        color: "#6366f1",
      },
      {
        pos: route[route.length - 1],
        label: "Delivered",
        icon: "🏠",
        color: "#10b981",
      },
    ],
    [route],
  );

  const { pos, angle } = useMemo(
    () => pointAtProgressByDistance(route, cumDist, progress),
    [route, cumDist, progress],
  );
  const icon = useMemo(() => truckIcon(angle), [angle]);
  const center = route[Math.floor(route.length / 2)];

  return (
    <div
      className={`relative h-48 sm:h-56 lg:h-72 rounded-2xl overflow-hidden border border-paper/10 transition-opacity duration-500 ${
        tilesLoaded ? "opacity-100" : "opacity-0"
      }`}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        zoomControl={false}
        dragging={false}
        style={{ height: "100%", width: "100%", background: "#0f0f14" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
          eventHandlers={{
            load: () => {
              setTilesLoaded(true);
              onReady?.();
            },
          }}
        />
        <Polyline
          positions={route}
          pathOptions={{ color: "#6366f1", weight: 4, opacity: 0.85 }}
        />

        {stops.map((stop) => (
          <Fragment key={stop.label}>
            <Marker
              position={stop.pos}
              icon={stopIcon(stop.icon, stop.color)}
            />
            <Marker
              position={stop.pos}
              icon={labelIcon(stop.label, stop.color)}
              interactive={false}
            />
          </Fragment>
        ))}

        <Marker position={pos} icon={icon} />
        <MapPanner pos={pos} />
        <MapSizeFixer />
      </MapContainer>
    </div>
  );
}
