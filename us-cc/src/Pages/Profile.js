import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Grid,
    GridItem,
    VStack,
    HStack,
    Text,
    Avatar,
    Badge,
    Button,
    useToast,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    Select,
    Tag,
    TagLabel,
    TagCloseButton,
    Wrap,
    WrapItem,
    useDisclosure,
    IconButton,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
} from '@chakra-ui/react';
import { EditIcon, CheckIcon, AddIcon } from '@chakra-ui/icons';
import { supabase } from '../supabaseClient';

// Reusable styled components
const SectionCard = ({ children, title }) => (
    <Box
        bg="white"
        borderRadius="lg"
        boxShadow="sm"
        p={6}
        border="1px solid"
        borderColor="gray.100"
    >
        {title && (
            <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.700">
                {title}
            </Text>
        )}
        {children}
    </Box>
);

const StatCard = ({ label, value, helpText }) => (
    <Stat
        px={4}
        py={3}
        bg="white"
        borderRadius="lg"
        boxShadow="sm"
        border="1px solid"
        borderColor="gray.100"
    >
        <StatLabel color="gray.500">{label}</StatLabel>
        <StatNumber fontSize="2xl" fontWeight="bold" color="blue.600">
            {value}
        </StatNumber>
        {helpText && <StatHelpText>{helpText}</StatHelpText>}
    </Stat>
);

export default function Profile() {
    const [userData, setUserData] = useState(null);
    const [volunteerData, setVolunteerData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const { username } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();

    // Edit form states
    const [editForm, setEditForm] = useState({
        name: '',
        skills: [],
        availability: [],
        region: '',
        newSkill: '',
        newAvailability: ''
    });

    const availabilityOptions = [
        "Weekdays",
        "Weekends",
        "Mornings",
        "Afternoons",
        "Evenings",
        "On-Call",
        "Emergency Only"
    ];

    useEffect(() => {
        fetchProfileData();
    }, [username]);

    const fetchProfileData = async () => {
        try {
            const { data: authUser } = await supabase.auth.getUser();
            
            if (!authUser.user) {
                toast({
                    title: "Not authorized",
                    description: "Please login to view profiles",
                    status: "error",
                    duration: 5000,
                });
                navigate('/login');
                return;
            }

            // Set initial user data
            setUserData({
                name: authUser.user.user_metadata?.name || 'User',
                username: authUser.user.email.split('@')[0],
                email: authUser.user.email,
                date_joined: new Date(authUser.user.created_at).toLocaleDateString()
            });

            // Fetch volunteer data if exists
            const { data: volunteerInfo } = await supabase
                .from('volunteer_signups')
                .select('*')
                .eq('user_id', authUser.user.id)
                .single();

            if (volunteerInfo) {
                setVolunteerData(volunteerInfo);
                setEditForm({
                    name: authUser.user.user_metadata?.name || '',
                    skills: volunteerInfo.skills || [],
                    availability: volunteerInfo.availability || [],
                    region: volunteerInfo.region || '',
                    newSkill: '',
                    newAvailability: ''
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast({
                title: "Error",
                description: "Failed to load profile data",
                status: "error",
                duration: 5000,
            });
        }
    };

    const handleEditSubmit = async () => {
        try {
            const { data: authUser } = await supabase.auth.getUser();
            
            // Update volunteer data
            const { error: volunteerError } = await supabase
                .from('volunteer_signups')
                .update({
                    skills: editForm.skills,
                    availability: editForm.availability,
                    region: editForm.region
                })
                .eq('user_id', authUser.user.id);

            if (volunteerError) throw volunteerError;

            // Update user metadata if name changed
            if (editForm.name !== userData.name) {
                const { error: userError } = await supabase.auth.updateUser({
                    data: { name: editForm.name }
                });

                if (userError) throw userError;
            }

            toast({
                title: "Success",
                description: "Profile updated successfully",
                status: "success",
                duration: 3000,
            });

            fetchProfileData();
            onClose();
        } catch (error) {
            console.error('Error updating profile:', error);
            toast({
                title: "Error",
                description: "Failed to update profile",
                status: "error",
                duration: 5000,
            });
        }
    };

    if (!userData) {
        return (
            <Box minH="90vh" display="flex" alignItems="center" justifyContent="center">
                <Text>Loading...</Text>
            </Box>
        );
    }

    return (
        <Box
            minH="90vh"
            bg="gray.50"
            pt={8}
            pb={12}
        >
            <Box maxW="7xl" mx="auto" px={4}>
                <Grid
                    templateColumns={{ base: "1fr", lg: "300px 1fr" }}
                    gap={8}
                >
                    {/* Left Sidebar */}
                    <GridItem>
                        <VStack spacing={6}>
                            <SectionCard>
                                <VStack spacing={4} align="center">
                                    <Avatar
                                        size="2xl"
                                        name={userData.name}
                                        src={userData.avatar_url}
                                    />
                                    <VStack spacing={1}>
                                        <Text fontSize="xl" fontWeight="bold">
                                            {userData.name}
                                        </Text>
                                        <Text color="gray.500">
                                            @{userData.username}
                                        </Text>
                                        {volunteerData && (
                                            <Badge colorScheme="green" px={2} py={1}>
                                                Verified Volunteer
                                            </Badge>
                                        )}
                                    </VStack>
                                    <Button
                                        leftIcon={<EditIcon />}
                                        size="sm"
                                        onClick={onOpen}
                                    >
                                        Edit Profile
                                    </Button>
                                </VStack>
                            </SectionCard>

                            {volunteerData && (
                                <SectionCard title="Quick Stats">
                                    <VStack spacing={4}>
                                        <StatCard
                                            label="Incidents Responded"
                                            value="12"
                                            helpText="Last 30 days"
                                        />
                                        <StatCard
                                            label="Hours Volunteered"
                                            value="48"
                                            helpText="Total hours"
                                        />
                                        <StatCard
                                            label="Response Rate"
                                            value="95%"
                                            helpText="Average"
                                        />
                                    </VStack>
                                </SectionCard>
                            )}
                        </VStack>
                    </GridItem>

                    {/* Main Content Area */}
                    <GridItem>
                        <Tabs variant="enclosed" colorScheme="blue">
                            <TabList>
                                <Tab>Overview</Tab>
                                {volunteerData && <Tab>Volunteer Info</Tab>}
                                <Tab>Activity</Tab>
                                <Tab>Settings</Tab>
                            </TabList>

                            <TabPanels>
                                <TabPanel>
                                    <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
                                        <SectionCard title="About">
                                            <VStack align="start" spacing={2}>
                                                <Text color="gray.600">
                                                    Member since {userData.date_joined}
                                                </Text>
                                                {volunteerData ? (
                                                    <Text color="gray.600">
                                                        Active volunteer in {volunteerData.region}
                                                    </Text>
                                                ) : (
                                                    <Button
                                                        leftIcon={<AddIcon />}
                                                        colorScheme="blue"
                                                        variant="outline"
                                                        onClick={() => navigate('/volunteer-register')}
                                                    >
                                                        Become a Volunteer
                                                    </Button>
                                                )}
                                            </VStack>
                                        </SectionCard>

                                        {volunteerData && (
                                            <>
                                                <SectionCard title="Skills">
                                                    <Wrap>
                                                        {volunteerData.skills?.map((skill, index) => (
                                                            <WrapItem key={index}>
                                                                <Tag
                                                                    size="md"
                                                                    borderRadius="full"
                                                                    variant="solid"
                                                                    colorScheme="blue"
                                                                >
                                                                    <TagLabel>{skill}</TagLabel>
                                                                </Tag>
                                                            </WrapItem>
                                                        ))}
                                                    </Wrap>
                                                </SectionCard>

                                                <SectionCard title="Availability">
                                                    <Wrap>
                                                        {volunteerData.availability?.map((time, index) => (
                                                            <WrapItem key={index}>
                                                                <Tag
                                                                    size="md"
                                                                    borderRadius="full"
                                                                    variant="solid"
                                                                    colorScheme="green"
                                                                >
                                                                    <TagLabel>{time}</TagLabel>
                                                                </Tag>
                                                            </WrapItem>
                                                        ))}
                                                    </Wrap>
                                                </SectionCard>
                                            </>
                                        )}
                                    </Grid>
                                </TabPanel>

                                {volunteerData && (
                                    <TabPanel>
                                        <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6}>
                                            <SectionCard title="Recent Responses">
                                                <Text color="gray.600">No recent responses</Text>
                                            </SectionCard>
                                            
                                            <SectionCard title="Certifications">
                                                <Text color="gray.600">No certifications added yet</Text>
                                            </SectionCard>
                                        </Grid>
                                    </TabPanel>
                                )}

                                <TabPanel>
                                    <SectionCard title="Recent Activity">
                                        <Text color="gray.600">No recent activity</Text>
                                    </SectionCard>
                                </TabPanel>

                                <TabPanel>
                                    <SectionCard title="Account Settings">
                                        <VStack spacing={4} align="start">
                                            <Button colorScheme="blue" variant="outline">
                                                Change Password
                                            </Button>
                                            <Button colorScheme="blue" variant="outline">
                                                Notification Settings
                                            </Button>
                                            <Button colorScheme="red" variant="outline">
                                                Delete Account
                                            </Button>
                                        </VStack>
                                    </SectionCard>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </GridItem>
                </Grid>
            </Box>

            {/* Edit Profile Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Edit Profile</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={6}>
                            <FormControl>
                                <FormLabel>Name</FormLabel>
                                <Input
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({
                                        ...editForm,
                                        name: e.target.value
                                    })}
                                />
                            </FormControl>

                            {volunteerData && (
                                <>
                                    <FormControl>
                                        <FormLabel>Region</FormLabel>
                                        <Input
                                            value={editForm.region}
                                            onChange={(e) => setEditForm({
                                                ...editForm,
                                                region: e.target.value
                                            })}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Skills</FormLabel>
                                        <Wrap mb={2}>
                                            {editForm.skills.map((skill, index) => (
                                                <WrapItem key={index}>
                                                    <Tag
                                                        size="md"
                                                        borderRadius="full"
                                                        variant="solid"
                                                        colorScheme="blue"
                                                    >
                                                        <TagLabel>{skill}</TagLabel>
                                                        <TagCloseButton
                                                            onClick={() => {
                                                                const newSkills = [...editForm.skills];
                                                                newSkills.splice(index, 1);
                                                                setEditForm({
                                                                    ...editForm,
                                                                    skills: newSkills
                                                                });
                                                            }}
                                                        />
                                                    </Tag>
                                                </WrapItem>
                                            ))}
                                        </Wrap>
                                        <HStack>
                                            <Input
                                                value={editForm.newSkill}
                                                onChange={(e) => setEditForm({
                                                    ...editForm,
                                                    newSkill: e.target.value
                                                })}
                                                placeholder="Add a new skill"
                                            />
                                            <IconButton
                                                icon={<AddIcon />}
                                                onClick={() => {
                                                    if (editForm.newSkill.trim()) {
                                                        setEditForm({
                                                            ...editForm,
                                                            skills: [...editForm.skills, editForm.newSkill.trim()],
                                                            newSkill: ''
                                                        });
                                                    }
                                                }}
                                            />
                                        </HStack>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Availability</FormLabel>
                                        <Wrap mb={2}>
                                            {editForm.availability.map((time, index) => (
                                                <WrapItem key={index}>
                                                    <Tag
                                                        size="md"
                                                        borderRadius="full"
                                                        variant="solid"
                                                        colorScheme="green"
                                                    >
                                                        <TagLabel>{time}</TagLabel>
                                                        <TagCloseButton
                                                            onClick={() => {
                                                                const newAvailability = [...editForm.availability];
                                                                newAvailability.splice(index, 1);
                                                                setEditForm({
                                                                    ...editForm,
                                                                    availability: newAvailability
                                                                });
                                                            }}
                                                        />
                                                    </Tag>
                                                </WrapItem>
                                            ))}
                                        </Wrap>
                                        <HStack>
                                            <Select
                                                value={editForm.newAvailability}
                                                onChange={(e) => setEditForm({
                                                    ...editForm,
                                                    newAvailability: e.target.value
                                                })}
                                                placeholder="Select availability"
                                            >
                                                {availabilityOptions.map((option) => (
                                                    <option key={option} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </Select>
                                            <IconButton
                                                icon={<AddIcon />}
                                                onClick={() => {
                                                    if (editForm.newAvailability) {
                                                        setEditForm({
                                                            ...editForm,
                                                            availability: [...editForm.availability, editForm.newAvailability],
                                                            newAvailability: ''
                                                        });
                                                    }
                                                }}
                                            />
                                        </HStack>
                                    </FormControl>
                                </>
                            )}
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="blue" onClick={handleEditSubmit}>
                            Save Changes
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
} 