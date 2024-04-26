import React from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';

function AboutSection() {
  return (
    <Box p={2} shadow="md" borderWidth="1px" bg="white" rounded="md">
      <VStack spacing={4} align="start">
        <Text fontSize="3xl" fontWeight="bold">About Us</Text>
        <Text fontSize="md">
          At US Crisis Coordination (USCC), we are dedicated to enhancing disaster response efforts through advanced coordination and real-time information systems. Our platform serves as a hub for communities and local authorities, enabling effective communication and resource management to inform and empower populations during critical times.
        </Text>
        <Text fontSize="md">
          USCC leverages technology to streamline responses to natural disasters and emergencies, bridging gaps between individuals, organizations, and government agencies. Join us in making a significant impact in crisis management and response.
        </Text>
        <Text fontSize="3xl" fontWeight="bold">Mission</Text>
        <Text fontSize="md">Our mission is to empower communities and individuals facing crises by providing timely, accessible, and accurate information and coordination services.
         We strive to enhance resilience and facilitate effective response through collaboration with local, national, and global partners. By leveraging technology and expert knowledge, we aim to improve outcomes and support recovery for those affected by emergencies and disasters.
        </Text>
      </VStack>
    </Box>
  );
}

export default AboutSection;
