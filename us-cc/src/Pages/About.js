import * as React from 'react';
import { VStack, Box, Text, useColorModeValue, UnorderedList, ListItem } from '@chakra-ui/react'
import { useLocation } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { List } from '@mui/material';

export default function AboutPage() {
    return (
        <>
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
                <Text fontSize="5xl">
                    About
                </Text>
                <Text fontSize="lg"> Welcome to Crisis Companion, your dedicated resource hub for navigating natural disasters across the nation. At Crisis Companion, our mission is to empower individuals, families, and communities by providing timely, accessible, and accurate information during crises.
                </Text>
                <Text fontSize="4xl">
                    What We Do
                </Text>
                <UnorderedList spacing={3} fontSize="lg">
                    <ListItem>
                        <b>Information Dissemination:</b>
                        We provide real-time updates and alerts on natural disasters, including hurricanes, wildfires, floods, and earthquakes. Our platform ensures you receive the latest information as events unfold.
                    </ListItem>
                    <ListItem>
                        <b>Resource Distribution:</b> Crisis Companion collaborates with federal, state, and local agencies to compile and distribute resources crucial for disaster preparedness and recovery. This includes emergency kit checklists, evacuation routes, shelter locations, and recovery assistance services.
                    </ListItem>
                    <ListItem>
                        <b>Community Engagement:</b>
                        Through our platform, we facilitate a proactive community network where individuals can share experiences, offer assistance, and stay connected during disasters. We believe in the power of community resilience and mutual support.
                    </ListItem>
                    <ListItem>
                        <b>Education and Training:</b> We offer educational materials and training programs designed to enhance disaster readiness. From workshops to webinars, our educational tools help communities better understand and manage the challenges posed by natural disasters.
                    </ListItem>
                </UnorderedList>
                <Text fontSize="4xl">
                    Our Commitment
                </Text>
                <Text fontSize="lg">
                    Crisis Companion is committed to upholding the highest standards of information accuracy and reliability. We work tirelessly to ensure our content is vetted, updated, and aligned with the latest safety protocols and scientific advice.
                    <br></br>
                    <br></br>
                    Join us in our journey to create a safer, well-prepared society. Stay informed, stay prepared, and stay connected with Crisis Companion.
                </Text>
            </VStack>
        </>
    );
}