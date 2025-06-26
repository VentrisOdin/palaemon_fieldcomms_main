// src/hooks/useGeolocation.ts
import { useEffect, useState } from "react";

export interface GeoLocation {
  lat: number;
  lon: number;
}

export default function useGeolocation(): GeoLocation | null {
  const [location, setLocation] = useState<GeoLocation | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };

        setLocation(coords);

        // ✅ Send location to backend
        fetch("http://localhost:8000/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            device: window.location.hostname,
            ip: "",
            note: "browser GPS",
            ...coords,
          }),
        }).catch((err) => console.error("Failed to send location:", err));
      },
      (err) => console.warn("Geolocation error", err),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return location;
}
