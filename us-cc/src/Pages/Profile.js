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
    Tag,
    TagLabel,
    Wrap,
    WrapItem,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Alert,
    AlertIcon,
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import { supabase } from '../supabaseClient';

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
    const [profileData, setProfileData] = useState(null);
    const [volunteerData, setVolunteerData] = useState(null);
    const [opportunityResponses, setOpportunityResponses] = useState([]);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [loading, setLoading] = useState(true);
    const { username } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        fetchProfileData();
    }, [username]);

    const fetchProfileData = async () => {
        try {
            setLoading(true);

            // Get current authenticated user
            const { data: { user: currentUser } } = await supabase.auth.getUser();

            if (!currentUser) {
                toast({
                    title: "Authentication required",
                    description: "Please login to view profiles",
                    status: "error",
                    duration: 5000,
                });
                navigate('/login');
                return;
            }

            // Check if viewing own profile
            const isOwn = currentUser.email.split('@')[0] === username;
            setIsOwnProfile(isOwn);

            // If viewing own profile, use current user's ID
            let targetUserId = isOwn ? currentUser.id : null;

            // If viewing someone else's profile, we can look up their posts first
            if (!isOwn) {
                // Find a post by this username to get their user_id
                const { data: posts, error: postsError } = await supabase
                    .from('posts')
                    .select('user_id')
                    .eq('user_username', username)
                    .limit(1)
                    .single();

                if (postsError) {
                    // If no posts found, try checking volunteer_signups
                    const { data: volunteer, error: volunteerError } = await supabase
                        .from('volunteer_signups')
                        .select('user_id')
                        .eq('user_id', username)
                        .limit(1)
                        .single();

                    if (volunteerError) {
                        throw new Error("User not found");
                    }
                    targetUserId = volunteer.user_id;
                } else {
                    targetUserId = posts.user_id;
                }
            }

            // Fetch the profile data
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', targetUserId)
                .single();

            if (profileError) throw profileError;

            // Set profile data
            setProfileData({
                id: targetUserId,
                name: profile.full_name || username,
                username: username,
                date_joined: new Date(currentUser.created_at).toLocaleDateString(),
                city: profile.city || null,
                state: profile.state || null
            });

            // Fetch volunteer data if exists
            const { data: volunteerInfo } = await supabase
                .from('volunteer_signups')
                .select('*')
                .eq('user_id', targetUserId)
                .single();

            if (volunteerInfo) {
                setVolunteerData(volunteerInfo);
            }

            // Fetch opportunity responses
            const { data: responses } = await supabase
                .from('opportunity_responses')
                .select(`
                    *,
                    volunteer_opportunities (
                        title,
                        description,
                        event_date,
                        status,
                        location
                    )
                `)
                .eq('volunteer_id', targetUserId)
                .order('response_date', { ascending: false });

            setOpportunityResponses(responses || []);

        } catch (error) {
            console.error('Error fetching profile:', error);
            if (error.message === "User not found") {
                toast({
                    title: "Profile not found",
                    description: `Could not find profile for user "${username}"`,
                    status: "error",
                    duration: 5000,
                });
                // Stay on the page for a moment so user can read the error
                setTimeout(() => navigate('/'), 2000);
            } else {
                toast({
                    title: "Error",
                    description: `Failed to load profile: ${error.message}`,
                    status: "error",
                    duration: 5000,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box minH="90vh" display="flex" alignItems="center" justifyContent="center">
                <Text>Loading...</Text>
            </Box>
        );
    }

    if (!profileData) {
        return (
            <Box minH="90vh" display="flex" alignItems="center" justifyContent="center">
                <Alert status="error">
                    <AlertIcon />
                    Profile not found
                </Alert>
            </Box>
        );
    }

    return (
        <Box minH="90vh" bg="gray.50" pt={8} pb={12}>
            <Box maxW="7xl" mx="auto" px={4}>
                <Grid templateColumns={{ base: "1fr", lg: "300px 1fr" }} gap={8}>
                    {/* Left Sidebar */}
                    <GridItem>
                        <VStack spacing={6}>
                            <SectionCard>
                                <VStack spacing={4} align="center">
                                    <Avatar
                                        size="2xl"
                                        name={profileData.name}
                                    />
                                    <VStack spacing={1}>
                                        <Text fontSize="xl" fontWeight="bold">
                                            {profileData.name}
                                        </Text>
                                        <Text color="gray.500">
                                            @{profileData.username}
                                        </Text>
                                        {profileData.city && (
                                            <Text color="gray.500" fontSize="sm">
                                                📍 {profileData.city}, {profileData.state}
                                            </Text>
                                        )}
                                        {volunteerData && (
                                            <Badge colorScheme="green" px={2} py={1}>
                                                Volunteer
                                            </Badge>
                                        )}
                                    </VStack>
                                    {isOwnProfile && (
                                        <Button
                                            leftIcon={<EditIcon />}
                                            size="sm"
                                            onClick={() => navigate('/profile/edit')}
                                        >
                                            Edit Profile
                                        </Button>
                                    )}
                                </VStack>
                            </SectionCard>

                            {volunteerData && (
                                <SectionCard title="Volunteer Stats">
                                    <VStack spacing={4}>
                                        <StatCard
                                            label="Incidents Responded"
                                            value={volunteerData.incidents_responded || "0"}
                                            helpText="Last 30 days"
                                        />
                                        <StatCard
                                            label="Hours Volunteered"
                                            value={volunteerData.hours_volunteered || "0"}
                                            helpText="Total hours"
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
                            </TabList>

                            <TabPanels>
                                <TabPanel>
                                    <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
                                        <SectionCard title="About">
                                            <VStack align="start" spacing={2}>
                                                <Text color="gray.600">
                                                    Member since {profileData.date_joined}
                                                </Text>
                                                {volunteerData && (
                                                    <Text color="gray.600">
                                                        Active volunteer in {volunteerData.city}
                                                    </Text>
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
                                        <SectionCard title="Recent Activity">
                                            {opportunityResponses.length === 0 ? (
                                                <Text color="gray.600">No recent activity</Text>
                                            ) : (
                                                <VStack spacing={4} align="stretch">
                                                    {opportunityResponses.map((response) => (
                                                        <Box
                                                            key={response.id}
                                                            p={4}
                                                            borderWidth="1px"
                                                            borderRadius="md"
                                                            _hover={{ bg: 'gray.50' }}
                                                        >
                                                            <Text fontWeight="bold">
                                                                {response.volunteer_opportunities.title}
                                                            </Text>
                                                            <Text color="gray.600" fontSize="sm">
                                                                {new Date(response.response_date).toLocaleDateString()}
                                                            </Text>
                                                        </Box>
                                                    ))}
                                                </VStack>
                                            )}
                                        </SectionCard>
                                    </TabPanel>
                                )}

                                <TabPanel>
                                    <SectionCard title="Recent Activity">
                                        <Text color="gray.600">No recent activity to display</Text>
                                    </SectionCard>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </GridItem>
                </Grid>
            </Box>
        </Box>
    );
}