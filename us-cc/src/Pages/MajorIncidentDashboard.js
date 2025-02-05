import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

    useEffect(() => {
        if (id) {
            fetchIncidentData();
        }
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

            // Update stats
            setStats({
                totalVolunteers: volunteers.length,
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
                        <Button
                            colorScheme="blue"
                            leftIcon={<AddIcon />}
                            onClick={() => {/* Handle post update */ }}
                        >
                            Post Update
                        </Button>
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
                        {/* Left Column */}
                        <Box gridColumn="span 8">
                            <Tabs>
                                <TabList>
                                    <Tab>Overview</Tab>
                                    <Tab>Updates</Tab>
                                    <Tab>Organizations</Tab>
                                    <Tab>Resources</Tab>
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

                                    {/* Resources Tab */}
                                    <TabPanel>
                                        <Text>Resources management coming soon...</Text>
                                    </TabPanel>
                                </TabPanels>
                            </Tabs>
                        </Box>

                        {/* Right Column - Communication Channel */}
                        <Box gridColumn="span 4">
                            <Box bg="white" p={4} borderRadius="lg" shadow="sm" height="100%">
                                <OrganizationChannel
                                    majorIncidentId={id}
                                />
                            </Box>
                        </Box>
                    </Grid>
                </VStack>
            </Container>
        </Box>
    );
};

export default MajorIncidentDashboard;