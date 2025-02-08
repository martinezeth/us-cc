import React, { useState, useEffect } from 'react';
import {
    Grid,
    VStack,
    HStack,
    Text,
    Badge,
    Tag,
    TagLabel,
    Wrap,
    WrapItem,
    Box,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Heading,
    useToast,
    Button
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
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

const ProfileTabs = ({ profileData, volunteerData, isOwnProfile }) => {
    const [posts, setPosts] = useState([]);
    const [opportunities, setOpportunities] = useState([]);
    const [likedPosts, setLikedPosts] = useState([]);
    const [opportunityHistory, setOpportunityHistory] = useState([]);
    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        fetchActivityData();
    }, [profileData.id]);

    const fetchActivityData = async () => {
        try {
            // Fetch user's posts
            const { data: userPosts } = await supabase
                .from('posts')
                .select('*')
                .eq('user_id', profileData.id)
                .order('date_posted', { ascending: false });

            setPosts(userPosts || []);

            // If organization, fetch their opportunities
            if (profileData.is_organization) {
                const { data: orgOpportunities } = await supabase
                    .from('volunteer_opportunities')
                    .select('*')
                    .eq('organization_id', profileData.id)
                    .order('created_at', { ascending: false });

                setOpportunities(orgOpportunities || []);
            }

            // Fetch volunteer opportunity history with organization info
            const { data: opportunityResponses } = await supabase
                .from('opportunity_responses')
                .select(`
                    *,
                    volunteer_opportunities (
                        title,
                        description,
                        location,
                        event_date,
                        organization_id,
                        status
                    )
                `)
                .eq('volunteer_id', profileData.id)
                .order('response_date', { ascending: false });

            // If we have responses, fetch the organization names
            if (opportunityResponses && opportunityResponses.length > 0) {
                // Get unique organization IDs
                const orgIds = [...new Set(opportunityResponses
                    .map(r => r.volunteer_opportunities?.organization_id)
                    .filter(Boolean))];

                // Fetch organization profiles
                const { data: orgProfiles } = await supabase
                    .from('profiles')
                    .select('id, full_name, organization_name')
                    .in('id', orgIds);

                // Create a lookup map for organization names
                const orgNameMap = {};
                orgProfiles?.forEach(profile => {
                    orgNameMap[profile.id] = profile.organization_name || profile.full_name;
                });

                // Add organization names to the responses
                const responsesWithOrgNames = opportunityResponses.map(response => ({
                    ...response,
                    volunteer_opportunities: {
                        ...response.volunteer_opportunities,
                        organization_name: orgNameMap[response.volunteer_opportunities?.organization_id] || 'Unknown Organization'
                    }
                }));

                setOpportunityHistory(responsesWithOrgNames);
            } else {
                setOpportunityHistory([]);
            }

            // Fetch liked posts if it's own profile
            if (isOwnProfile) {
                const { data: likes } = await supabase
                    .from('post_likes')
                    .select(`
                        *,
                        posts (
                            *,
                            user_name,
                            user_username
                        )
                    `)
                    .eq('user_id', profileData.id)
                    .order('created_at', { ascending: false });

                setLikedPosts(likes?.map(like => like.posts).filter(Boolean) || []);
            }
        } catch (error) {
            console.error('Error fetching activity:', error);
            toast({
                title: "Error",
                description: "Failed to load activity data",
                status: "error",
                duration: 3000
            });
        }
    };

    const PostsList = ({ posts }) => (
        <VStack spacing={4} align="stretch">
            {posts.map(post => (
                <Box
                    key={post.id}
                    p={4}
                    bg="white"
                    borderRadius="md"
                    boxShadow="sm"
                    borderWidth="1px"
                    borderColor="gray.100"
                    cursor="pointer"
                    onClick={() => navigate(`/posts/${post.user_username}`)}
                    _hover={{ boxShadow: "md" }}
                >
                    <Heading size="md" mb={2}>{post.title}</Heading>
                    <Text noOfLines={2} color="gray.600">{post.body}</Text>
                    <HStack mt={2} spacing={4} color="gray.500">
                        <Text fontSize="sm">
                            {new Date(post.date_posted).toLocaleDateString()}
                        </Text>
                        {post.city && (
                            <Text fontSize="sm">
                                📍 {post.city}, {post.state}
                            </Text>
                        )}
                    </HStack>
                </Box>
            ))}
            {posts.length === 0 && (
                <Text color="gray.500" textAlign="center">No posts yet</Text>
            )}
        </VStack>
    );

    const VolunteerHistory = ({ history }) => (
        <VStack spacing={4} align="stretch">
            {history.map(response => (
                <Box
                    key={response.id}
                    p={4}
                    bg="white"
                    borderRadius="md"
                    boxShadow="sm"
                    borderWidth="1px"
                    borderColor="gray.100"
                >
                    <Heading size="md" mb={2}>
                        {response.volunteer_opportunities?.title}
                    </Heading>
                    <Text color="gray.600" mb={2}>
                        {response.volunteer_opportunities?.description}
                    </Text>
                    <HStack spacing={4} mt={4}>
                        <Badge colorScheme={
                            response.status === 'accepted' ? 'green' :
                                response.status === 'pending' ? 'yellow' : 'red'
                        }>
                            {response.status}
                        </Badge>
                        <Text fontSize="sm" color="gray.500">
                            📍 {response.volunteer_opportunities?.location}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                            {new Date(response.response_date).toLocaleDateString()}
                        </Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.500" mt={2}>
                        Organization: {response.volunteer_opportunities?.organization_name || 'Unknown Organization'}
                    </Text>
                    {isOwnProfile && (
                        <Button
                            size="sm"
                            colorScheme="red"
                            variant="outline"
                            onClick={() => handleUnregister(response.opportunity_id)}
                            ml="auto"
                        >
                            Unregister
                        </Button>
                    )}
                </Box>
            ))}
            {history.length === 0 && (
                <Text color="gray.500" textAlign="center">No volunteer history yet</Text>
            )}
        </VStack>
    );

    const handleUnregister = async (opportunityId) => {
        try {
            // Get the current response to check its status
            const { data: currentResponse } = await supabase
                .from('opportunity_responses')
                .select('status')
                .eq('volunteer_id', profileData.id)
                .eq('opportunity_id', opportunityId)
                .single();

            // Only decrement if the response was 'accepted'
            const wasAccepted = currentResponse?.status === 'accepted';
            
            // Update response status to cancelled
            const { error: responseError } = await supabase
                .from('opportunity_responses')
                .update({ status: 'cancelled' })
                .eq('volunteer_id', profileData.id)
                .eq('opportunity_id', opportunityId);

            if (responseError) throw responseError;

            // If it was accepted, update the opportunity's registered_volunteers count
            if (wasAccepted) {
                const { error: opportunityError } = await supabase
                    .from('volunteer_opportunities')
                    .update({ 
                        registered_volunteers: supabase.raw('GREATEST(COALESCE(registered_volunteers, 0) - 1, 0)')
                    })
                    .eq('id', opportunityId);

                if (opportunityError) throw opportunityError;
            }

            // Refresh the activity data
            fetchActivityData();

            toast({
                title: "Successfully unregistered",
                description: "You have been removed from this opportunity",
                status: "success",
                duration: 5000,
            });
        } catch (error) {
            console.error('Error unregistering:', error);
            toast({
                title: "Error",
                description: error.message,
                status: "error",
                duration: 5000
            });
        }
    };

    const OpportunitiesList = ({ opportunities }) => (
        <VStack spacing={4} align="stretch">
            {opportunities.map(opp => (
                <Box
                    key={opp.id}
                    p={4}
                    bg="white"
                    borderRadius="md"
                    boxShadow="sm"
                    borderWidth="1px"
                    borderColor="gray.100"
                >
                    <Heading size="md" mb={2}>{opp.title}</Heading>
                    <Text noOfLines={2} color="gray.600">{opp.description}</Text>
                    <HStack mt={2} spacing={4} color="gray.500">
                        <Badge colorScheme={opp.archived_at ? 'gray' : 'green'}>
                            {opp.archived_at ? 'Archived' : 'Active'}
                        </Badge>
                        <Text fontSize="sm">
                            📍 {opp.location}
                        </Text>
                    </HStack>
                </Box>
            ))}
            {opportunities.length === 0 && (
                <Text color="gray.500" textAlign="center">No opportunities posted yet</Text>
            )}
        </VStack>
    );

    return (
        <Tabs variant="enclosed" colorScheme="blue">
            <TabList>
                <Tab>Overview</Tab>
                <Tab>Posts</Tab>
                {profileData.is_organization ? (
                    <Tab>Opportunities</Tab>
                ) : (
                    <>
                        <Tab>Volunteer Activity</Tab>
                        {isOwnProfile && <Tab>Liked Posts</Tab>}
                    </>
                )}
            </TabList>

            <TabPanels>
                {/* Overview Tab */}
                <TabPanel>
                    <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
                        <SectionCard title="About">
                            <VStack align="start" spacing={3}>
                                <Text color="gray.600">
                                    Member since {new Date(profileData.date_joined).toLocaleDateString()}
                                </Text>
                                {/* Show organization info if it's an organization */}
                                {profileData.is_organization ? (
                                    <>
                                        {profileData.phone && (
                                            <Text color="gray.600">
                                                📞 {profileData.phone}
                                            </Text>
                                        )}
                                        {profileData.address && (
                                            <Text color="gray.600">
                                                📍 {profileData.address}
                                            </Text>
                                        )}
                                        {profileData.mission_statement && (
                                            <Box mt={2}>
                                                <Text fontWeight="medium" mb={1}>Mission Statement</Text>
                                                <Text color="gray.600">{profileData.mission_statement}</Text>
                                            </Box>
                                        )}
                                    </>
                                ) : (
                                    /* Show volunteer info if it's a volunteer profile */
                                    volunteerData && (
                                        <Text color="gray.600">
                                            Active volunteer in {volunteerData.city}
                                        </Text>
                                    )
                                )}
                            </VStack>
                        </SectionCard>

                        {/* Show volunteer cards if it's a volunteer profile */}
                        {!profileData.is_organization && volunteerData && (
                            <>
                                <SectionCard title="Skills">
                                    <Wrap>
                                        {volunteerData.skills?.map((skill, index) => (
                                            <WrapItem key={index}>
                                                <Tag size="md" borderRadius="full" variant="solid" colorScheme="blue">
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
                                                <Tag size="md" borderRadius="full" variant="solid" colorScheme="green">
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

                {/* Posts Tab */}
                <TabPanel>
                    <PostsList posts={posts} />
                </TabPanel>

                {/* Conditional Third Tab */}
                {profileData.is_organization ? (
                    <TabPanel>
                        <OpportunitiesList opportunities={opportunities} />
                    </TabPanel>
                ) : (
                    <>
                        <TabPanel>
                            <VolunteerHistory history={opportunityHistory} />
                        </TabPanel>
                        {isOwnProfile && (
                            <TabPanel>
                                <PostsList posts={likedPosts} />
                            </TabPanel>
                        )}
                    </>
                )}
            </TabPanels>
        </Tabs>
    );
};

export default ProfileTabs;