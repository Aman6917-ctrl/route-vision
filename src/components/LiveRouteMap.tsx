import { useEffect } from "react";
import { MapContainer, TileLayer, Polyline, useMap, CircleMarker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length < 1) return;
    if (positions.length === 1) {
      map.setView(positions[0], 8);
      return;
    }
    const b = L.latLngBounds(positions);
    map.fitBounds(b, { padding: [36, 36], maxZoom: 9 });
  }, [map, positions]);
  return null;
}

interface Props {
  polyline: [number, number][];
  /** Optional waypoint markers [lat, lng] + label */
  waypoints?: { position: [number, number]; label: string }[];
}

const LiveRouteMap = ({ polyline, waypoints }: Props) => {
  const center: [number, number] = polyline[0] ?? [20.5937, 78.9629];
  const mapKey =
    `${waypoints?.map((w) => w.label).join("|") ?? "route"}-${polyline.length}-${polyline[0]?.[0]?.toFixed(4)}-${polyline[polyline.length - 1]?.[0]?.toFixed(4)}`;

  return (
    <MapContainer
      key={mapKey}
      center={center}
      zoom={5}
      className="h-full w-full min-h-[360px] z-0 rounded-xl"
      scrollWheelZoom
      style={{ background: "hsl(230 25% 7%)" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds positions={polyline.length ? polyline : waypoints?.map((w) => w.position) ?? [center]} />
      {polyline.length > 1 && (
        <Polyline
          positions={polyline}
          pathOptions={{
            color: "hsl(265, 90%, 65%)",
            weight: 4,
            opacity: 0.95,
          }}
        />
      )}
      {waypoints?.map((w, i) => (
        <CircleMarker key={`${w.label}-${i}`} center={w.position} radius={7} pathOptions={{ color: "hsl(185, 95%, 55%)", fillColor: "hsl(265, 90%, 65%)", fillOpacity: 1 }}>
          <Popup>
            <span className="text-sm font-medium">{w.label}</span>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
};

export default LiveRouteMap;
