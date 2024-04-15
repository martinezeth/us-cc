// import React from 'react';
// import Box from '@mui/material/Box';
// import Typography from '@mui/material/Typography';

// const AboutSection = () => {
//     return (
//         <Box sx={{ p: 3 }} id="about-section">
//             <Typography variant="h4" gutterBottom>
//                 About Us
//             </Typography>
//             <Typography variant="body1">
//                 US Crisis Coordination (USCC) is a web-based platform designed to empower communities and local authorities to coordinate and respond to disasters. Our platform provides a centralized hub for information sharing, resource allocation, and communication during times of crisis. By connecting individuals, organizations, and government agencies, USCC aims to streamline disaster response efforts and improve outcomes for those affected by emergencies.
//             </Typography>
//         </Box>
//     );
// };

// export default AboutSection;


import React from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';

function AboutSection() {
  return (
    <Box p={5} shadow="md" borderWidth="1px" bg="white" rounded="md">
      <VStack>
        <Text fontSize="lg">About Us</Text>
        <Text>
          Our mission is to coordinate efforts across various sectors in times of crisis, 
          ensuring that resources and aid are efficiently distributed to those in need.
        </Text>
      </VStack>
    </Box>
  );
}

export default AboutSection;
