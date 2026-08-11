export type LatLng = [number, number];

const OSRM = "https://router.project-osrm.org";

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

async function snapToRoad(lat: number, lng: number): Promise<LatLng | null> {
  try {
    const res = await fetch(`${OSRM}/nearest/v1/driving/${lng},${lat}?number=1`);
    if (!res.ok) return null;
    const data = await res.json();
    const wp = data?.waypoints?.[0];
    if (!wp) return null;
    if (wp.distance > 3000) return null;
    const [snapLng, snapLat] = wp.location;
    return [snapLat, snapLng];
  } catch {
    return null;
  }
}

async function findRandomLandPoint(maxAttempts = 25): Promise<LatLng | null> {
  for (let i = 0; i < maxAttempts; i++) {
    const lat = randomInRange(-55, 70);
    const lng = randomInRange(-180, 180);
    const snapped = await snapToRoad(lat, lng);
    if (snapped) return snapped;
  }
  return null;
}

function offsetPoint([lat, lng]: LatLng, km: number, bearingDeg: number): LatLng {
  const R = 6371;
  const brng = (bearingDeg * Math.PI) / 180;
  const lat1 = (lat * Math.PI) / 180;
  const lng1 = (lng * Math.PI) / 180;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(km / R) + Math.cos(lat1) * Math.sin(km / R) * Math.cos(brng)
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(km / R) * Math.cos(lat1),
      Math.cos(km / R) - Math.sin(lat1) * Math.sin(lat2)
    );
  return [(lat2 * 180) / Math.PI, (lng2 * 180) / Math.PI];
}
function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const [lat1, lon1] = a.map((d) => (d * Math.PI) / 180);
  const [lat2, lon2] = b.map((d) => (d * Math.PI) / 180);
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

// Precompute cumulative distance at each point, so we can later find
// "the point that is X% of the way along the route BY DISTANCE"
// instead of "the Nth point out of however many points there are."
export function buildCumulativeDistances(route: LatLng[]): number[] {
  const cum = [0];
  for (let i = 1; i < route.length; i++) {
    cum.push(cum[i - 1] + haversineKm(route[i - 1], route[i]));
  }
  return cum;
}

async function fetchRoadRoute(a: LatLng, b: LatLng): Promise<LatLng[] | null> {
  try {
    const url = `${OSRM}/route/v1/driving/${a[1]},${a[0]};${b[1]},${b[0]}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const coords = data?.routes?.[0]?.geometry?.coordinates as [number, number][] | undefined;
    if (!coords || coords.length < 2) return null;
    return coords.map(([lng, lat]) => [lat, lng] as LatLng);
  } catch {
    return null;
  }
}

export async function generateRandomRoute(): Promise<{ route: LatLng[]; zoom: number }> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const pickup = await findRandomLandPoint();
    if (!pickup) continue;

    const distanceKm = randomInRange(3, 20);
    const bearingDeg = randomInRange(0, 360);
    const roughDelivery = offsetPoint(pickup, distanceKm, bearingDeg);
    const delivery = await snapToRoad(roughDelivery[0], roughDelivery[1]);
    if (!delivery) continue;

    const route = await fetchRoadRoute(pickup, delivery);
    if (route) return { route, zoom: distanceKm > 12 ? 12 : 13 };
  }

  return {
    route: [
      [48.8566, 2.3522],
      [48.86, 2.34],
      [48.865, 2.36],
    ],
    zoom: 13,
  };
}