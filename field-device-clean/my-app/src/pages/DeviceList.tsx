import React from "react";
import { Grid } from "@chakra-ui/react";
import DeviceCard from "../components/DeviceCard";

interface Peer {
  hostname: string;
  note: string;
  ip: string;
  os: string;
  online: boolean;
  last_seen: string;
}

interface DeviceListProps {
  peers: Peer[];
  showOffline: boolean;
  activeIP: string | null;
  broadcasting: boolean;
  onStart: (ip: string) => void;
  onStop: () => void;
  onSOS: (device: string, ip: string, note: string) => void; // ✅ Add this
}

const DeviceList: React.FC<DeviceListProps> = ({
  peers,
  showOffline,
  activeIP,
  broadcasting,
  onStart,
  onStop,
  onSOS, // ✅ Add this
}) => {
  return (
    <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6}>
      {peers
        .filter((peer) => showOffline || peer.online)
        .map((peer) => (
          <DeviceCard
            key={`${peer.hostname}-${peer.ip}`} // ✅ Prevent key warning
            hostname={peer.hostname}
            note={peer.note}
            ip={peer.ip}
            os={peer.os}
            online={peer.online}
            onStart={onStart}
            onStop={onStop}
            isBroadcasting={activeIP === peer.ip && broadcasting}
            onSOS={onSOS} // ✅ Pass it in
          />
        ))}
    </Grid>
  );
};

export default DeviceList;
