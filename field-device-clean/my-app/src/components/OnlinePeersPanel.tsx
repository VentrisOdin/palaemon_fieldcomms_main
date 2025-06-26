// src/OnlinePeersPanel.tsx
import React from "react";
import { useOnlinePeers, Peer } from "../hooks/useOnlinePeers";

export default function OnlinePeersPanel() {
  const { peers, error, loading } = useOnlinePeers();

  if (loading) {
    return <p className="text-gray-600 italic">🔄 Loading peers...</p>;
  }

  if (error) {
    return <p className="text-red-500">❌ Error: {error}</p>;
  }

  if (peers.length === 0) {
    return <p className="text-gray-600 italic">🕸️ No online peers found.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">🟢 Online Devices</h2>

      <ul className="space-y-2">
        {peers.map((peer: Peer) => (
          <li
            key={peer.HostName}
            className="p-4 rounded border bg-white shadow-sm flex justify-between items-center"
          >
            <div>
              <div className="font-bold">{peer.HostName}</div>
              <div className="text-sm text-gray-700">{peer.DNSName}</div>
              <div className="text-sm text-gray-500">OS: {peer.OS}</div>
              <div className="text-sm">IP: {peer.TailscaleIPs.join(", ")}</div>
            </div>
            <button
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              onMouseDown={() => console.log("🎙️ Start PTT", peer.TailscaleIPs[0])}
              onMouseUp={() => console.log("🛑 Stop PTT")}
              onTouchStart={() => console.log("🎙️ Start PTT", peer.TailscaleIPs[0])}
              onTouchEnd={() => console.log("🛑 Stop PTT")}
            >
              🎙️ Hold to Talk
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
