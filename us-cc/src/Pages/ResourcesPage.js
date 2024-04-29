import React from 'react';
import { Box, Text, Container, Heading, VStack, Link, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon } from '@chakra-ui/react';

function ResourcesPage() {
  return (
    <Container maxW="container.xl" p={0}>
      <Box bg="brand.light" color="neutral.white" p={10} textAlign="center">
        <Heading as="h1" size="2xl">USCC Resources Directory</Heading>
        <Text fontSize="xl" mt={3}>A comprehensive guide to help you find the right resources.</Text>
      </Box>
      
      <Accordion allowMultiple mt={10}>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Natural Disasters
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            Links and resources for dealing with floods, earthquakes, and more. <Link color="secondary.primary" href="#">FEMA</Link>
          </AccordionPanel>
        </AccordionItem>
        
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Medical Emergencies
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            Resources for immediate medical assistance and health information. <Link color="secondary.primary" href="#">CDC Emergency</Link>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Public Safety
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            Information on public safety measures and contacts. <Link color="secondary.primary" href="#">National Safety Council</Link>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      <Box bg="brand.dark" color="neutral.white" p={10} textAlign="center">
        <Text fontSize="lg">For more detailed information, please reach out to local authorities.</Text>
      </Box>
    </Container>
  );
}

export default ResourcesPage;