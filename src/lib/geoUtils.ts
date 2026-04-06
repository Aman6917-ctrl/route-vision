/** Haversine distance between two WGS84 points in km. */
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Sum of segment lengths along a [lat, lng] polyline (approximate road length lower bound). */
export function polylineLengthKm(latLngPath: [number, number][]): number {
  if (latLngPath.length < 2) return 0;
  let d = 0;
  for (let i = 0; i < latLngPath.length - 1; i++) {
    const [lat1, lon1] = latLngPath[i]!;
    const [lat2, lon2] = latLngPath[i + 1]!;
    d += haversineKm(lat1, lon1, lat2, lon2);
  }
  return d;
}
