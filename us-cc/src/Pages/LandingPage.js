import React from 'react';
import { Box, VStack } from '@chakra-ui/react';
import Hero from '../Components/HeroSection';
import AboutSection from '../Components/AboutSection';
import FeaturesSection from '../Components/FeaturesSection';

export default function LandingPage() {
  return (
    <Box w="full" p={0} m={0} bg="gray.100">
      <VStack spacing={0}>
        <Hero />
        <FeaturesSection />
        <AboutSection />
      </VStack>
    </Box>
  );
}
