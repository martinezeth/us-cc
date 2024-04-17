import React from 'react';
import { Grid, GridItem, Box, Text, VStack } from '@chakra-ui/react';

function FeaturesSection() {
  return (
    <Box p={5} bg="white">
      <Text fontSize="lg" mb={4}>Key Features</Text>
      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        <GridItem w="100%" h="10" bg="blue.500">
          <VStack>
            <Text>Incident Reporting</Text>
            <Text fontSize="sm">Report and track incidents in real-time.</Text>
          </VStack>
        </GridItem>
        <GridItem w="100%" h="10" bg="green.500">
          <VStack>
            <Text>Resource Management</Text>
            <Text fontSize="sm">Efficient allocation of resources during crises.</Text>
          </VStack>
        </GridItem>
        <GridItem w="100%" h="10" bg="orange.500">
          <VStack>
            <Text>Volunteer Coordination</Text>
            <Text fontSize="sm">Coordinate volunteer efforts effectively.</Text>
          </VStack>
        </GridItem>
        <GridItem w="100%" h="10" bg="red.500">
          <VStack>
            <Text>Real-time Data Visualization</Text>
            <Text fontSize="sm">Visualize data to make informed decisions quickly.</Text>
          </VStack>
        </GridItem>
      </Grid>
    </Box>
  );
}

export default FeaturesSection;
