import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  useToast,
  Divider,
} from "@chakra-ui/react";
import useGeolocation from "../hooks/useGeolocation";

interface Peer {
  HostName: string;
  DNSName: string;
  OS: string;
  Online: boolean;
  TailscaleIPs: string[];
}

const FieldDeviceUI: React.FC = () => {
  const [peers, setPeers] = useState<Peer[]>([]);
  const [broadcasting, setBroadcasting] = useState(false);
  const location = useGeolocation();
  const toast = useToast();

  // ⏱ Post live location every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!location) return;

      const payload = {
        device: window.location.hostname || "unknown-device",
        ip: "field-device",
        lat: location.lat,
        lon: location.lon,
        note: "Live field device",
      };

      fetch("http://localhost:8000/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch((err) => console.error("❌ Location post failed", err));
    }, 10000);

    return () => clearInterval(interval);
  }, [location]);

  // 📡 Fetch peers every 30 seconds
  useEffect(() => {
    const fetchPeers = async () => {
      try {
        const res = await fetch("http://localhost:8000/peers");
        const data = await res.json();
        const peerMap = data?.Peer || {};
        setPeers(Object.values(peerMap));
      } catch (err) {
        console.error("❌ Peer fetch failed", err);
      }
    };

    fetchPeers();
    const interval = setInterval(fetchPeers, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleGlobalStart = async () => {
    const onlineIps = peers
      .filter((p) => p.Online && p.TailscaleIPs.length > 0)
      .map((p) => p.TailscaleIPs[0]);

    for (const ip of onlineIps) {
      try {
        await fetch(`http://localhost:8000/start?ip=${ip}`);
      } catch (err) {
        console.error(`❌ Failed to start stream for ${ip}`, err);
      }
    }

    setBroadcasting(true);
  };

  const handleGlobalStop = async () => {
    try {
      await fetch("http://localhost:8000/stop");
    } catch (err) {
      console.error("❌ Failed to stop broadcast", err);
    }
    setBroadcasting(false);
  };

  const handleSOS = async () => {
    if (!location) {
      toast({
        title: "Location unavailable",
        description: "Cannot send SOS without a location.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    const payload = {
      device: window.location.hostname || "unknown-device",
      ip: "field-device",
      lat: location.lat,
      lon: location.lon,
      note: "manual sos",
    };

    try {
      await fetch("http://localhost:8000/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      toast({
        title: "🚨 SOS sent",
        description: "Your SOS alert has been sent successfully.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    } catch (err) {
      console.error("❌ Failed to send SOS", err);
      toast({
        title: "SOS Failed",
        description: "Could not send SOS alert.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleTalkToDevice = async (ip: string) => {
    try {
      await fetch(`http://localhost:8000/start?ip=${ip}`);
      toast({
        title: `Talking to ${ip}`,
        description: "Stream started.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error("❌ Failed to talk to device", err);
    }
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Palaemon Field Device</Heading>

        <HStack spacing={4}>
          <Button
            onMouseDown={handleGlobalStart}
            onMouseUp={handleGlobalStop}
            onTouchStart={handleGlobalStart}
            onTouchEnd={handleGlobalStop}
            colorScheme={broadcasting ? "red" : "blue"}
            size="lg"
          >
            {broadcasting ? "🛑 Stop Broadcasting" : "📢 Broadcast to All"}
          </Button>

          <Button
            onClick={handleSOS}
            colorScheme="red"
            size="lg"
            variant="solid"
          >
            🚨 Send SOS Alert
          </Button>
        </HStack>

        <Divider />

        <Heading size="md">Connected Devices</Heading>
        <VStack align="stretch" spacing={3}>
          {peers.filter((p) => p.Online).length === 0 && (
            <Text>No online devices.</Text>
          )}

          {peers
            .filter((p) => p.Online)
            .map((peer) => (
              <HStack
                key={peer.HostName}
                justify="space-between"
                p={3}
                borderWidth={1}
                borderRadius="lg"
              >
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">{peer.HostName}</Text>
                  <Badge colorScheme="green">Online</Badge>
                </VStack>

                <Button
                  colorScheme="blue"
                  onClick={() => handleTalkToDevice(peer.TailscaleIPs[0])}
                >
                  🎤 Talk
                </Button>
              </HStack>
            ))}
        </VStack>
      </VStack>
    </Box>
  );
};

export default FieldDeviceUI;
