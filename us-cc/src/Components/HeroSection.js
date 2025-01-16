import React from 'react';
import { Box, Text, Button, VStack, useColorModeValue } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import heroImage from '../Images/landingPageMainImage.png';
import DisclaimerBanner from './DisclaimerBanner';

const Hero = () => {
  const navigate = useNavigate();
  const bg = useColorModeValue('gray.50', 'gray.800');
  const textColor = useColorModeValue('white', 'gray.100');

  const handleDemoRedirect = () => {
    navigate('/login'); // Adjust path if needed based on your routing setup
  };

  return (
    <>
      <DisclaimerBanner />
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
          bgGradient="linear(to-r, blackAlpha.700, transparent)"
        >
          <Text
            fontSize={{ base: '3xl', md: '5xl' }}
            fontWeight="bold"
            color={textColor}
            textAlign="center"
            textShadow="2px 2px 6px rgba(0, 0, 0, 0.8)"
            letterSpacing="wider"
          >
            Welcome to Crisis Companion
          </Text>
          <Text
            fontSize={{ base: 'md', md: 'xl' }}
            color={textColor}
            textAlign="center"
            textShadow="1px 1px 4px rgba(0, 0, 0, 0.6)"
            maxW="3xl"
            px={4}
          >
            Empower Your Community in Crisis Response
          </Text>
          <Button
            size="lg"
            bg="blue.500"
            color="white"
            _hover={{ bg: 'blue.600' }}
            onClick={handleDemoRedirect}
            minW="250px"
          >
            Try Demo Accounts
          </Button>
        </VStack>
      </Box>
    </>
  );
};

export default Hero;