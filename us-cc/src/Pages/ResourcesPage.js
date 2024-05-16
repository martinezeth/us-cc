import React from 'react';
import { Box, Text, Container, Heading, Link, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, VStack, UnorderedList, ListItem } from '@chakra-ui/react';
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

      <VStack   ml={4} mt ={10} alignItems="left">
        <Text fontSize="3xl">
          <b>Build A Kit</b>
        </Text>

        <Text fontSize="lg">
        To assemble your kit store items in airtight plastic bags and put your entire disaster supplies kit in one or two easy-to-carry containers such as plastic bins or a duffel bag.
        <br></br>
        <br></br> 
        A basic emergency supply kit could include the following recommended items:
        </Text>

        <UnorderedList fontSize="lg" spacing={4} mb={4}>

            <ListItem>
                <b>Water</b> (one gallon per person per day for several days)
            </ListItem>
            <ListItem>
              <b>Food</b> (at least a several-day supply of non-perishable food)
            </ListItem>
            <ListItem>
              Battery-Powered or hand crank radio
            </ListItem>
            <ListItem>
              Flashlight (multiple if possible)
            </ListItem>
            <ListItem>
              First aid kit with enough supplies to handle minor injuries
            </ListItem>
            <ListItem>
              Dust Mask in case of ash in the air or contaminated air from chemicals fires (KN-95, N095 or any mask with a respirator)
            </ListItem>
            <ListItem>
              Chargers and batteries for electronics. If possible pack a small solar powered battery pack to charge all devices
            </ListItem>
            <ListItem>
              Moist towelettes, zip ties, bungee-cord or other items to build a shelter or maintain personal sanitation
            </ListItem>
        </UnorderedList>        

        <Text fontSize="lg" mb={4}>
          All items in this survival kit should be checked regularly to ensure that they work or that they are not expired. 

          <br></br>
          <br></br>
          Adjust items in bag depending on your area of the country or what type of disasters you are prone too. Always remeber to follow best judgement from local authorities and to practice using medical supplies before you need to use them.
        </Text>

        <Text fontSize="3xl">
          <b>Kit Storage Locations</b>
        </Text>
        <Text>
          Since you are do not know when a disaster is going to occur, prepare a bag of supplies for your home, work, and cars.
        </Text>
        
        <UnorderedList mb={4}>
          <ListItem>
            <b>Home:</b> Keep this kit in a spot that is easily accessible to memebers of your family in case of a disaster or emergency.
          </ListItem>
          <ListItem>
            <b>Work:</b> Be ready at work in case you have to shelter in place for over 24 hours. Your work kit should include all the necessary supplies listed above along with medication and a change of clothes.
          </ListItem>
          <ListItem>
            <b>Car:</b> In the case of you getting stranded in your vehicle this kit will help you. Do not touch these supplies unless absolutely needed.
          </ListItem>
        </UnorderedList>
      </VStack>

      <Box bg="brand.dark" color="neutral.white" p={10} textAlign="center">
        <Text fontSize="lg">For more detailed information, please reach out to local authorities.</Text>
      </Box>
    </Container>
  );
}

export default ResourcesPage;