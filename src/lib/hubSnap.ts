import { computeRoute } from "./routeEngine";
import type { RouteConfig } from "./routeTypes";
import {
  dedupeConsecutiveHubs,
  hubIdsToRouteConfig,
  snapLatLngsToHubIds,
} from "./routeGraph";
import { geocodePhoton } from "./osrmRouting";

/**
 * When typed city names are not on the hub graph, geocode each label and snap to nearest hub,
 * then run the same graph algorithms (fair comparison for any place in India).
 */
export async function tryComputeRouteViaGeocodeSnap(
  config: RouteConfig
): Promise<ReturnType<typeof computeRoute>> {
  const stops = config.stops.map((s) => s.trim()).filter(Boolean);
  const labels = [config.source.trim(), ...stops, config.destination.trim()].filter(Boolean);
  if (labels.length < 2) {
    return { ok: false, message: "Need at least source and destination." };
  }

  const coords: [number, number][] = [];
  for (const label of labels) {
    const g = await geocodePhoton(label);
    if (!g) {
      return { ok: false, message: `Could not geocode "${label}" for hub comparison.` };
    }
    const [lon, lat] = g;
    coords.push([lat, lon]);
  }

  const ids = dedupeConsecutiveHubs(snapLatLngsToHubIds(coords));
  if (ids.length < 2) {
    return { ok: false, message: "After snapping to hubs, need at least two distinct hub cities." };
  }

  const snapConfig = hubIdsToRouteConfig(ids, config.algorithm);
  return computeRoute(snapConfig);
}
