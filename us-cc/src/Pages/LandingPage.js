import React from 'react';
import { Box, VStack, Text, Image, Img } from '@chakra-ui/react';
import AboutSection from '../Components/AboutSection';
import FeaturesSection from '../Components/FeaturesSection';
import mainImage from '../Images/landingPageMainImage.png';
import fallback from '../Images/landingPageFallback.png';


export default function LandingPage() {
  return (
    <Box p={5} bg="gray.100">
      <VStack spacing={8}>
        <Text fontSize="4xl">Welcome to United States Crisis Coordination</Text>
        <Box>
          <Img boxSize='600px' width='100%' src={mainImage} fallbackSrc={fallback}  alt='Main Banner' />
        </Box>
        <AboutSection />
        <FeaturesSection />
      </VStack>
    </Box>
  );
}
