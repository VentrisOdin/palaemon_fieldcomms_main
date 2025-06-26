// src/MapView.tsx

import React from "react";
import { Box } from "@chakra-ui/react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Peer {
  hostname: string;
  note: string;
  ip: string;
  os: string;
  online: boolean;
  last_seen: string;
  lat?: number;
  lon?: number;
}

interface MapViewProps {
  devices: Peer[];
}

const MapView: React.FC<MapViewProps> = ({ devices }) => {
  return (
    <Box height="400px" borderRadius="md" overflow="hidden" mt={10}>
      <MapContainer
        center={[51.5, -0.1]}
        zoom={5}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {devices
          .filter((d) => d.lat !== undefined && d.lon !== undefined)
          .map((device) => (
            <Marker
              key={`${device.hostname}-${device.ip}`} // ✅ Ensure uniqueness
              position={[device.lat!, device.lon!]}
            >
              <Popup>
                <strong>{device.hostname}</strong>
                <br />
                {device.ip}
                <br />
                {device.note}
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </Box>
  );
};

export default MapView;
