import { extendTheme } from "@chakra-ui/react";

const colors = {
  brand: {
    light: '#FFAD66',    // Light Orange
    primary: '#FF7F50',  // Vibrant Orange
    dark: '#E65100',     // Dark Orange
  },
  secondary: {
    light: '#E1F5FE',    // Light Blue
    primary: '#039BE5',  // Mid Blue
    dark: '#01579B',     // Dark Blue
  },
  neutral: {
    white: '#FFFFFF',    // White
    lightGray: '#F4F4F4', // Light Grey
    mediumGray: '#9E9E9E', // Medium Grey
    darkGray: '#424242', // Dark Grey
  }
};

const theme = extendTheme({ colors });

export default theme;
