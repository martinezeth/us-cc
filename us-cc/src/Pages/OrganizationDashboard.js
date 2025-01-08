import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Grid,
    Heading,
    Text,
    Button,
    useDisclosure,
    VStack,
    HStack,
    Badge,
    Card,
    CardBody,
    CardHeader,
    Stat,
    StatLabel,
    StatNumber,
    StatGroup,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    useToast,
    Icon
} from '@chakra-ui/react';
import { AddIcon, WarningIcon } from '@chakra-ui/icons';
import { MdAssignment, MdAnnouncement } from 'react-icons/md';
import { supabase } from '../supabaseClient';
import CreateVolunteerOpportunityModal from '../Components/CreateVolunteerOpportunityModal';
import CreateIncidentModal from '../Components/CreateIncidentModal';
import CreatePostModal from '../Components/CreatePostModal';


const DashboardCard = ({ children, title }) => (
    <Card>
        <CardHeader>
            <Text fontSize="lg" fontWeight="semibold">{title}</Text>
        </CardHeader>
        <CardBody>{children}</CardBody>
    </Card>
);

const ContentCard = ({ item, type, onDelete }) => {
    const toast = useToast();

    const handleDelete = async () => {
        try {
            const table = type === 'opportunity' ? 'volunteer_opportunities' :
                type === 'post' ? 'posts' : 'incidents';

            const { error } = await supabase
                .from(table)
                .delete()
                .eq('id', item.id);

            if (error) throw error;

            toast({
                title: "Deleted Successfully",
                status: "success",
                duration: 3000
            });

            if (onDelete) onDelete(item.id);
        } catch (error) {
            toast({
                title: "Error",
                description: error.message,
                status: "error",
                duration: 5000
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <VStack align="start" spacing={2}>
                    <HStack justify="space-between" width="full">
                        <Heading size="md">{item.title || item.incident_type}</Heading>
                        {type === 'opportunity' && (
                            <Badge colorScheme={item.status === 'active' ? 'green' : 'gray'}>
                                {item.status}
                            </Badge>
                        )}
                    </HStack>
                    <Text color="gray.600" fontSize="sm">
                        Created {new Date(item.created_at || item.date_posted || item.timestamp).toLocaleDateString()}
                    </Text>
                </VStack>
            </CardHeader>
            <CardBody>
                <VStack align="start" spacing={4}>
                    <Text>{item.description || item.body}</Text>
                    {type === 'opportunity' && item.location && (
                        <Text fontSize="sm" color="gray.600">
                            Location: {item.location}
                            {item.radius_miles && ` (${item.radius_miles} mile radius)`}
                        </Text>
                    )}
                    {type === 'incident' && (
                        <Text fontSize="sm" color="gray.600">
                            Location: {item.location_lat.toFixed(6)}, {item.location_lng.toFixed(6)}
                        </Text>
                    )}
                    <Button size="sm" colorScheme="red" variant="ghost" onClick={handleDelete}>
                        Delete
                    </Button>
                </VStack>
            </CardBody>
        </Card>
    );
};

export default function OrganizationDashboard() {
    const [opportunities, setOpportunities] = useState([]);
    const [posts, setPosts] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [stats, setStats] = useState({
        activeOpportunities: 0,
        totalResponses: 0,
        volunteersEngaged: 0
    });

    const toast = useToast();
    const {
        isOpen: isOpportunityModalOpen,
        onOpen: onOpportunityModalOpen,
        onClose: onOpportunityModalClose
    } = useDisclosure();
    const {
        isOpen: isPostModalOpen,
        onOpen: onPostModalOpen,
        onClose: onPostModalClose
    } = useDisclosure();
    const {
        isOpen: isIncidentModalOpen,
        onOpen: onIncidentModalOpen,
        onClose: onIncidentModalClose
    } = useDisclosure();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Fetch opportunities
            const { data: opportunitiesData } = await supabase
                .from('volunteer_opportunities')
                .select('*')
                .eq('organization_id', user.id)
                .order('created_at', { ascending: false });

            setOpportunities(opportunitiesData || []);

            // Fetch posts
            const { data: postsData } = await supabase
                .from('posts')
                .select('*')
                .eq('user_id', user.id)
                .order('date_posted', { ascending: false });

            setPosts(postsData || []);

            // Fetch incidents
            const { data: incidentsData } = await supabase
                .from('incidents')
                .select('*')
                .eq('created_by', user.id)
                .order('timestamp', { ascending: false });

            setIncidents(incidentsData || []);

            // Calculate stats
            const activeCount = opportunitiesData?.filter(opp => opp.status === 'active').length || 0;

            const { data: responsesData } = await supabase
                .from('opportunity_responses')
                .select('volunteer_id')
                .in('opportunity_id', opportunitiesData?.map(opp => opp.id) || []);

            setStats({
                activeOpportunities: activeCount,
                totalResponses: responsesData?.length || 0,
                volunteersEngaged: new Set(responsesData?.map(r => r.volunteer_id))?.size || 0
            });

        } catch (error) {
            toast({
                title: "Error loading dashboard",
                description: error.message,
                status: "error",
                duration: 5000,
            });
        }
    };

    const handleDelete = (type) => (id) => {
        if (type === 'opportunity') {
            setOpportunities(opps => opps.filter(opp => opp.id !== id));
        } else if (type === 'post') {
            setPosts(posts => posts.filter(post => post.id !== id));
        } else if (type === 'incident') {
            setIncidents(incs => incs.filter(inc => inc.id !== id));
        }
    };

    return (
        <Box bg="gray.50" minH="90vh">
            <Container maxW="7xl" py={8}>
                <VStack spacing={8} align="stretch">
                    <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                            <Heading size="lg">Organization Dashboard</Heading>
                            <Text color="gray.600">Manage your content and opportunities</Text>
                        </VStack>
                        <HStack>
                            <Button
                                leftIcon={<Icon as={MdAssignment} />}
                                colorScheme="blue"
                                onClick={onOpportunityModalOpen}
                            >
                                New Opportunity
                            </Button>
                            <Button
                                leftIcon={<Icon as={MdAnnouncement} />}
                                colorScheme="green"
                                onClick={onPostModalOpen}
                            >
                                New Post
                            </Button>
                            <Button
                                leftIcon={<WarningIcon />}
                                colorScheme="red"
                                onClick={onIncidentModalOpen}
                            >
                                Report Incident
                            </Button>
                        </HStack>
                    </HStack>

                    <DashboardCard>
                        <StatGroup>
                            <Stat>
                                <StatLabel>Active Opportunities</StatLabel>
                                <StatNumber>{stats.activeOpportunities}</StatNumber>
                            </Stat>
                            <Stat>
                                <StatLabel>Total Responses</StatLabel>
                                <StatNumber>{stats.totalResponses}</StatNumber>
                            </Stat>
                            <Stat>
                                <StatLabel>Volunteers Engaged</StatLabel>
                                <StatNumber>{stats.volunteersEngaged}</StatNumber>
                            </Stat>
                        </StatGroup>
                    </DashboardCard>

                    <Tabs colorScheme="blue" variant="enclosed-colored">
                        <TabList>
                            <Tab>Opportunities ({opportunities.length})</Tab>
                            <Tab>Posts ({posts.length})</Tab>
                            <Tab>Incidents ({incidents.length})</Tab>
                        </TabList>

                        <TabPanels>
                            <TabPanel px={0}>
                                <Grid templateColumns="repeat(auto-fill, minmax(350px, 1fr))" gap={6}>
                                    {opportunities.map(opportunity => (
                                        <ContentCard
                                            key={opportunity.id}
                                            item={opportunity}
                                            type="opportunity"
                                            onDelete={handleDelete('opportunity')}
                                        />
                                    ))}
                                </Grid>
                            </TabPanel>

                            <TabPanel px={0}>
                                <Grid templateColumns="repeat(auto-fill, minmax(350px, 1fr))" gap={6}>
                                    {posts.map(post => (
                                        <ContentCard
                                            key={post.id}
                                            item={post}
                                            type="post"
                                            onDelete={handleDelete('post')}
                                        />
                                    ))}
                                </Grid>
                            </TabPanel>

                            <TabPanel px={0}>
                                <Grid templateColumns="repeat(auto-fill, minmax(350px, 1fr))" gap={6}>
                                    {incidents.map(incident => (
                                        <ContentCard
                                            key={incident.id}
                                            item={incident}
                                            type="incident"
                                            onDelete={handleDelete('incident')}
                                        />
                                    ))}
                                </Grid>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </VStack>
            </Container>

            <CreateVolunteerOpportunityModal
                isOpen={isOpportunityModalOpen}
                onClose={onOpportunityModalClose}
                type="opportunity"
                onSuccess={fetchDashboardData}
            />
            <CreatePostModal
                isOpen={isPostModalOpen}
                onClose={onPostModalClose}
                type="post"
                onSuccess={fetchDashboardData}
            />
            <CreateIncidentModal
                isOpen={isIncidentModalOpen}
                onClose={onIncidentModalClose}
                onCreateSuccess={fetchDashboardData}
            />
        </Box>
    );
}