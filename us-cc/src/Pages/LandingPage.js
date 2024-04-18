// import React from 'react';
// import { Box, VStack, Text, Image, Img } from '@chakra-ui/react';
// import HeroSection from '../components/HeroSection';
// import AboutSection from '../components/AboutSection';
// import FeaturesSection from '../components/FeaturesSection';
// import mainImage from '../Images/landingPageMainImage.png';
// import fallback from '../Images/landingPageFallback.png';


// export default function LandingPage() {
//   return (
//     <Box p={5} bg="gray.100">
//       <VStack spacing={8}>
//         <Text fontSize="4xl">Welcome to United States Crisis Coordination</Text>
//         <Box>
//           <Img boxSize='600px' width='100%' src={mainImage} fallbackSrc={fallback}  alt='Main Banner' />
//         </Box>
//         <AboutSection />
//         <FeaturesSection />
//       </VStack>
//     </Box>
//   );
// }

import React from 'react';
import { Box, VStack } from '@chakra-ui/react';
import Hero from '../Components/HeroSection'; // Importing the Hero component
import AboutSection from '../Components/AboutSection';
import FeaturesSection from '../Components/FeaturesSection';

export default function LandingPage() {
  return (
    <Box w="full" p={0} m={0} bg="gray.100">
      <VStack spacing={0}>
        <Hero />
        <AboutSection />
        <FeaturesSection />
      </VStack>
    </Box>
  );
}

