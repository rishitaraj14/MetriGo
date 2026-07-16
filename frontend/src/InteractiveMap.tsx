import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default Leaflet icon marker issues in React
const startIcon = new L.DivIcon({
  className: 'glow-marker-start',
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

const endIcon = new L.DivIcon({
  className: 'glow-marker-end',
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

interface InteractiveMapProps {
  startCoords: [number, number] | null; // [lat, lon]
  endCoords: [number, number] | null;   // [lat, lon]
  routePath: [number, number][];       // Array of [lat, lon]
}

// Subcomponent to handle map centering and auto-bounding
const MapController: React.FC<{
  start: [number, number] | null;
  end: [number, number] | null;
  path: [number, number][];
}> = ({ start, end, path }) => {
  const map = useMap();

  useEffect(() => {
    if (path && path.length > 0) {
      const bounds = L.latLngBounds(path);
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (start) {
      map.setView(start, 13);
    }
  }, [start, end, path, map]);

  return null;
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  startCoords,
  endCoords,
  routePath
}) => {
  // Default coordinates (e.g. Chennai Center: 13.0827, 80.2707)
  const defaultCenter: [number, number] = [13.0827, 80.2707];

  return (
    <div style={{ height: '100%', width: '100%', minHeight: '350px', position: 'relative' }}>
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        {/* Dark-themed Map Layer using CartoDB Dark Matter */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {startCoords && (
          <Marker position={startCoords} icon={startIcon} />
        )}

        {endCoords && (
          <Marker position={endCoords} icon={endIcon} />
        )}

        {routePath && routePath.length > 0 && (
          <Polyline
            positions={routePath}
            color="var(--accent-cyan)"
            weight={4}
            opacity={0.8}
            lineCap="round"
            lineJoin="round"
          />
        )}

        <MapController start={startCoords} end={endCoords} path={routePath} />
      </MapContainer>
    </div>
  );
};
