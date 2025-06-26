import React from "react";
import { Button } from "@chakra-ui/react"; // ✅ Use Chakra UI Button

interface BroadcastButtonProps {
  broadcasting: boolean;
  onStart: () => void;
  onStop: () => void;
}

const BroadcastButton: React.FC<BroadcastButtonProps> = ({
  broadcasting,
  onStart,
  onStop,
}) => {
  return (
    <Button
      onMouseDown={onStart}
      onMouseUp={onStop}
      onTouchStart={onStart}
      onTouchEnd={onStop}
      colorScheme={broadcasting ? "red" : "green"}
      size="lg"
      fontWeight="bold"
      boxShadow="md"
    >
      {broadcasting ? "🛑 Release to Stop Broadcast" : "🌍 Hold to Broadcast to All"}
    </Button>
  );
};

export default BroadcastButton;
