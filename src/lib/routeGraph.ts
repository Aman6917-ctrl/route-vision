/**
 * Single source of truth for the India route network graph.
 * Edge weights are approximate road distances (km) between major hubs.
 */

import type { RouteConfig } from "./routeTypes";
import { haversineKm } from "./geoUtils";

export const CITY_IDS = [
  "del",
  "jai",
  "ahm",
  "mum",
  "goa",
  "blr",
  "chn",
  "hyd",
  "kol",
  "lko",
  "pat",
  "pun",
  "nag",
] as const;

export type CityId = (typeof CITY_IDS)[number];

export const CITY_NAMES: Record<CityId, string> = {
  del: "Delhi",
  jai: "Jaipur",
  ahm: "Ahmedabad",
  mum: "Mumbai",
  goa: "Goa",
  blr: "Bangalore",
  chn: "Chennai",
  hyd: "Hyderabad",
  kol: "Kolkata",
  lko: "Lucknow",
  pat: "Patna",
  pun: "Pune",
  nag: "Nagpur",
};

/** Map normalized lowercase names → city id (including common aliases). */
const NAME_TO_ID: Record<string, CityId> = {
  delhi: "del",
  jaipur: "jai",
  ahmedabad: "ahm",
  mumbai: "mum",
  bombay: "mum",
  goa: "goa",
  bangalore: "blr",
  bengaluru: "blr",
  chennai: "chn",
  madras: "chn",
  hyderabad: "hyd",
  kolkata: "kol",
  calcutta: "kol",
  lucknow: "lko",
  patna: "pat",
  pune: "pun",
  nagpur: "nag",
};

for (const id of CITY_IDS) {
  NAME_TO_ID[CITY_NAMES[id].toLowerCase()] = id;
}

/** Approximate centroid [lat, lng] per hub — for snapping arbitrary geocoded points to nearest hub */
export const CITY_LAT_LNG: Record<CityId, [number, number]> = {
  del: [28.6139, 77.209],
  jai: [26.9124, 75.7873],
  ahm: [23.0225, 72.5714],
  mum: [19.076, 72.8777],
  goa: [15.2993, 74.124],
  blr: [12.9716, 77.5946],
  chn: [13.0827, 80.2707],
  hyd: [17.385, 78.4867],
  kol: [22.5726, 88.3639],
  lko: [26.8467, 80.9462],
  pat: [25.5941, 85.1376],
  pun: [18.5204, 73.8567],
  nag: [21.1458, 79.0882],
};

export function nearestHubId(lat: number, lng: number): CityId {
  let best: CityId = CITY_IDS[0];
  let bestD = Infinity;
  for (const id of CITY_IDS) {
    const [clat, clng] = CITY_LAT_LNG[id];
    const d = haversineKm(lat, lng, clat, clng);
    if (d < bestD) {
      bestD = d;
      best = id;
    }
  }
  return best;
}

/** Snap each [lat, lng] waypoint to nearest teaching hub */
export function snapLatLngsToHubIds(livePath: [number, number][]): CityId[] {
  return livePath.map(([lat, lng]) => nearestHubId(lat, lng));
}

export function dedupeConsecutiveHubs(ids: CityId[]): CityId[] {
  const out: CityId[] = [];
  for (const id of ids) {
    if (out.length === 0 || out[out.length - 1] !== id) out.push(id);
  }
  return out;
}

export function hubIdsToRouteConfig(ids: CityId[], algorithm: string): RouteConfig {
  if (ids.length < 2) {
    return { source: "Delhi", destination: "Delhi", stops: [], algorithm };
  }
  return {
    source: cityIdToLabel(ids[0]!),
    destination: cityIdToLabel(ids[ids.length - 1]!),
    stops: ids.slice(1, -1).map(cityIdToLabel),
    algorithm,
  };
}

export interface GraphEdge {
  from: CityId;
  to: CityId;
  weight: number;
}

/** Undirected edges; each pair appears once. */
export const GRAPH_EDGES: GraphEdge[] = [
  { from: "del", to: "jai", weight: 280 },
  { from: "del", to: "lko", weight: 555 },
  { from: "del", to: "mum", weight: 1400 },
  { from: "jai", to: "ahm", weight: 660 },
  { from: "ahm", to: "mum", weight: 530 },
  { from: "mum", to: "pun", weight: 150 },
  { from: "mum", to: "goa", weight: 590 },
  { from: "pun", to: "hyd", weight: 560 },
  { from: "pun", to: "blr", weight: 840 },
  { from: "goa", to: "blr", weight: 560 },
  { from: "blr", to: "chn", weight: 350 },
  { from: "hyd", to: "blr", weight: 570 },
  { from: "hyd", to: "chn", weight: 630 },
  { from: "lko", to: "pat", weight: 535 },
  { from: "pat", to: "kol", weight: 590 },
  { from: "lko", to: "kol", weight: 985 },
  { from: "hyd", to: "kol", weight: 1490 },
  /* Nagpur — approximate highway distances to major hubs */
  { from: "nag", to: "hyd", weight: 500 },
  { from: "nag", to: "pun", weight: 720 },
  { from: "nag", to: "mum", weight: 840 },
  { from: "nag", to: "jai", weight: 950 },
  { from: "nag", to: "lko", weight: 780 },
  { from: "nag", to: "blr", weight: 1020 },
];

export function getCityIds(): CityId[] {
  return [...CITY_IDS];
}

export function normalizeCityName(input: string): CityId | null {
  const key = input.trim().toLowerCase();
  if (!key) return null;
  return NAME_TO_ID[key] ?? null;
}

export function cityIdToLabel(id: CityId): string {
  return CITY_NAMES[id];
}

export type AdjacencyList = Map<CityId, { to: CityId; weight: number }[]>;

export function buildAdjacencyList(): AdjacencyList {
  const adj: AdjacencyList = new Map();
  for (const id of CITY_IDS) adj.set(id, []);
  for (const e of GRAPH_EDGES) {
    adj.get(e.from)!.push({ to: e.to, weight: e.weight });
    adj.get(e.to)!.push({ to: e.from, weight: e.weight });
  }
  return adj;
}

function edgeKey(a: CityId, b: CityId): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

export function getEdgeWeightMap(): Map<string, number> {
  const m = new Map<string, number>();
  for (const e of GRAPH_EDGES) {
    m.set(edgeKey(e.from, e.to), e.weight);
  }
  return m;
}

/** Sum edge weights along a path (must be consecutive graph edges). */
export function pathDistanceKm(path: CityId[], weightMap: Map<string, number>): number | null {
  if (path.length < 2) return 0;
  let d = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const w = weightMap.get(edgeKey(path[i], path[i + 1]));
    if (w === undefined) return null;
    d += w;
  }
  return d;
}

/** Merge consecutive path segments, dropping duplicate junctions. */
export function mergePathSegments(segments: CityId[][]): CityId[] {
  if (segments.length === 0) return [];
  const out: CityId[] = [...segments[0]];
  for (let s = 1; s < segments.length; s++) {
    const seg = segments[s];
    if (seg.length === 0) continue;
    if (out.length > 0 && seg[0] === out[out.length - 1]) {
      out.push(...seg.slice(1));
    } else {
      out.push(...seg);
    }
  }
  return out;
}
