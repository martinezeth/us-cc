import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Grid, Card, Box, CardHeader, CardBody, CardFooter, Text, Button, Heading, Stack, StackDivider, VStack, HStack, Divider } from '@chakra-ui/react'
import '../Styles/styles.css';
import CreatePostModal from '../Components/CreatePostModal';


const Post = ({ postData }) => {
    const { user_name, user_username, user_region, title, body, date_posted } = postData;
    
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
                <Text fontWeight="bold">@ {user_name}</Text>
                <Text fontWeight="normal">{user_username}</Text>
                <Text fontSize="xl" fontWeight="semibold" textAlign="center" my={2}>
                    {title}
                </Text>
                <Divider />
                <VStack spacing={4} align="left" my={4}>
                    <Text fontSize="lg">{body}</Text>
                </VStack>
                <Text fontSize="sm">Date posted: {formattedDate}</Text>
            </Box>
        </Box>
    );
}

export default function Posts() {
    const [posts, setPosts] = useState([]);
    const { username } = useParams();
    const [loggedIn, setLoggedIn] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);


    useEffect(() => {
        const fetchData = async () => {
            const authToken = document.cookie && document.cookie.split('; ').find(row => row.startsWith('authToken=')).split('=')[1];
            if(authToken){
                setLoggedIn(true);
            }
            try {
                let response;
                if (username) { 
                    response = await axios.get(`http://localhost:8000/api/posts/${username}`, {
                        headers: {
                            Authorization: `${authToken}`
                        }
                    });
                } else {
                    response = await axios.get(`http://localhost:8000/api/posts`, {
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

    const showModal = () => {
        setIsModalOpen(true);
    };
    const hideModal = () => {
        setIsModalOpen(false);
    };
    
    const handleCreatePost = (newPost) => {
        console.log("new", newPost);
        setPosts(prevPosts => [...prevPosts, newPost]);
    };

    return (
        <>
        { loggedIn &&
            <>
                <Button className="newPostButton" colorScheme='blue' onClick={showModal}>
                    New Post
                </Button>
                <CreatePostModal isOpen={isModalOpen} onClose={hideModal} onCreatePost={handleCreatePost} />
            </>
                
            
         }
            

            <Grid
                className='postcard'
                p={5}
                templateColumns="repeat(1, 1fr)"  // One column layout
                gap={2}
                justifyContent="center"          // Centers the column in the grid horizontally
                alignContent="center"
            >
                <VStack spacing={4} align="stretch">
                    {posts.map((post, index) => (
                        <Post key={index} postData={post} />
                    ))}
                </VStack>
            </Grid>
        </>
    );
};
