export type LiveRouteResult = {
  distanceKm: number;
  durationSec: number;
  /** [lat, lng][] for Leaflet */
  polylineLatLng: [number, number][];
  waypointLabels: string[];
  waypointLatLng: [number, number][];
  provider?: "openrouteservice" | "photon_osrm";
};
