import React from 'react';
import { Box, Container, SimpleGrid, Heading, Text, Icon } from '@chakra-ui/react';
import { MdMap, MdGroup, MdAssignment, MdAnnouncement, MdDashboard } from 'react-icons/md';
import { FaHandsHelping } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const FeatureCard = ({ title, description, icon, onClick }) => {
  return (
    <Box
      bg="white"
      p={6}
      rounded="lg"
      shadow="md"
      border="1px"
      borderColor="gray.100"
      transition="all 0.3s"
      cursor="pointer"
      onClick={onClick}
      _hover={{ transform: 'translateY(-5px)', shadow: 'lg' }}
      position="relative"
    >
      <Icon as={icon} w={10} h={10} color="blue.500" mb={4} />
      <Heading size="md" mb={2}>{title}</Heading>
      <Text color="gray.600">{description}</Text>
    </Box>
  );
};

export default function FeaturesSection() {
  const navigate = useNavigate();

  return (
    <Box py={16} bg="gray.50" width="100%">
      <Box maxW="90%" mx="auto">
        <Heading textAlign="center" mb={12} size="xl">
          Key Features
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
          <FeatureCard
            title="Incident Map"
            description="View and report real-time incidents with our interactive map interface. Track emergency situations in your area."
            icon={MdMap}
            onClick={() => navigate('/mapview')}
          />
          <FeatureCard
            title="Volunteer Opportunities"
            description="Browse and respond to volunteer opportunities. Connect with organizations making a difference."
            icon={FaHandsHelping}
            onClick={() => navigate('/volunteering')}
          />
          <FeatureCard
            title="Organization Dashboard"
            description="For organizations: Manage volunteer opportunities and coordinate response efforts effectively."
            icon={MdDashboard}
            onClick={() => navigate('/organization-dashboard')}
          />
          <FeatureCard
            title="Community Posts"
            description="Share and stay updated with community posts about local safety concerns and lost pets."
            icon={MdAnnouncement}
            onClick={() => navigate('/posts')}
          />
          <FeatureCard
            title="Resource Center"
            description="Access emergency preparedness guides and crisis response resources."
            icon={MdAssignment}
            onClick={() => navigate('/resources')}
          />
          <FeatureCard
            title="Volunteer Registration"
            description="Register as a volunteer, specify your skills, and get matched with opportunities."
            icon={MdGroup}
            onClick={() => navigate('/volunteer-signup')}
          />
        </SimpleGrid>
      </Box>
    </Box>
  );
}