import * as React from 'react';
import {VStack, Box, Text, useColorModeValue} from '@chakra-ui/react'
import { useLocation } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import flood from '../Images/flood.png';


export default function Flood() {
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
            bgImage={`url(${flood})`}
            bgPos="center"
            bgSize="cover"
        >
        </Box>
        <VStack
         spacing={8}
         justify="center"
         align="center"
         height="full"
         bgGradient="linear(to-r, blackAlpha.600, transparent)"
         >
            <Text fontSize='4xl' color={textColor} textAlign='left' maxW="lg">
                Flood
            </Text>
        </VStack>
       </>
    )
};