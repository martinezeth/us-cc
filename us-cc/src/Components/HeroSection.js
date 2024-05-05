import React from 'react';
import { Box, Text, Button, VStack, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import heroImage from '../Images/landingPageMainImage.png';

const Hero = () => {
  const bg = useColorModeValue('gray.50', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'gray.100');

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
        {/*padding top is what is shifting the Welcome title down so it is not hidden */}
        <Text paddingTop="100px" fontSize="4xl" fontWeight="bold" color={textColor} textAlign="center">
          Welcome to Crisis Companion
        </Text>
        <Text fontSize="xl" color={textColor} textAlign="center" maxW="lg">
          Empower Your Community in Crisis Response
        </Text>
        <Button
          as={RouterLink}
          to="/about"
          size="lg"
          colorScheme="orange"
          bg="orange.400"
          color="white"
          _hover={{ bg: 'orange.300' }}
        >
          Learn More
        </Button>
      </VStack>
    </Box>
  );
};

export default Hero;
