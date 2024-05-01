import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useParams } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { Grid, Card, CardHeader, CardBody, CardFooter, Text, Heading, Stack, StackDivider, VStack, HStack, Divider } from '@chakra-ui/react'
import { CardContent, Box } from '@mui/material';

const Post = props => {
    return (
        <Box 
            borderWidth="2px" 
            borderRadius="lg" 
            overflow="hidden"
            borderColor="gray.800" // Darker border color
            boxShadow="xl"         // Shadow for 3D effect
            >
                    <Card variant="outline" align="left" w="100%" >
                        <HStack justifyContent="space-between" mb={4}>
                            <Text fontWeight="bold">Name: </Text>
                            <Text fontWeight="bold">Region: </Text>
                        </HStack>
                        <Text fontSize="xl" fontWeight="semibold" textAlign="center" mb={2}>
                            Title:
                        </Text>
                        <Divider />
                        <VStack spacing={4} align="left" mt={4}>
                            <Text fontSize="md">Body:</Text>
                        </VStack>
                        <Text mt={4} fontSize="sm">
                            Date posted:
                        </Text>
                    </Card>
                </Box>
    )
}


export default function Posts() {
    const [postData, setPostData] = useState(null);

    return (
        <Grid
            p={5}
            templateColumns="repeat(1, 1fr)"  // One column layout
            gap={2}
            justifyContent="center"          // Centers the column in the grid horizontally
            alignContent="center"
        >
            <Stack spacing={4}>
                {<Post/>}
                {<Post/>}
            </Stack>
        </Grid>
    );
};

{/* <>
            <Grid
                minH="100vh"
                p={10}
                templateColumns="repeat(1, 2fr)"  // One column layout
                gap={2}
                justifyContent="center"          // Centers the column in the grid horizontally
                alignContent="center"
            >

                <Stack spacing={4}>
                    {<Post />}
                    {<Post />}
                    {<Post />}
                </Stack>

            </Grid>
        </> */}


    //     <Card variant="outline" align="left" w="100%">
    //     <CardHeader>
    //         <Heading size='md'>User Post Title</Heading>
    //     </CardHeader>
    //     <CardBody>
    //         <Stack divider={<StackDivider />} spacing='4'>
    //             <Box>
    //                 <Heading size='xs' textTransform='uppercase'>
    //                     UserName
    //                 </Heading>
    //                 <Text pt='2' fontSize='sm'>
    //                     Name of user
    //                 </Text>
    //             </Box>
    //             <Box>
    //                 <Heading size='xs' textTransform='uppercase'>
    //                     Text
    //                 </Heading>
    //                 <Text pt='2' fontSize='sm'>
    //                     Random report information in the .text
    //                 </Text>
    //             </Box>
    //             <Box>
    //                 <Heading size='xs' textTransform='uppercase'>
    //                     Date
    //                 </Heading>
    //                 <Text pt='2' fontSize='sm'>
    //                     Date of the user report
    //                 </Text>
    //             </Box>
    //         </Stack>
    //     </CardBody>
    // </Card>