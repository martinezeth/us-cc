import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useParams } from 'react-router-dom';
import { Avatar, Box, Text } from '@chakra-ui/react';
import '../Styles/profilecss.css';

export default function Profile() {
    const [userData, setUserData] = useState();
    const { username } = useParams();
    const [volunteering, setVolunteering] = useState([]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const authToken = document.cookie && document.cookie.split('; ')
                .find(row => row.startsWith('authToken=')).split('=')[1];

                const response = await axios.get(`http://localhost:8000/api/userinfo/${username}`, {
                    headers: {
                        Authorization: `${authToken}` // Include the authToken in the Authorization header
                    }
                });
                console.log("response Profile", response.data);
                setUserData(response.data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        const fetchVolunteering = (username) => {
            
            const apiUrl = `http://localhost:8000/api/volunteering/${username}`;

            
            axios.get(apiUrl)
                .then(response => {
                    
                    setVolunteering(response.data); 
                })
                .catch(error => {
                    
                    console.error('Error fetching volunteering data:', error);
                });
        };
        fetchUserData();
        fetchVolunteering(username);
    }, [username]);
    


    // Call the fetchVolunteering function with the desired username


    return (
        <Box
            display="flex"
            justifyContent="center"
            height={'94vh'}
            alignItems="center"
            flexDirection="column"
            backgroundColor="blue.200"
            padding="20px"
        >
            {userData.length > 0 ? (
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    flexDirection="column"
                >
                    <Box>
                        <Avatar size="lg" />
                    </Box>
                    <Box textAlign="center" marginY="10px">
                        <Text fontSize="xl" fontWeight="bold">
                            {/* {userData[0][0].username || 'Username'} */}
                            {console.log(userData)}
                        </Text>
                        <Text>{userData[0][0].role || 'Role'}</Text>
                    </Box>
                    <Box textAlign="center" marginY="10px">
                        <Text>
                            Member since:{' '}
                            {userData[0][0].date_joined
                                ? new Date(userData[0][0].date_joined).toLocaleDateString()
                                : 'Unknown join date'}
                        </Text>
                        {/* Display state and city if available */}
                        {userData[0][0].region && (
                            <>
                                <Text>State: {userData[0][0].region.state || 'XXXXXXX'}</Text>
                                <Text>City: {userData[0][0].region.city || 'XXXXXXX'}</Text>
                            </>
                        )}
                    </Box>
                    <Box textAlign="center">
                        <Text fontSize="lg" fontWeight="bold">
                            Currently volunteering at:
                        </Text>
                        {volunteering && volunteering.length > 0 ? (
                            <Box as="ul" listStyleType="none" padding="0">
                                {volunteering[0].map((place, index) => (
                                    <Text as="li" key={index}>
                                        {place.location_name}
                                    </Text>
                                ))}
                            </Box>
                        ) : (
                            <Text>No volunteering places listed.</Text>
                        )}

                    </Box>
                </Box>
            ) : (
                <Text fontSize="xl" fontWeight="bold">
                    Unauthorized Access
                </Text>
            )}
        </Box>
    );
};