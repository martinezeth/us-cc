import * as React from 'react';
import {VStack, Box, Text, useColorModeValue} from '@chakra-ui/react'
import { useLocation } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
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
         spacing={8}
         justify="center"
         align="left"
         height="full"
         >
            <Text fontSize='4xl' color={textColor} maxW="lg">
                Wildfire
            </Text>
            <Text fontSize='md'>
            Wildfires are unplanned fires that burn in natural areas like forests, grasslands or prairies. These dangerous fires spread quickly and can devastate not only wildlife and natural areas, but also communities.
            </Text>
            

        </VStack>
       </>
    )
};