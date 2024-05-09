import React from 'react';
import { Box, Text, Container, Heading, Link, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon } from '@chakra-ui/react';
import { ReactComponent as Logo } from '../Images/crisisCompanionLogo.svg';

function ResourcesPage() {
  return (
    <Container maxW="container.xl" p={0}>
      <Box bg="brand.light" color="neutral.white" p={10} textAlign="center">
        <Heading as="h1" size="2xl">Crisis Companion Resources Directory</Heading>
        <Text fontSize="xl" mt={3}>A comprehensive guide to help you find the right resources.</Text>
      </Box>
      
      <Accordion allowMultiple mt={10}>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                <b>Natural Disasters</b>
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            Links and resources for dealing with floods, earthquakes, and more. <Link color="secondary.primary" href="https://www.fema.gov/">FEMA</Link> or visit <Link color="secondary.primary" href="https://www.ready.gov/">Ready.gov</Link>
          </AccordionPanel>
        </AccordionItem>
        
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                <b>Medical Emergencies</b>
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            Resources for immediate medical assistance and health information. <Link color="secondary.primary" href="https://www.cdc.gov/">CDC Emergency</Link> or visit <Link color="secondary.primary" href="https://www.nih.gov/">National Institute of Health (NIH)</Link>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left" >
                <b>Public Safety</b>
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            Information on public safety measures and contacts. <Link color="secondary.primary" href="https://www.nsc.org/">National Safety Council</Link>
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