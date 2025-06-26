// src/pages/ControlNodeUI.tsx

import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  useToast,
  Checkbox,
  HStack,
  VStack,
  Divider,
  Icon,
  Text,
} from "@chakra-ui/react";
import { FaBroadcastTower } from "react-icons/fa";
import axios from "axios";
import DeviceList from "./DeviceList";
import BroadcastButton from "../components/BroadcastButton";
import MapView from "../MapView";
import useGeolocation, { GeoLocation } from "../hooks/useGeolocation";

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

interface DeviceData {
  device: string;
  ip: string;
  note?: string;
  lat: number;
  lon: number;
  last_seen: string;
  sos: boolean;
}

export default function ControlNodeUI() {
  const [peers, setPeers] = useState<Peer[]>([]);
  const [gpsDevices, setGpsDevices] = useState<Peer[]>([]);
  const [broadcasting, setBroadcasting] = useState(false);
  const [activeIP, setActiveIP] = useState<string | null>(null);
  const [showOffline, setShowOffline] = useState(true);
  const toast = useToast();

  const location: GeoLocation | null = useGeolocation();

  // Load peers
  useEffect(() => {
    const fetchPeers = async () => {
      try {
        const res = await axios.get("http://localhost:8000/peers");
        const data = res.data as Record<string, any>;
        const now = new Date();
        const MAX_OFFLINE_MINUTES = 10;

        const combinedPeers: Record<string, any> = {
          self: data.Self,
          ...(data.Peer || {}),
        };

        const peerList: Peer[] = Object.entries(combinedPeers)
          .map(([key, peer]) => {
            if (typeof peer !== "object" || peer === null) return null;
            const lastSeenRaw = peer.LastSeen || peer.LastWrite || peer.Created;
            let lastSeen = "Unknown";
            let online = false;

            if (lastSeenRaw) {
              try {
                const lastSeenDate = new Date(lastSeenRaw);
                lastSeen = lastSeenDate.toISOString();
                const minutesAgo = (now.getTime() - lastSeenDate.getTime()) / 60000;
                online = peer.Online === true || minutesAgo < MAX_OFFLINE_MINUTES;
              } catch {}
            } else {
              online = peer.Online === true;
            }

            return {
              hostname: peer.HostName || key,
              note: peer.HostName || "No note",
              ip: Array.isArray(peer.TailscaleIPs) ? peer.TailscaleIPs[0] : "N/A",
              os: peer.OS || "Unknown OS",
              online,
              last_seen: lastSeen,
            };
          })
          .filter((peer): peer is Peer => peer !== null);

        setPeers(peerList);
      } catch (err) {
        console.error("Error loading peers:", err);
        toast({
          title: "Failed to load peers",
          description: (err as Error).message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchPeers();
    const interval = setInterval(fetchPeers, 5000);
    return () => clearInterval(interval);
  }, [toast]);

  // Load GPS-enabled devices
  useEffect(() => {
    const fetchGpsDevices = async () => {
      try {
        const res = await axios.get<Record<string, DeviceData>>("http://localhost:8000/devices");
        const data = res.data;

        const formatted: Peer[] = Object.values(data).map((d) => ({
          hostname: d.device,
          note: d.note || "",
          ip: d.ip || "Unknown IP",
          os: "Unknown",
          online: true,
          last_seen: d.last_seen,
          lat: d.lat,
          lon: d.lon,
        }));

        setGpsDevices(formatted);
      } catch (err) {
        console.error("Error loading GPS devices:", err);
      }
    };

    fetchGpsDevices();
    const interval = setInterval(fetchGpsDevices, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle SOS button
  const handleSOS = async (device: string, ip: string, note: string) => {
    try {
      await axios.post("http://localhost:8000/sos", {
        device,
        ip,
        lat: location?.lat ?? 0,
        lon: location?.lon ?? 0,
        note: note || "manual sos",
      });
      toast({
        title: "🚨 SOS sent",
        description: `${device} flagged an emergency.`,
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
    } catch (err) {
      console.error("❌ Failed to send SOS", err);
      toast({
        title: "SOS failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const startBroadcast = async (ip: string) => {
    try {
      await axios.get(`http://localhost:8000/start?ip=${ip}`);
      setBroadcasting(true);
      setActiveIP(ip);
    } catch {
      toast({
        title: "Failed to start broadcast",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const stopBroadcast = async () => {
    try {
      await axios.get("http://localhost:8000/stop");
      setBroadcasting(false);
      setActiveIP(null);
    } catch {
      toast({
        title: "Failed to stop broadcast",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box px={6} py={8}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <HStack spacing={3}>
            <Icon as={FaBroadcastTower} boxSize={6} color="teal.300" />
            <Heading size="lg">Palaemon Control Node</Heading>
          </HStack>
          <Checkbox
            isChecked={showOffline}
            onChange={() => setShowOffline(!showOffline)}
            colorScheme="teal"
          >
            Show Offline Devices
          </Checkbox>
        </HStack>

        <Divider borderColor="gray.600" />

        <DeviceList
          peers={peers}
          showOffline={showOffline}
          activeIP={activeIP}
          broadcasting={broadcasting}
          onStart={startBroadcast}
          onStop={stopBroadcast}
          onSOS={handleSOS}
        />

        <Box textAlign="center" mt={4}>
          <BroadcastButton
            broadcasting={broadcasting}
            onStart={() => startBroadcast("broadcast")}
            onStop={stopBroadcast}
          />
        </Box>

        <Box mt={6} border="1px solid" borderColor="gray.700" borderRadius="xl" overflow="hidden">
          <MapView devices={gpsDevices} />
        </Box>

        <Box textAlign="center" mt={2} fontSize="sm" color="gray.400">
          {location
            ? `This device GPS: ${location.lat.toFixed(5)}, ${location.lon.toFixed(5)}`
            : "Waiting for GPS..."}
        </Box>
      </VStack>
    </Box>
  );
}
