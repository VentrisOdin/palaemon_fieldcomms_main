import React from "react";
import {
  Box,
  Text,
  Button,
  VStack,
  HStack,
  Icon,
  Badge,
} from "@chakra-ui/react";
import { FaMicrophone, FaExclamationTriangle } from "react-icons/fa";

interface DeviceCardProps {
  hostname: string;
  note: string;
  ip: string;
  os: string;
  online: boolean;
  onStart: (ip: string) => void;
  onStop: () => void;
  isBroadcasting: boolean;
  onSOS: (device: string, ip: string, note: string) => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({
  hostname,
  note,
  ip,
  os,
  online,
  onStart,
  onStop,
  isBroadcasting,
  onSOS,
}) => {
  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="xl"
      bg={online ? "white" : "gray.100"}
      boxShadow="md"
      w="100%"
    >
      <VStack align="start" spacing={2}>
        <HStack justify="space-between" w="100%">
          <Text fontWeight="bold" fontSize="lg">
            {note || hostname}
          </Text>
          <Badge colorScheme={online ? "green" : "red"}>
            {online ? "Online" : "Offline"}
          </Badge>
        </HStack>
        <Text fontSize="sm" color="gray.600">
          {hostname} · {os}
        </Text>
        <Text fontSize="sm" color="gray.500">
          {ip}
        </Text>

        {online && (
          <>
            <Button
              leftIcon={<FaMicrophone />}
              colorScheme={isBroadcasting ? "red" : "blue"}
              w="100%"
              onMouseDown={() => onStart(ip)}
              onMouseUp={onStop}
              onTouchStart={() => onStart(ip)}
              onTouchEnd={onStop}
            >
              {isBroadcasting ? "Release to Stop" : "Hold to Talk"}
            </Button>

            <Button
              leftIcon={<FaExclamationTriangle />}
              colorScheme="red"
              variant="outline"
              w="100%"
              size="sm"
              onClick={() => onSOS(hostname, ip, note)}
            >
              Send SOS
            </Button>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default DeviceCard;
