import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import getLPTheme from '../Components/getLPTheme';
import AboutSection from '../Components/AboutSection';
import { Typography } from '@mui/material';
import landingPageMainImage from '../../Styles/Images/landingPageMainImage.webp';
import FeaturesSection from '../Components/FeaturesSection';


export default function LandingPage() {
  const [mode, setMode] = React.useState('light'); // Going to try to implement dark mode option in the future
  // const LPtheme = createTheme(getLPTheme(mode));
  // const defaultTheme = createTheme({ palette: { mode } });


  return (
    // <ThemeProvider theme={LPtheme}> // commented until dark mode is implemented
    <>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, bgcolor: 'background.default', padding: 3 }}>
        {/* Box is the Container for landing page content */}
        <Typography variant="h2">
            Welcome to United States Crisis Coordination
        </Typography>
        <img src={landingPageMainImage} alt="Main Banner" style={{ width: '100%', height: 'auto' }} />
        <AboutSection />
        <FeaturesSection />
      </Box>
    {/* </ThemeProvider> */}
     </>
  );
}


