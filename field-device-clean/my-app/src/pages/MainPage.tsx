// src/pages/MainPage.tsx
import React from "react";
import DeviceList from "./DeviceList";
import MapView from "../MapView";

const MainPage = () => {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">🧭 Palaemon Control Node</h1>
      <DeviceList />
      <MapView />
    </div>
  );
};

export default MainPage;

