import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import FieldDeviceUI from "./pages/FieldDeviceUI";

export default function App() {
  return (
    <ChakraProvider>
      <FieldDeviceUI />
    </ChakraProvider>
  );
}
