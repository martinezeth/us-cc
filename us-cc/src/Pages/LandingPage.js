import React from 'react';
import { Box, VStack, Text, Image } from '@chakra-ui/react';
import AboutSection from '../components/AboutSection';
import FeaturesSection from '../components/FeaturesSection';


export default function LandingPage() {
  return (
    <Box p={5} bg="gray.100">
      <VStack spacing={8}>
        <Text fontSize="2xl">Welcome to United States Crisis Coordination</Text>
        <Image src="../Images/landingPageMainImage.webp" alt="Main Banner" />
        <AboutSection />
        <FeaturesSection />
      </VStack>
    </Box>
  );
}
