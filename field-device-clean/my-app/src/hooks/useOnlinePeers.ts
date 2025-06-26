// src/hooks/useOnlinePeers.ts
import { useEffect, useState } from "react";
import axios from "axios";

export interface Peer {
  HostName: string;
  DNSName: string;
  OS: string;
  Online: boolean;
  TailscaleIPs: string[];
}

export function useOnlinePeers() {
  const [peers, setPeers] = useState<Peer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPeers = async () => {
      try {
        const response = await axios.get("http://localhost:8000/peers");
const data = response.data as Record<string, Peer>;

const onlinePeers = Object.values(data).filter(
  (peer) => peer.Online === true
);

        setPeers(onlinePeers);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchPeers();
    const interval = setInterval(fetchPeers, 5000);
    return () => clearInterval(interval);
  }, []);

  return { peers, loading, error };
}
