import React from 'react';
import { Box, Text, Button, VStack, useColorModeValue, SimpleGrid } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import heroImage from '../Images/landingPageMainImage.png';

const Hero = () => {
  const navigate = useNavigate();
  const bg = useColorModeValue('gray.50', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'gray.100');

  const handleDemoLogin = async (type) => {
    try {
      const credentials = type === 'volunteer'
        ? { email: 'demo@volunteer.com', password: 'demoVolunteer123!' }
        : { email: 'demo@organization.com', password: 'demoOrg123!' };

      const { data, error } = await supabase.auth.signInWithPassword(credentials);
      if (error) throw error;

      navigate(type === 'volunteer' ? '/volunteering' : '/organization-dashboard');
    } catch (error) {
      console.error('Demo login error:', error);
    }
  };

  return (
    <Box
      w="full"
      h="60vh"
      m={0}
      p={0}
      bg={bg}
      align="center"
      justify="center"
      bgImage={`url(${heroImage})`}
      bgPos="center"
      bgSize="cover"
    >
      <VStack
        spacing={8}
        justify="center"
        align="center"
        height="full"
        bgGradient="linear(to-r, blackAlpha.600, transparent)"
      >
        <Text fontSize="4xl" color={textColor} textAlign="center">
          Welcome to Crisis Companion
        </Text>
        <Text fontSize="xl" color={textColor} textAlign="center">
          Empower Your Community in Crisis Response
        </Text>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} width="auto">
          <Button
            size="lg"
            bg="blue.500"
            color="white"
            _hover={{ bg: 'blue.600' }}
            onClick={() => handleDemoLogin('volunteer')}
            minW="200px"
          >
            Try as Volunteer
          </Button>
          <Button
            size="lg"
            bg="green.500"
            color="white"
            _hover={{ bg: 'green.600' }}
            onClick={() => handleDemoLogin('organization')}
            minW="200px"
          >
            Try as Organization
          </Button>
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default Hero;