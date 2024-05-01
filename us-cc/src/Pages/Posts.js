import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Grid, Card, Box, CardHeader, CardBody, CardFooter, Text, Button, Heading, Stack, StackDivider, VStack, HStack, Divider } from '@chakra-ui/react'
import '../Styles/styles.css';


const Post = ({ postData }) => {
    const { name, username, title, body, date_posted } = postData;
    // console.log("supposed post data", postData);
    const datePosted = date_posted ? new Date(date_posted) : null;
    const formattedDate = datePosted ? datePosted.toLocaleDateString() : 'N/A';

    return (
        <Box
            borderWidth="2px"
            borderRadius="lg"
            overflow="hidden"
            borderColor="gray.800" // Darker border color
            boxShadow="xl"         // Shadow for 3D effect
        >
            <Box p={4}>
                <Text fontWeight="bold">Name: {name}</Text>
                <Text fontWeight="bold">Username: {username}</Text>
                <Text fontSize="xl" fontWeight="semibold" textAlign="center" my={2}>
                    Title: {title}
                </Text>
                <Divider />
                <VStack spacing={4} align="left" my={4}>
                    <Text fontSize="md">Body: {body}</Text>
                </VStack>
                <Text fontSize="sm">Date posted: {formattedDate}</Text>
            </Box>
        </Box>
    );
}

export default function Posts() {
    const [posts, setPosts] = useState([]);
    const { username } = useParams();
    useEffect(() => {
        const fetchData = async () => {
            const authToken = document.cookie && document.cookie.split('; ').find(row => row.startsWith('authToken=')).split('=')[1];
            
            try {
                let response;
                if (username) {
                    response = await axios.get(`http://localhost:5000/api/posts/${username}`, {
                        headers: {
                            Authorization: `${authToken}`
                        }
                    });
                } else {
                    response = await axios.get(`http://localhost:5000/api/posts`, {
                        headers: {
                            Authorization: `${authToken}`
                        }
                    });
                }

                setPosts(response.data);
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };

        fetchData();
    }, [username]);

    console.log("posts:", posts);
    return (
        <Grid
            p={5}
            templateColumns="repeat(1, 1fr)"  // One column layout
            gap={2}
            justifyContent="center"          // Centers the column in the grid horizontally
            alignContent="center"
        >
            <Button className="newPostButton" colorScheme='blue'>New Post</Button>


            <VStack spacing={4} align="stretch">
                {posts.map((post, index) => (
                    <Post key={index} postData={post} />
                ))}
            </VStack>
        </Grid>
    );
};
