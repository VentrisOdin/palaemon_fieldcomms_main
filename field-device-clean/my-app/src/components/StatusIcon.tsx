import React from "react";

const StatusIcon: React.FC<{ online: boolean }> = ({ online }) => {
  return (
    <span
      className={`inline-block w-3 h-3 rounded-full ${online ? "bg-green-500" : "bg-gray-400"}`}
      title={online ? "Online" : "Offline"}
    ></span>
  );
};

export default StatusIcon;
