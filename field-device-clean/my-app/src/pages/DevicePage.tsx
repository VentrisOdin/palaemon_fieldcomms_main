// src/pages/DevicePage.tsx
import React from "react";
import { useParams } from "react-router-dom";

const DevicePage = () => {
  const { hostname } = useParams();

  const handlePTT = () => {
    fetch(`http://localhost:8000/start?ip=${hostname}`);
  };

  const stopPTT = () => {
    fetch(`http://localhost:8000/stop`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <h2 className="text-xl font-semibold">🎙️ Talk to {hostname}</h2>
      <button
        onMouseDown={handlePTT}
        onMouseUp={stopPTT}
        onTouchStart={handlePTT}
        onTouchEnd={stopPTT}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded text-xl"
      >
        Hold to Talk
      </button>
    </div>
  );
};

export default DevicePage;