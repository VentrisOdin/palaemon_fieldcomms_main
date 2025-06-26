// src/hooks/useLiveLocations.ts
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../config";

export interface Location {
  device: string;
  ip: string;
  lat: number;
  lon: number;
  note?: string;
  last_seen?: string;
  sos?: boolean;
}

export default function useLiveLocations(pollInterval: number = 5000) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchLocations = async () => {
      if (!isMounted) return;

      try {
        const response = await fetch(`${BACKEND_URL}/devices`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        // ✅ Optional: Filter only valid locations
        const locationList = Object.values(data).filter((d: any) =>
          d.lat !== undefined && d.lon !== undefined
        ) as Location[];

        if (isMounted) {
          setLocations(locationList);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to fetch devices");
          setLocations([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLocations();
    const interval = setInterval(fetchLocations, pollInterval);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [pollInterval]);

  return { locations, error, loading };
}
