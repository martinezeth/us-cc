import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Avatar, Flex, Box, Text, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, Input } from '@chakra-ui/react';
import '../Styles/profilecss.css';

const EditProfileModal = ({ isOpen, onClose, userData, onUpdate }) => {
    const [newUsername, setNewUsername] = useState(userData.username || '');
    const [newName, setNewName] = useState(userData.name || '');
    const [newPassword, setNewPassword] = useState('');
    
    const handleUpdate = () => {
        onUpdate({ newUsername, newName, newPassword });
        onClose(); 
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Edit Profile</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Input placeholder="New Username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
                    <Input placeholder="New Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
                    <Input placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={handleUpdate}>
                        Save
                    </Button>
                    <Button onClick={onClose}>Cancel</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default function Profile() {
    const [userData, setUserData] = useState();
    const { username } = useParams();
    const [volunteering, setVolunteering] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const authToken = document.cookie && document.cookie.split('; ').find(row => row.startsWith('authToken=')).split('=')[1];
                const response = await axios.get(`http://localhost:8000/api/userinfo/${username}`, {
                    headers: {
                        Authorization: `${authToken}` // Include the authToken in the Authorization header
                    }
                }); 
                setUserData(response.data[0][0]);
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
    
    const handleProfileEdit = () => {
        setIsEditing(true);
    }
    

    const handleUpdateProfile = ({ newUsername, newName, newPassword }) => {
        newUsername = newUsername === '' ? username : newUsername;
        newName = newName === '' ? userData.name : newName;
        newPassword = newPassword === '' ? null : newPassword;
        axios.post('http://localhost:8000/api/userinfo/update-user', {
            userid: userData.user_id,
            newUsername: newUsername ,
            newName: newName,
            newPassword: newPassword
        })
        .then(() => {
            
            setIsEditing(false); 
        })
        .catch(error => {
            console.error('Error updating user info:', error);
            });
        navigate('/profile/' + newUsername);
        setIsEditing(false); 
    };
    

    return (
        <Flex justifyContent="center" alignItems="center" h="100vh">
            <Box
                minW="40%"
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
                p="8"
                m="2"
                boxShadow="lg"
                bg="lightblue"
            >
                <EditProfileModal
                    isOpen={isEditing}
                    onClose={() => setIsEditing(false)}
                    userData={userData || {}}
                    onUpdate={handleUpdateProfile}
                />
                {userData ? (
                    <Box>
                        <Box display="flex" alignItems="center" justifyContent="center">
                            <Avatar size="xl" />
                        </Box>
                        <Box textAlign="center" my="4">
                            <Text fontSize="xl" fontWeight="bold">
                                {userData.name || ""}
                            </Text>
                            <Text>{userData.username || 'Username'}</Text>
                            <Text>{userData.role || 'Role'}</Text>
                        </Box>
                        <Box textAlign="center" my="4">
                            <Text fontSize="lg" fontWeight="bold">
                                Member since:{' '}
                                {userData.date_joined
                                    ? new Date(userData.date_joined).toLocaleDateString()
                                    : 'Unknown join date'}
                            </Text>
                            {userData.region_id && (
                                <>
                                    <Text fontSize="md" fontWeight="bold">State: {userData.state || 'XXXXXXX'}</Text>
                                    <Text fontSize="md" fontWeight="bold">City: {userData.city || 'XXXXXXX'}</Text>
                                </>
                            )}
                        </Box>
                        <Box textAlign="center" my="4">
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
                        <Box textAlign="center" my="4">
                            <Button onClick={handleProfileEdit}>Edit Profile</Button>
                        </Box>
                    </Box>
                ) : (
                    <Text fontSize="xl" fontWeight="bold">
                        Unauthorized Access
                    </Text>
                )}
            </Box>
        </Flex>
    );
    // return (
    //     <Box
    //         display="flex"
    //         justifyContent="center"
    //         height={'94vh'}
    //         alignItems="center"
    //         flexDirection="column"
    //         backgroundColor="blue.200"
    //         padding="20px"
    //     >
    //         <EditProfileModal
    //             isOpen={isEditing}
    //             onClose={() => setIsEditing(false)}
    //             userData={userData || {}} 
    //             onUpdate={handleUpdateProfile}
    //         />
    //         {userData ? (
    //             <Box
    //                 display="flex"
    //                 justifyContent="center"
    //                 alignItems="center"
    //                 flexDirection="column"
    //             >
                    
    //                 <Box>
    //                     <Avatar size="lg" />
    //                 </Box>
    //                 <Box textAlign="center" marginY="10px">
    //                     <Text fontSize="xl" fontWeight="bold">
    //                          {userData.name || ""}
    //                     </Text>
    //                         {userData.username || 'Username'}
                        
    //                     <Text>{userData.role || 'Role'}</Text>
    //                 </Box>
    //                 <Box textAlign="center" marginY="10px">
    //                     <Text fontSize="lg" fontWeight="bold">
    //                         Member since:{' '}
    //                         {userData.date_joined
    //                             ? new Date(userData.date_joined).toLocaleDateString()
    //                             : 'Unknown join date'}
    //                     </Text>
    //                     {/* Display state and city if available */}
    //                     {userData.region_id && (
    //                         <>
    //                             <Text fontSize="md" fontWeight="bold">State: {userData.state || 'XXXXXXX'}</Text>
    //                             <Text fontSize="md" fontWeight="bold">City: {userData.city || 'XXXXXXX'}</Text>
    //                         </>
    //                     )}
    //                 </Box>
    //                 <Box textAlign="center">
    //                     <Text fontSize="lg" fontWeight="bold">
    //                         Currently volunteering at:
    //                     </Text>
    //                     {volunteering && volunteering.length > 0 ? (
    //                         <Box as="ul" listStyleType="none" padding="0">
    //                             {volunteering[0].map((place, index) => (
    //                                 <Text as="li" key={index}>
    //                                     {place.location_name}
    //                                 </Text>
    //                             ))}
    //                         </Box>
    //                     ) : (
    //                         <Text>No volunteering places listed.</Text>
    //                     )}

    //                 </Box>
    //                 <Button onClick={handleProfileEdit}>Edit Profile</Button>
    //             </Box>
    //         ) : (
    //             <Text fontSize="xl" fontWeight="bold">
    //                 Unauthorized Access
    //             </Text>
    //         )}
    //     </Box>
    // );
};