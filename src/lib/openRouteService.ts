/**
 * OpenRouteService (openrouteservice.org) — real driving directions & geocoding.
 * OpenRouteService maps API (not Gemini). Uses VITE_OPENROUTESERVICE_API_KEY.
 */

import type { RouteConfig } from "./routeTypes";
import type { LiveRouteResult } from "./liveRouteTypes";
import { polylineLengthKm } from "./geoUtils";

const ORS_BASE = "https://api.openrouteservice.org";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function geocodeORS(query: string, apiKey: string): Promise<[number, number] | null> {
  const url = new URL(`${ORS_BASE}/geocode/search`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("text", `${query.trim()}, India`);
  url.searchParams.set("boundary.country", "IN");
  url.searchParams.set("size", "1");
  const res = await fetch(url.toString());
  if (!res.ok) return null;
  const data = (await res.json()) as {
    features?: { geometry?: { coordinates?: [number, number] } }[];
  };
  const c = data.features?.[0]?.geometry?.coordinates;
  if (!c || c.length < 2) return null;
  return [c[0], c[1]];
}

export async function fetchLiveDrivingRouteORS(
  config: RouteConfig,
  apiKey: string
): Promise<LiveRouteResult | null> {
  const stops = config.stops.map((s) => s.trim()).filter(Boolean);
  const labels = [config.source.trim(), ...stops, config.destination.trim()].filter(Boolean);
  if (labels.length < 2) return null;

  const coordsLonLat: [number, number][] = [];
  for (let i = 0; i < labels.length; i++) {
    const g = await geocodeORS(labels[i], apiKey);
    if (!g) return null;
    coordsLonLat.push(g);
    if (i < labels.length - 1) await sleep(400);
  }

  const url = `${ORS_BASE}/v2/directions/driving-car/geojson?api_key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ coordinates: coordsLonLat }),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as {
    type?: string;
    error?: { code?: number; message?: string };
    features?: {
      geometry?: {
        type?: string;
        coordinates?: [number, number][] | [number, number][][];
      };
      properties?: { summary?: { distance?: number; duration?: number } };
    }[];
  };

  if (data.error?.message) return null;

  const feature = data.features?.[0];
  const geom = feature?.geometry;
  let lonLatCoords: [number, number][] = [];

  if (geom?.type === "LineString" && Array.isArray(geom.coordinates)) {
    lonLatCoords = geom.coordinates as [number, number][];
  } else if (geom?.type === "MultiLineString" && Array.isArray(geom.coordinates)) {
    for (const part of geom.coordinates as [number, number][][]) {
      lonLatCoords.push(...part);
    }
  }

  if (lonLatCoords.length < 2) return null;

  const polylineLatLng: [number, number][] = lonLatCoords.map(([lon, lat]) => [lat, lon]);
  const summary = feature?.properties?.summary;
  let distanceM = summary?.distance;
  let durationSec = summary?.duration ?? 0;

  if (distanceM == null || distanceM <= 0) {
    distanceM = polylineLengthKm(polylineLatLng) * 1000;
  }
  if (durationSec <= 0 && distanceM > 0) {
    durationSec = (distanceM / 1000 / 65) * 3600;
  }

  const distanceKm = distanceM / 1000;
  const waypointLatLng: [number, number][] = coordsLonLat.map(([lon, lat]) => [lat, lon]);

  return {
    distanceKm: Math.round(distanceKm * 10) / 10,
    durationSec,
    polylineLatLng,
    waypointLabels: labels,
    waypointLatLng,
  };
}
