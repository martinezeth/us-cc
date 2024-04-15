import * as React from 'react';
import { useLocation } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import landingPageMainImage from '../Images/landingPageMainImage.webp';
import AboutSection from '../components/AboutSection';
import FeaturesSection from '../components/FeaturesSection';

export default function LandingPage() {
  const location = useLocation();

  React.useEffect(() => {
    const { state } = location;
    if (state && state.sectionId) {
      const section = document.getElementById(state.sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [location]);

  return (
    <>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, bgcolor: 'background.default', padding: 3 }}>
        <Typography variant="h2">
          Welcome to United States Crisis Coordination
        </Typography>
        <img src={landingPageMainImage} alt="Main Banner" style={{ width: '100%', height: 'auto' }} />
        <AboutSection />
        <FeaturesSection />
      </Box>
    </>
  );
}