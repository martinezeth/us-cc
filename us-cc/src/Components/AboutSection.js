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
