import type { RouteConfig } from "./routeTypes";
import type { LiveRouteResult } from "./liveRouteTypes";
import { fetchLiveDrivingRouteORS } from "./openRouteService";

export type { LiveRouteResult };

const PHOTON = "https://photon.komoot.io/api/";
const OSRM = "https://router.project-osrm.org/route/v1/driving";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Geocode a place in India using Photon (Komoot). */
export async function geocodePhoton(query: string): Promise<[number, number] | null> {
  const q = `${query.trim()}, India`;
  const url = `${PHOTON}?q=${encodeURIComponent(q)}&limit=1&lang=en`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as {
    features?: { geometry?: { coordinates?: [number, number] } }[];
  };
  const c = data.features?.[0]?.geometry?.coordinates;
  if (!c || c.length < 2) return null;
  return [c[0], c[1]];
}

/**
 * Photon geocoding + OSRM public demo (no API key).
 * Fair-use only; rate limits apply.
 */
async function fetchLiveDrivingPhotonOsrm(config: RouteConfig): Promise<LiveRouteResult | null> {
  const stops = config.stops.map((s) => s.trim()).filter(Boolean);
  const labels = [config.source.trim(), ...stops, config.destination.trim()].filter(Boolean);
  if (labels.length < 2) return null;

  const coords: [number, number][] = [];
  for (let i = 0; i < labels.length; i++) {
    const g = await geocodePhoton(labels[i]);
    if (!g) return null;
    coords.push(g);
    if (i < labels.length - 1) await sleep(350);
  }

  const path = coords.map(([lon, lat]) => `${lon},${lat}`).join(";");
  const url = `${OSRM}/${path}?overview=full&geometries=geojson&steps=false`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as {
    code?: string;
    routes?: { distance: number; duration: number; geometry?: { coordinates?: [number, number][] } }[];
  };

  if (data.code !== "Ok" || !data.routes?.[0]) return null;

  const route = data.routes[0];
  const geom = route.geometry?.coordinates;
  if (!geom?.length) return null;

  const polylineLatLng: [number, number][] = geom.map(([lon, lat]) => [lat, lon]);
  const distanceKm = route.distance / 1000;
  const durationSec = route.duration;
  const waypointLatLng: [number, number][] = coords.map(([lon, lat]) => [lat, lon]);

  return {
    distanceKm: Math.round(distanceKm * 10) / 10,
    durationSec,
    polylineLatLng,
    waypointLabels: labels,
    waypointLatLng,
    provider: "photon_osrm",
  };
}

/**
 * 1) OpenRouteService if API key set (falls back to Photon+OSRM on failure).
 * 2) Else Photon + public OSRM.
 */
export async function fetchLiveDrivingRoute(config: RouteConfig): Promise<LiveRouteResult | null> {
  const orsKey = (import.meta.env.VITE_OPENROUTESERVICE_API_KEY as string | undefined)?.trim();
  if (orsKey) {
    const fromOrs = await fetchLiveDrivingRouteORS(config, orsKey);
    if (fromOrs) return { ...fromOrs, provider: "openrouteservice" };
  }
  return fetchLiveDrivingPhotonOsrm(config);
}
