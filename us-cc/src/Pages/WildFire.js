import * as React from 'react';
import {VStack, Box, Text, useColorModeValue, ListItem, OrderedList} from '@chakra-ui/react'
import { useLocation } from 'react-router-dom';
import wildfire from '../Images/wildfire.png';


export default function Wildfire() {
    const bg = useColorModeValue('gray.50', 'gray.800');
    const textColor = useColorModeValue('gray.800', 'gray.100');

    return(
        <>
        <Box
            w="full"
            h="60vh"
            m={0}
            p={0}
            bg={bg}
            align="center"
            justify="center"
            bgImage={`url(${wildfire})`}
            bgPos="center"
            bgSize="cover"
        >
        </Box>
        <VStack
         spacing={6}
         justify="center"
         align="left"
         height="full"
         pt={12}
         pr={12}
         pl={12}
         pb={12}
         >
            <Text fontSize='5xl' color={textColor} maxW="lg">
                Wildfire
            </Text>
            <Box
                width="50%"
                height="3px"
                backgroundColor="black"
                marginX="auto" // Centers the Box horizontally
                />
            <Text fontSize='2xl' font-variant="normal">
            Wildfires are unplanned fires that burn in natural areas like forests, grasslands or prairies. These dangerous fires spread quickly and can devastate not only wildlife and natural areas, but also communities.
            </Text>
            <Text fontSize='4xl' color={textColor} maxW="lg">
                What To Do Before
            </Text>
            <Box
                width="50%"
                height="3px"
                backgroundColor="black"
                marginX="auto" // Centers the Box horizontally
                />
            <Text fontSize="lg">
            Preparing for a wildfire is crucial to ensuring your safety and minimizing property damage. Here are key steps you should take before a wildfire occurs:
            </Text>
            <OrderedList spacing={3} fontSize="lg">
                <ListItem>
                <b>Create Defensible Space:</b> Clear away brush, dead leaves, and other flammable materials from around your house to create a buffer zone. This helps reduce the risk of flames reaching your home.
                </ListItem>
                <ListItem>
                <b>Harden Your Home:</b> Use fire-resistant materials for roofing and siding. Install dual-pane windows, and use non-combustible materials for decks.
                </ListItem>
                <ListItem>
                <b>Emergency Plan and Kit:</b> Develop an evacuation plan that includes multiple escape routes from your home and neighborhood. Prepare an emergency kit with essential items like water, food, medications, and important documents.
                </ListItem>
                <ListItem>
                <b>Stay Informed:</b> Sign up for local alerts and warnings. Keep track of fire weather conditions and updates from local authorities.
                </ListItem>
                <ListItem>
                <b>Arrange for Evacuation:</b> Know where to go and what to take with you. Plan for pets and livestock evacuation if necessary.
                </ListItem>
                <ListItem>
                <b>Practice Evacuation Drills:</b> Regularly practice your evacuation route with all members of your household, including pets.
                </ListItem>
                <ListItem>
                <b>Emergency Contacts:</b> Maintain a list of emergency contact information and teach all family members how to use it.
                </ListItem>
                <ListItem>
                <b>Backup Important Documents:</b> Keep copies of critical documents, such as birth certificates, passports, and insurance policies, in a fireproof safe or digital format.
                </ListItem>
            </OrderedList>
            <Text fontStyle="lg">Preparing early and thoroughly can significantly affect your resilience to wildfire threats.</Text>

            <Text fontSize='4xl' color={textColor} maxW="lg">
                What To Do During
            </Text>
            <Box
                width="50%"
                height="3px"
                backgroundColor="black"
                marginX="auto" // Centers the Box horizontally
                />
            <OrderedList spacing={3} fontSize="lg">
                <ListItem>
                <b>Stay Informed:</b>Continuously monitor local news updates, emergency alerts, and instructions from local authorities. Knowing the wildfire's location and movement is vital.
                </ListItem>
                <ListItem>
                <b>Evacuate Promptly:</b> If advised to evacuate, do so immediately. Delaying can trap you as escape routes may become unsafe or impassable due to heavy smoke or fire.
                </ListItem>
                <ListItem>
                <b>Dress Appropriately:</b> Wear protective clothing, including long pants, a long-sleeve shirt made of natural fibers like cotton, and sturdy shoes. Use goggles or glasses and a mask or cloth to cover your face and protect against smoke inhalation.   
                </ListItem>
                <ListItem>
                <b>Follow Emergency Plans:</b> Stick to your prepared evacuation plan, taking your emergency supply kit with you. Follow designated evacuation routes; alternative routes might be blocked.   
                </ListItem>
                <ListItem>
                <b>Secure Your Home:</b> If time allows, close all windows, vents, and doors to prevent drafts. Shut off gas, electricity, and water if instructed by officials. Move flammable furniture away from windows and doors.
                </ListItem>
                <ListItem>
                <b>Communicate Your Whereabouts:</b> Inform someone outside of the fire zone where you are going and when you have arrived.
                </ListItem>
                <ListItem>
                <b>Animal Safety:</b> Don’t leave pets and livestock behind. Evacuate animals with you or move them to a safer area.
                </ListItem>
            </OrderedList> 
            <Text fontSize="lg">By following these guidelines, you can better protect yourself and your family during a wildfire. Always prioritize safety and follow the instructions from emergency services.</Text>
            
            <Text fontSize='4xl' color={textColor} maxW="lg">
                What To Do After
            </Text>
            <Box
                width="50%"
                height="3px"
                backgroundColor="black"
                marginX="auto" // Centers the Box horizontally
                />
            <Text fontSize="2xl">After a wildfire, it's essential to prioritize safety while beginning the recovery process. Here are some steps to follow once it's safe to return to your area: </Text>
            <OrderedList spacing={3} fontSize="lg">
                <ListItem>
                <b>Wait for Clearance:</b> Only return home when authorities have declared it safe to do so. Premature returns can be dangerous due to lingering hazards.
                </ListItem>
                <ListItem>
                <b>Inspect Utilities:</b>Check for damaged utility lines and report them to the utility company. Do not attempt to turn on utilities yourself. Wait for professionals to inspect and restore gas, water, and electricity.
                </ListItem>
                <ListItem>
                <b>Assess Property Damage:</b> Carefully inspect your property for damage. Take photos for insurance claims and document any losses. Wear protective clothing during inspections to avoid contact with toxic ash and debris.
                </ListItem>
                <ListItem>
                <b>Avoid Ash and Debris:</b> Ash from wildfires can be toxic. Wear a N95 mask, gloves, and long sleeves when cleaning up ash and charred debris. Avoid using leaf blowers or doing anything that will stir up ash into the air.
                </ListItem>
                <ListItem>
                <b>Check for Hot Spots:</b> Examine your home and yard for smoldering stumps, roots, and other hot spots. Extinguish them safely.
                </ListItem>
                <ListItem>
                <b>Contact Insurance:</b> Contact your insurance company to file claims for damages. Provide documentation and photos of the damage.
                </ListItem>
                <ListItem>
                <b>Clean Up Safely:</b>Follow local guidelines for safe cleanup and disposal of debris. Toxic substances, including asbestos and lead, can be present in post-fire debris and ash.
                </ListItem>
                <ListItem>
                <b>Seek Support and Resources:</b> Utilize support from local community services and national aid programs offering help to wildfire survivors. This can include financial assistance, counseling, and help with temporary housing.
                </ListItem>
            </OrderedList>
            <Text fontSize="lg">By taking these steps, you can effectively manage the aftermath of a wildfire, focusing on safety, recovery, and preparation for future risks.</Text>

        </VStack>
       </>
    )
};