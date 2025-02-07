import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Grid,
    VStack,
    HStack,
    Text,
    Button,
    Badge,
    Stat,
    StatLabel,
    StatNumber,
    StatGroup,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    useToast,
    Icon,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Container,
    Heading,
    Divider,
    Flex,
    Avatar
} from '@chakra-ui/react';
import { WarningIcon, AddIcon } from '@chakra-ui/icons';
import { supabase } from '../supabaseClient';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import OrganizationChannel from '../Components/OrganizationChannel';
import JoinResponseButton from '../Components/JoinResponseButton';
import VolunteerPool from '../Components/VolunteerPool';
import VolunteerPoolHeader from '../Components/VolunteerPoolHeader';
import MajorIncidentOpportunities from '../Components/MajorIncidentOpportunities';

const MajorIncidentDashboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeIncident, setActiveIncident] = useState(null);
    const [organizations, setOrganizations] = useState([]);
    const [updates, setUpdates] = useState([]);
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalVolunteers: 0,
        activeOrganizations: 0,
        totalUpdates: 0
    });
    const toast = useToast();
    const [isOrganization, setIsOrganization] = useState(false);
    const [isParticipating, setIsParticipating] = useState(false);
    const [isVolunteer, setIsVolunteer] = useState(false);
    const [isInPool, setIsInPool] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (id) {
            fetchIncidentData();
            checkParticipationStatus();
        }
        checkUserStatus();
    }, [id]);

    useEffect(() => {
        if (!id) return;

        const channel = supabase
            .channel(`major-incident-stats-${id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'major_incident_volunteer_pool',
                filter: `major_incident_id=eq.${id}`
            }, () => {
                fetchIncidentData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [id]);

    const fetchIncidentData = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            // Fetch specific major incident data
            const { data: incident, error: incidentError } = await supabase
                .from('major_incidents')
                .select(`
                    *,
                    major_incident_organizations!inner(*),
                    major_incident_updates(*)
                `)
                .eq('id', id)
                .single();

            if (incidentError) throw incidentError;

            if (!incident) {
                toast({
                    title: "Error",
                    description: "Incident not found",
                    status: "error",
                    duration: 5000
                });
                navigate('/organization-dashboard');
                return;
            }

            setActiveIncident(incident);

            // Fetch organizations involved
            const { data: orgsData } = await supabase
                .from('major_incident_organizations')
                .select(`
                    *,
                    organization:profiles(*)
                `)
                .eq('major_incident_id', id);

            setOrganizations(orgsData || []);

            // Fetch updates
            const { data: updatesData } = await supabase
                .from('major_incident_updates')
                .select('*')
                .eq('major_incident_id', id)
                .order('created_at', { ascending: false });

            setUpdates(updatesData || []);

            // Fetch volunteer count
            const { count: volunteerCount } = await supabase
                .from('major_incident_volunteer_pool')
                .select('*', { count: 'exact' })
                .eq('major_incident_id', id);

            // Update stats with actual volunteer count
            setStats({
                totalVolunteers: volunteerCount || 0,
                activeOrganizations: orgsData?.length || 0,
                totalUpdates: updatesData?.length || 0
            });

        } catch (error) {
            console.error('Error loading incident:', error);
            toast({
                title: "Error loading incident",
                description: error.message,
                status: "error",
                duration: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    const checkParticipationStatus = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { data } = await supabase
                .from('major_incident_organizations')
                .select('id')
                .eq('major_incident_id', id)
                .eq('organization_id', user.id)
                .single();

            setIsParticipating(!!data);
        } catch (error) {
            console.error('Error checking participation:', error);
            setIsParticipating(false);
        }
    };

    const handleUnregister = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            const { error } = await supabase
                .from('major_incident_organizations')
                .delete()
                .eq('major_incident_id', id)
                .eq('organization_id', user.id);

            if (error) throw error;

            toast({
                title: "Unregistered Successfully",
                description: "You have been removed from this incident response effort",
                status: "success",
                duration: 3000
            });

            // Refresh participation status and data
            checkParticipationStatus();
            fetchIncidentData();
        } catch (error) {
            toast({
                title: "Error Unregistering",
                description: error.message,
                status: "error",
                duration: 5000
            });
        }
    };

    const checkUserStatus = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            
            if (user) {
                // Check if organization
                const isOrg = user?.user_metadata?.is_organization || false;
                setIsOrganization(isOrg);

                if (!isOrg) {
                    // Check if volunteer
                    const { data: volunteerData } = await supabase
                        .from('volunteer_signups')
                        .select('id')
                        .eq('user_id', user.id)
                        .single();
                    
                    setIsVolunteer(!!volunteerData);

                    if (volunteerData) {
                        // Check if already in pool
                        const { data: poolData } = await supabase
                            .from('major_incident_volunteer_pool')
                            .select('id')
                            .eq('major_incident_id', id)
                            .eq('volunteer_id', user.id)
                            .single();
                        
                        setIsInPool(!!poolData);
                    }
                }
            }
        } catch (error) {
            console.error('Error checking user status:', error);
        }
    };

    const handleJoinPool = async () => {
        try {
            const { error } = await supabase
                .from('major_incident_volunteer_pool')
                .insert([{
                    major_incident_id: id,
                    volunteer_id: user.id
                }]);

            if (error) throw error;

            toast({
                title: "Success!",
                description: "You've joined the volunteer pool for this incident",
                status: "success",
                duration: 3000
            });

            setIsInPool(true);
            fetchIncidentData();
        } catch (error) {
            toast({
                title: "Error joining pool",
                description: error.message,
                status: "error",
                duration: 5000
            });
        }
    };

    const renderActionButton = () => {
        if (!user) {
            return (
                <Button
                    as={RouterLink}
                    to="/login"
                    colorScheme="blue"
                >
                    Login to Join Response
                </Button>
            );
        }

        if (isOrganization) {
            return isParticipating ? (
                <Button
                    colorScheme="red"
                    onClick={handleUnregister}
                >
                    Unregister from Effort
                </Button>
            ) : (
                <JoinResponseButton
                    majorIncidentId={id}
                    onJoinSuccess={fetchIncidentData}
                />
            );
        }

        if (!isVolunteer) {
            return (
                <Button
                    as={RouterLink}
                    to="/volunteer-signup"
                    colorScheme="blue"
                >
                    Register as Volunteer
                </Button>
            );
        }

        if (isInPool) {
            return (
                <Badge colorScheme="green" p={2} borderRadius="md">
                    Already in Volunteer Pool
                </Badge>
            );
        }

        return (
            <Button
                colorScheme="blue"
                onClick={handleJoinPool}
            >
                Join Volunteer Pool
            </Button>
        );
    };

    if (loading) {
        return (
            <Box p={8} textAlign="center">
                <Text>Loading incident data...</Text>
            </Box>
        );
    }

    if (!activeIncident) {
        return (
            <Box p={8} textAlign="center">
                <Alert status="error">
                    <AlertIcon />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>Incident not found or access denied.</AlertDescription>
                </Alert>
            </Box>
        );
    }

    return (
        <Box bg="gray.50" minH="90vh">
            <Container maxW="7xl" py={8}>
                <VStack spacing={8} align="stretch">
                    {/* Header */}
                    <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                            <HStack>
                                <Heading size="lg">
                                    {activeIncident.title}
                                </Heading>
                                <Badge
                                    colorScheme={
                                        activeIncident.severity_level === 'high' ? 'red' :
                                            activeIncident.severity_level === 'medium' ? 'orange' :
                                                'yellow'
                                    }
                                >
                                    {activeIncident.severity_level.toUpperCase()}
                                </Badge>
                            </HStack>
                            <Text color="gray.600">
                                Impact Radius: {activeIncident.radius_miles} miles |
                                Status: {activeIncident.status} |
                                Created: {new Date(activeIncident.created_at).toLocaleDateString()}
                            </Text>
                        </VStack>
                        <HStack>
                            {renderActionButton()}
                            {isOrganization && isParticipating && (
                                <Button
                                    colorScheme="blue"
                                    leftIcon={<AddIcon />}
                                    onClick={() => {/* Handle post update */}}
                                >
                                    Post Update
                                </Button>
                            )}
                        </HStack>
                    </HStack>

                    {/* Stats */}
                    <StatGroup bg="white" p={6} borderRadius="lg" shadow="sm">
                        <Stat>
                            <StatLabel>Organizations</StatLabel>
                            <StatNumber>{stats.activeOrganizations}</StatNumber>
                        </Stat>
                        <Stat>
                            <StatLabel>Volunteers</StatLabel>
                            <StatNumber>{stats.totalVolunteers}</StatNumber>
                        </Stat>
                        <Stat>
                            <StatLabel>Updates</StatLabel>
                            <StatNumber>{stats.totalUpdates}</StatNumber>
                        </Stat>
                    </StatGroup>

                    {/* Main Content */}
                    <Grid templateColumns="repeat(12, 1fr)" gap={6}>
                        {/* Left Column - Always show but adjust width based on participation */}
                        <Box gridColumn={isParticipating ? "span 8" : "span 12"}>
                            <Tabs>
                                <TabList>
                                    <Tab>Overview</Tab>
                                    <Tab>Organizations</Tab>
                                    <Tab>Updates</Tab>
                                    <Tab>Opportunities</Tab>
                                    {isParticipating && <Tab>Volunteer Pool</Tab>}
                                </TabList>

                                <TabPanels>
                                    <TabPanel>
                                        <VStack spacing={6} align="stretch">
                                            {/* Map */}
                                            <Box height="400px" borderRadius="lg" overflow="hidden">
                                                <MapContainer
                                                    center={[activeIncident.location_lat, activeIncident.location_lng]}
                                                    zoom={11}
                                                    style={{ height: '100%', width: '100%' }}
                                                >
                                                    <TileLayer
                                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                    />
                                                    <Circle
                                                        center={[activeIncident.location_lat, activeIncident.location_lng]}
                                                        radius={activeIncident.radius_miles * 1609.34} // Convert miles to meters
                                                        color="red"
                                                        fillColor="red"
                                                        fillOpacity={0.2}
                                                    >
                                                        <Popup>
                                                            Impact Zone
                                                        </Popup>
                                                    </Circle>
                                                </MapContainer>
                                            </Box>

                                            {/* Description */}
                                            <Box bg="white" p={6} borderRadius="lg" shadow="sm">
                                                <Heading size="md" mb={4}>Description</Heading>
                                                <Text>{activeIncident.description}</Text>
                                            </Box>
                                        </VStack>
                                    </TabPanel>

                                    {/* Organizations Tab */}
                                    <TabPanel>
                                        <VStack spacing={4} align="stretch">
                                            {organizations.map(org => (
                                                <Box
                                                    key={org.id}
                                                    p={6}
                                                    bg="white"
                                                    borderRadius="lg"
                                                    shadow="sm"
                                                >
                                                    <HStack spacing={4}>
                                                        <Avatar
                                                            name={org.organization?.organization_name}
                                                            size="md"
                                                        />
                                                        <VStack align="start" spacing={1}>
                                                            <Text fontWeight="bold">
                                                                {org.organization?.organization_name}
                                                            </Text>
                                                            <Badge>{org.role}</Badge>
                                                            <Text fontSize="sm" color="gray.500">
                                                                Joined: {new Date(org.joined_at).toLocaleDateString()}
                                                            </Text>
                                                        </VStack>
                                                    </HStack>
                                                </Box>
                                            ))}
                                        </VStack>
                                    </TabPanel>

                                    {/* Updates Tab */}
                                    <TabPanel>
                                        <VStack spacing={4} align="stretch">
                                            {updates.map(update => (
                                                <Box
                                                    key={update.id}
                                                    p={6}
                                                    bg="white"
                                                    borderRadius="lg"
                                                    shadow="sm"
                                                >
                                                    <HStack justify="space-between" mb={2}>
                                                        <Badge
                                                            colorScheme={
                                                                update.priority_level === 'emergency' ? 'red' :
                                                                    update.priority_level === 'urgent' ? 'orange' :
                                                                        'blue'
                                                            }
                                                        >
                                                            {update.priority_level}
                                                        </Badge>
                                                        <Text fontSize="sm" color="gray.500">
                                                            {new Date(update.created_at).toLocaleString()}
                                                        </Text>
                                                    </HStack>
                                                    <Text>{update.content}</Text>
                                                </Box>
                                            ))}
                                        </VStack>
                                    </TabPanel>

                                    <TabPanel>
                                        <MajorIncidentOpportunities
                                            majorIncidentId={id}
                                            majorIncidentData={activeIncident}
                                        />
                                    </TabPanel>

                                    {isParticipating && (
                                        <TabPanel>
                                            <VolunteerPoolHeader
                                                majorIncidentId={id}
                                                onVolunteerJoin={fetchIncidentData}
                                            />
                                            <VolunteerPool
                                                majorIncidentId={id}
                                            />
                                        </TabPanel>
                                    )}
                                </TabPanels>
                            </Tabs>
                        </Box>

                        {/* Right Column - Only show when participating */}
                        {isParticipating && (
                            <Box gridColumn="span 4">
                                <Box bg="white" p={4} borderRadius="lg" shadow="sm" height="100%">
                                    <OrganizationChannel
                                        majorIncidentId={id}
                                    />
                                </Box>
                            </Box>
                        )}
                    </Grid>

                    {/* Add a call-to-action for non-participating organizations */}
                    {!isParticipating && isOrganization && (
                        <Box mt={6} p={6} bg="blue.50" borderRadius="lg" textAlign="center">
                            <Text fontSize="lg" mb={3}>
                                Join this incident response effort to access additional features like the volunteer pool and coordination channels.
                            </Text>
                            <JoinResponseButton
                                majorIncidentId={id}
                                onJoinSuccess={fetchIncidentData}
                            />
                        </Box>
                    )}
                </VStack>
            </Container>
        </Box>
    );
};

export default MajorIncidentDashboard;