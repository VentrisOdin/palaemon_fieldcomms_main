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
  useColorModeValue,
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
  const [broadcastingIPs, setBroadcastingIPs] = useState<string[]>([]);
  const location = useGeolocation();
  const toast = useToast();

  const bg = useColorModeValue("gray.100", "gray.900");
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.300", "gray.600");

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

  const startBroadcastTo = async (ip: string) => {
    try {
      await fetch(`http://localhost:8000/start?ip=${ip}`);
      setBroadcastingIPs((prev) => [...prev, ip]);
    } catch (err) {
      console.error(`❌ Failed to start stream for ${ip}`, err);
    }
  };

  const stopBroadcastTo = async (ip: string) => {
    try {
      await fetch("http://localhost:8000/stop");
    } catch (err) {
      console.error("❌ Failed to stop stream", err);
    }
    setBroadcastingIPs((prev) => prev.filter((v) => v !== ip));
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

  return (
    <Box bg={bg} w="100vw" h="100vh" p={4} display="flex" alignItems="center" justifyContent="center">
      <Box
        bg={cardBg}
        p={6}
        borderRadius="xl"
        boxShadow="xl"
        maxW="lg"
        w="100%"
      >
        <VStack spacing={6} align="stretch">
          <Heading size="lg" textAlign="center">
            🛟 Palaemon Field Device
          </Heading>

          <HStack justify="center" spacing={4}>
            <Button
              onMouseDown={() => peers.forEach(p => p.Online && startBroadcastTo(p.TailscaleIPs[0]))}
              onMouseUp={() => peers.forEach(p => p.Online && stopBroadcastTo(p.TailscaleIPs[0]))}
              onTouchStart={() => peers.forEach(p => p.Online && startBroadcastTo(p.TailscaleIPs[0]))}
              onTouchEnd={() => peers.forEach(p => p.Online && stopBroadcastTo(p.TailscaleIPs[0]))}
              colorScheme={broadcastingIPs.length > 0 ? "red" : "blue"}
              size="md"
            >
              {broadcastingIPs.length > 0 ? "🛑 Stop" : "📢 Broadcast to All"}
            </Button>

            <Button onClick={handleSOS} colorScheme="red" size="md">
              🚨 Send SOS
            </Button>
          </HStack>

          <Divider />

          <Heading size="md">Connected Devices</Heading>
          <VStack spacing={3} align="stretch">
            {peers.filter((p) => p.Online).length === 0 && (
              <Text>No online devices.</Text>
            )}
            {peers
              .filter((p) => p.Online)
              .map((peer) => {
                const isBroadcasting = broadcastingIPs.includes(peer.TailscaleIPs[0]);
                return (
                  <HStack
                    key={peer.HostName}
                    justify="space-between"
                    p={3}
                    borderWidth={1}
                    borderColor={borderColor}
                    borderRadius="lg"
                    bg={useColorModeValue("gray.50", "gray.800")}
                  >
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold">{peer.HostName}</Text>
                      <Badge colorScheme="green">Online</Badge>
                    </VStack>
                    <Button
                      colorScheme={isBroadcasting ? "red" : "blue"}
                      onMouseDown={() => startBroadcastTo(peer.TailscaleIPs[0])}
                      onMouseUp={() => stopBroadcastTo(peer.TailscaleIPs[0])}
                      onTouchStart={() => startBroadcastTo(peer.TailscaleIPs[0])}
                      onTouchEnd={() => stopBroadcastTo(peer.TailscaleIPs[0])}
                    >
                      {isBroadcasting ? "🛑 Stop" : "🎤 Talk"}
                    </Button>
                  </HStack>
                );
              })}
          </VStack>
        </VStack>
      </Box>
    </Box>
  );
};

export default FieldDeviceUI;
