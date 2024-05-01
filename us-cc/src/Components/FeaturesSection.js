import React from 'react';
import { Box, SimpleGrid, VStack, Text, Icon } from '@chakra-ui/react';
import { MdReportProblem, MdGroupWork, MdBarChart, MdSettings } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const FeatureCard = ({ title, description, icon, onClick }) => {
  return (
    <VStack
      p={5}
      bg="white"
      boxShadow="md"
      rounded="md"
      align="center"
      spacing={4}
      _hover={{ bg: 'gray.100' }}
      onClick={onClick}
      cursor="pointer"
    >
      <Icon as={icon} w={10} h={10} color="blue.500" />
      <Text fontSize="xl" fontWeight="semibold">
        {title}
      </Text>
      <Text textAlign="center" color="gray.600">
        {description}
      </Text>
    </VStack>
  );
};


const FeaturesSection = () => {
  const navigate = useNavigate();

  return (
    <Box p={5} bg="gray.50">
      <Text fontSize="3xl" textAlign="center" mb={6}>
        Key Features
      </Text>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={10}>
        <FeatureCard
          title="Incident Reporting"
          description="Report and track incidents in real-time."
          icon={MdReportProblem}
        />
        <FeatureCard
          title="Resource Management"
          description="Efficient allocation of resources during crises."
          icon={MdSettings}
          onClick={() => navigate('/resources')}
        />
        <FeatureCard
          title="Volunteer Coordination"
          description="Coordinate volunteer efforts effectively."
          icon={MdGroupWork}
        />
        <FeatureCard
          title="Real-time Data Visualization"
          description="Visualize data to make informed decisions quickly."
          icon={MdBarChart}
          onClick={() => navigate('/mapview')}
        />
      </SimpleGrid>
    </Box>
  );
};

export default FeaturesSection;
