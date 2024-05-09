import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Grid, Box, Button, VStack, Text, Divider, Flex } from '@chakra-ui/react';
import '../Styles/styles.css';
import CreatePostModal from '../Components/CreatePostModal';
import CreateIncidentModal from '../Components/CreateIncidentModal';

const Post = ({ postData }) => {
    const { user_name, user_username, title, body, date_posted } = postData;
    const datePosted = date_posted ? new Date(date_posted) : null;
    const formattedDate = datePosted ? datePosted.toLocaleDateString() : 'N/A';

    return (
        <Box borderWidth="2px" borderRadius="lg" overflow="hidden" borderColor="gray.800" boxShadow="xl" p={4}>
            <Text fontWeight="bold">@{user_name}</Text>
            <Text>{user_username}</Text>
            <Text fontSize="xl" fontWeight="semibold" textAlign="center" my={2}>{title}</Text>
            <Divider />
            <VStack spacing={4} align="left" my={4}>
                <Text fontSize="lg">{body}</Text>
            </VStack>
            <Text fontSize="sm">Date posted: {formattedDate}</Text>
        </Box>
    );
}

export default function Posts() {
    const [posts, setPosts] = useState([]);
    const { username } = useParams();
    const [loggedIn, setLoggedIn] = useState(false);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false); // State for controlling the incident modal visibility

    useEffect(() => {
        const fetchData = async () => {
            const authToken = document.cookie && document.cookie.split('; ').find(row => row.startsWith('authToken=')).split('=')[1];
            if (authToken) {
                setLoggedIn(true);
            }
            try {
                const response = username ?
                    await axios.get(`http://localhost:8000/api/posts/${username}`, { headers: { Authorization: authToken } }) :
                    await axios.get(`http://localhost:8000/api/posts`, { headers: { Authorization: authToken } });
                setPosts(response.data);
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };

        fetchData();
    }, [username]);

    const togglePostModal = () => setIsPostModalOpen(!isPostModalOpen);
    const toggleIncidentModal = () => setIsIncidentModalOpen(!isIncidentModalOpen);

    return (
        <>
            {loggedIn && (
                <>



                    <Flex justify="center" gap="4">
                        <Button flex="1" colorScheme='blue' maxW="200px" onClick={togglePostModal}>
                            New Post
                        </Button>
                        <Button flex="1" colorScheme='red' maxW="200px" onClick={toggleIncidentModal}>
                            Report Incident
                        </Button>
                    </Flex>


                    <CreatePostModal isOpen={isPostModalOpen} onClose={togglePostModal} onCreatePost={(newPost) => setPosts([...posts, newPost])} />
                    <CreateIncidentModal isOpen={isIncidentModalOpen} onClose={toggleIncidentModal} />
                </>
            )}

            <Grid templateColumns="repeat(1, 1fr)" gap={2} p={5} justifyContent="center" alignContent="center">
                <VStack spacing={4} align="stretch">
                    {posts.map((post, index) => (
                        <Post key={index} postData={post} />
                    ))}
                </VStack>
            </Grid>
        </>
    );
}

