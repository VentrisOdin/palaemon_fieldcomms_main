import React from "react";
import ReactDOM from "react-dom/client";
import FieldDeviceUI from "./pages/FieldDeviceUI";
import { ChakraProvider } from "@chakra-ui/react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider>
      <FieldDeviceUI />
    </ChakraProvider>
  </React.StrictMode>
);
