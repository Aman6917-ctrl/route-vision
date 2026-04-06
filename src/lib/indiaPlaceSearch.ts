/**
 * India place search via Photon (Komoot) + OSM data — covers cities, towns, villages, states.
 * Biased to India with a bounding box.
 */

export type IndiaPlace = {
  /** Human-readable label for display & geocoding */
  label: string;
  lon: number;
  lat: number;
};

/** Approximate India bbox: minLon, minLat, maxLon, maxLat */
const INDIA_BBOX = "68.0,6.4,97.6,37.6";

function dedupeParts(parts: string[]): string[] {
  const out: string[] = [];
  for (const p of parts) {
    const t = p.trim();
    if (!t) continue;
    const low = t.toLowerCase();
    if (out.some((x) => x.toLowerCase() === low)) continue;
    out.push(t);
  }
  return out;
}

function formatPhotonLabel(p: Record<string, unknown>): string {
  const name = String(p.name ?? "").trim();
  if (!name) return "";
  const city = String(p.city ?? "").trim();
  const county = String(p.county ?? "").trim();
  const district = String(p.district ?? "").trim();
  const state = String(p.state ?? "").trim();
  const region = String(p.region ?? "").trim();
  const stateOrRegion = state || region;

  const mid =
    city && city.toLowerCase() !== name.toLowerCase()
      ? city
      : district && district.toLowerCase() !== name.toLowerCase()
        ? district
        : county && county.toLowerCase() !== name.toLowerCase()
          ? county
          : "";

  const parts = dedupeParts([name, mid, stateOrRegion].filter(Boolean));
  return parts.join(", ");
}

export async function searchIndiaPlaces(
  query: string,
  signal?: AbortSignal
): Promise<IndiaPlace[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=18&bbox=${INDIA_BBOX}&lang=en`;

  let res: Response;
  try {
    res = await fetch(url, { signal });
  } catch {
    return [];
  }
  if (!res.ok) return [];

  let data: {
    features?: {
      geometry?: { coordinates?: [number, number] };
      properties?: Record<string, unknown>;
    }[];
  };
  try {
    data = (await res.json()) as typeof data;
  } catch {
    return [];
  }

  const out: IndiaPlace[] = [];
  const seen = new Set<string>();

  for (const f of data.features ?? []) {
    const coords = f.geometry?.coordinates;
    if (!coords || coords.length < 2) continue;
    const [lon, lat] = coords;
    if (typeof lon !== "number" || typeof lat !== "number") continue;

    const label = formatPhotonLabel((f.properties ?? {}) as Record<string, unknown>);
    if (!label) continue;

    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    out.push({ label, lon, lat });
  }

  return out;
}

/** Major hubs for quick-pick when the user has not typed much yet */
export const INDIA_QUICK_PICKS: readonly string[] = [
  "Delhi",
  "Mumbai, Maharashtra",
  "Bengaluru, Karnataka",
  "Chennai, Tamil Nadu",
  "Kolkata, West Bengal",
  "Hyderabad, Telangana",
  "Pune, Maharashtra",
  "Ahmedabad, Gujarat",
  "Jaipur, Rajasthan",
  "Lucknow, Uttar Pradesh",
  "Kanpur, Uttar Pradesh",
  "Nagpur, Maharashtra",
  "Indore, Madhya Pradesh",
  "Bhopal, Madhya Pradesh",
  "Patna, Bihar",
  "Vadodara, Gujarat",
  "Ghaziabad, Uttar Pradesh",
  "Ludhiana, Punjab",
  "Agra, Uttar Pradesh",
  "Nashik, Maharashtra",
  "Faridabad, Haryana",
  "Meerut, Uttar Pradesh",
  "Rajkot, Gujarat",
  "Varanasi, Uttar Pradesh",
  "Srinagar, Jammu and Kashmir",
  "Amritsar, Punjab",
  "Chandigarh",
  "Kochi, Kerala",
  "Visakhapatnam, Andhra Pradesh",
  "Coimbatore, Tamil Nadu",
  "Guwahati, Assam",
  "Thiruvananthapuram, Kerala",
  "Dehradun, Uttarakhand",
  "Ranchi, Jharkhand",
  "Raipur, Chhattisgarh",
  "Goa",
  "Shimla, Himachal Pradesh",
  "Bhubaneswar, Odisha",
  "Shillong, Meghalaya",
  "Puducherry",
  "Leh, Ladakh",
  "Agartala, Tripura",
  "Aizawl, Mizoram",
  "Kohima, Nagaland",
  "Imphal, Manipur",
  "Itanagar, Arunachal Pradesh",
  "Gangtok, Sikkim",
  "Silvassa, Dadra and Nagar Haveli and Daman and Diu",
];
