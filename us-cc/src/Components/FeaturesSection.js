import React from 'react';
import { Box, SimpleGrid, Heading } from '@chakra-ui/react';
import { MdMap, MdGroup, MdAssignment, MdAnnouncement, MdDashboard } from 'react-icons/md';
import { FaHandsHelping } from 'react-icons/fa';
import ProtectedFeatureCard from '../Components/ProtectedFeatureCard';

export default function FeaturesSection() {
  const features = [
    {
      title: "Incident Map",
      description: "View and report real-time incidents with our interactive map interface. Track emergency situations in your area.",
      icon: MdMap,
      path: '/mapview',
      requiredRole: null
    },
    {
      title: "Volunteer Opportunities",
      description: "Browse and respond to volunteer opportunities. Connect with organizations making a difference.",
      icon: FaHandsHelping,
      path: '/volunteering', // Publicly accessible
      requiredRole: 'volunteer'
    },
    {
      title: "Organization Dashboard",
      description: "For organizations: Manage volunteer opportunities and coordinate response efforts effectively.",
      icon: MdDashboard,
      path: '/organization-dashboard',
      requiredRole: 'organization'
    },
    {
      title: "Community Posts",
      description: "Share and stay updated with community posts about local safety concerns and lost pets.",
      icon: MdAnnouncement,
      path: '/posts',
      requiredRole: null // Publicly Accessible
    },
    {
      title: "Resource Center",
      description: "Access emergency preparedness guides and crisis response resources.",
      icon: MdAssignment,
      path: '/resources',
      requiredRole: null // Publicly Accessible
    },
    {
      title: "Volunteer Registration",
      description: "Register as a volunteer, specify your skills, and get matched with opportunities.",
      icon: MdGroup,
      path: '/volunteer-signup',
      requiredRole: 'volunteer'
    }
  ];

  return (
    <Box py={16} bg="gray.50" width="100%">
      <Box maxW="90%" mx="auto">
        <Heading textAlign="center" mb={12} size="xl">
          Key Features
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
          {features.map((feature, index) => (
            <ProtectedFeatureCard
              key={index}
              {...feature}
            />
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
}