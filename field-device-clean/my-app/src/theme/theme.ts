// src/theme/theme.ts
import { extendTheme, ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  fonts: {
    heading: `'Inter', sans-serif`,
    body: `'Inter', sans-serif`,
  },
  styles: {
    global: {
      "html, body": {
        backgroundColor: "gray.900",  // Force dark background
        color: "gray.100",            // Force light text
        lineHeight: "1.6",
      },
      "*": {
        borderColor: "gray.700",
      },
    },
  },
  colors: {
    controlBlue: {
      50: "#e0f2ff",
      100: "#b3dafe",
      200: "#80c0fd",
      300: "#4da6fc",
      400: "#1a8cfb",
      500: "#0073e0",
      600: "#0059af",
      700: "#00407f",
      800: "#00274f",
      900: "#000e21",
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: "xl",
        fontWeight: "medium",
      },
      defaultProps: {
        colorScheme: "controlBlue",
      },
    },
    Heading: {
      baseStyle: {
        fontWeight: "semibold",
      },
    },
    Checkbox: {
      baseStyle: {
        control: {
          borderRadius: "md",
        },
      },
    },
  },
});

export default theme;
