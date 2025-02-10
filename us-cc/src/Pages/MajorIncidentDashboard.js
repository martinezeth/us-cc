import React, { useState, useEffect, useRef } from 'react';
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
    Avatar,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    IconButton
} from '@chakra-ui/react';
import { WarningIcon, AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { supabase } from '../supabaseClient';
import { MapContainer, TileLayer, Circle, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import OrganizationChannel from '../Components/OrganizationChannel';
import JoinResponseButton from '../Components/JoinResponseButton';
import VolunteerPool from '../Components/VolunteerPool';
import VolunteerPoolHeader from '../Components/VolunteerPoolHeader';
import MajorIncidentOpportunities from '../Components/MajorIncidentOpportunities';
import { handleProfileClick } from '../utils/navigationHelpers';
import { MdCenterFocusWeak } from 'react-icons/md';
import VolunteerStatusBoard from '../Components/VolunteerStatusBoard';
import CreateUpdateModal from '../Components/CreateUpdateModal';

const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const getZoomLevel = (radiusMiles) => {
    if (radiusMiles <= 5) return 11;
    if (radiusMiles <= 10) return 10;
    if (radiusMiles <= 25) return 9;
    if (radiusMiles <= 50) return 8;
    if (radiusMiles <= 100) return 7;
    return 6;
};

const RecenterButton = ({ position, radius }) => {
    const map = useMap();

    const handleRecenter = () => {
        const zoom = getZoomLevel(radius);
        map.setView(position, zoom);
    };

    return (
        <div className="leaflet-bottom leaflet-right" style={{ marginBottom: "20px", marginRight: "10px" }}>
            <Button
                onClick={handleRecenter}
                className="leaflet-control"
                colorScheme="blue"
                size="sm"
                leftIcon={<Icon as={MdCenterFocusWeak} />}
            >
                Re-center
            </Button>
        </div>
    );
};

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
    const [volunteerPoolRefresh, setVolunteerPoolRefresh] = useState(0);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
    const cancelRef = useRef();

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
            const { data: incident, error } = await supabase
                .from('major_incidents')
                .select(`
                    *,
                    major_incident_organizations!inner(*),
                    major_incident_updates(*)
                `)
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // Incident not found
                    toast({
                        title: "Incident Not Found",
                        description: "This major incident may have been deleted",
                        status: "error",
                        duration: 5000
                    });
                    navigate('/organization-dashboard');
                    return;
                }
                throw error;
            }

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
                .select(`
                    *,
                    organization:profiles(id, organization_name)
                `)
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

    const handleOpportunityStatusChange = () => {
        setVolunteerPoolRefresh(prev => prev + 1);
    };

    const handleCreateUpdate = async (updateData) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            const { error } = await supabase
                .from('major_incident_updates')
                .insert([{
                    major_incident_id: id,
                    organization_id: user.id,
                    content: updateData.content,
                    priority_level: updateData.priority_level,
                    update_type: updateData.update_type
                }]);

            if (error) throw error;

            toast({
                title: "Update Posted",
                description: "Your update has been successfully posted",
                status: "success",
                duration: 3000,
            });

            // Refresh the updates list
            fetchIncidentData();
            setIsUpdateModalOpen(false);
        } catch (error) {
            toast({
                title: "Error",
                description: error.message,
                status: "error",
                duration: 5000,
            });
        }
    };

    const handleArchiveIncident = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (activeIncident.status === 'archived') {
                // Unarchive
                const { error } = await supabase
                    .from('major_incidents')
                    .update({ 
                        status: 'active',
                        archived_at: null,
                        archived_by: null
                    })
                    .eq('id', id);
                if (error) throw error;
            } else {
                // Archive
                const { error } = await supabase.rpc('archive_major_incident', {
                    incident_id: id,
                    archiving_user: user.id
                });
                if (error) throw error;
            }

            toast({
                title: "Major Incident Archived",
                description: activeIncident.status === 'archived' 
                    ? "The incident has been unarchived and reactivated"
                    : "The incident and related opportunities have been archived",
                status: "success",
                duration: 5000
            });

            // Refresh incident data
            fetchIncidentData();
            setIsArchiveDialogOpen(false);
        } catch (error) {
            toast({
                title: "Error",
                description: error.message,
                status: "error",
                duration: 5000
            });
        }
    };

    const handleDeleteIncident = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            // First soft delete the incident
            await supabase.rpc('soft_delete_major_incident', {
                incident_id: id
            });

            // First get all channels to handle their dependencies
            const { data: channels } = await supabase
                .from('coordination_channels')
                .select('id')
                .eq('major_incident_id', id);

            if (channels?.length > 0) {
                const channelIds = channels.map(c => c.id);
                
                // Delete messages first
                await supabase
                    .from('coordination_messages')
                    .delete()
                    .in('channel_id', channelIds);

                // Delete channel members
                await supabase
                    .from('channel_members')
                    .delete()
                    .in('channel_id', channelIds);

                // Delete channels
                await supabase
                    .from('coordination_channels')
                    .delete()
                    .eq('major_incident_id', id);
            }

            // Get all opportunities to handle their dependencies
            const { data: opportunities } = await supabase
                .from('volunteer_opportunities')
                .select('id')
                .eq('major_incident_id', id);

            if (opportunities?.length > 0) {
                const oppIds = opportunities.map(o => o.id);
                
                // Delete message read receipts first
                await supabase
                    .from('message_read_receipts')
                    .delete()
                    .in('message_id', (
                        supabase
                            .from('messages')
                            .select('id')
                            .in('opportunity_id', oppIds)
                    ));

                // Delete messages
                await supabase
                    .from('messages')
                    .delete()
                    .in('opportunity_id', oppIds);

                // Delete opportunity responses
                await supabase
                    .from('opportunity_responses')
                    .delete()
                    .in('opportunity_id', oppIds);
            }

            // Delete all volunteer assignments
            await supabase
                .from('major_incident_volunteer_assignments')
                .delete()
                .eq('major_incident_id', id);

            // Delete all volunteer pool entries
            await supabase
                .from('major_incident_volunteer_pool')
                .delete()
                .eq('major_incident_id', id);

            // Delete all updates
            await supabase
                .from('major_incident_updates')
                .delete()
                .eq('major_incident_id', id);

            // Delete opportunities
            await supabase
                .from('volunteer_opportunities')
                .delete()
                .eq('major_incident_id', id);

            // Delete organization participants
            await supabase
                .from('major_incident_organizations')
                .delete()
                .eq('major_incident_id', id);

            toast({
                title: "Major Incident Deleted",
                description: "The incident and all related data have been deleted",
                status: "success",
                duration: 5000
            });

            // Navigate back to organization dashboard
            navigate('/organization-dashboard');
        } catch (error) {
            console.error('Delete error:', error);
            toast({
                title: "Error",
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
                    isDisabled={activeIncident?.status === 'archived'}
                    _disabled={{
                        opacity: 0.6,
                        cursor: 'not-allowed'
                    }}
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
                                {isOrganization && isParticipating && (
                                    <Menu>
                                        <MenuButton
                                            as={IconButton}
                                            icon={<BsThreeDotsVertical />}
                                            variant="ghost"
                                            size="sm"
                                            ml={2}
                                            isDisabled={activeIncident?.status === 'archived'}
                                            _disabled={{
                                                opacity: 0.6,
                                                cursor: 'not-allowed'
                                            }}
                                        />
                                        <MenuList>
                                            <MenuItem
                                                icon={<DeleteIcon />}
                                                color="red.500"
                                                onClick={() => {
                                                    const confirmed = window.confirm(
                                                        "Are you sure you want to delete this major incident? This action cannot be undone and will delete all related data including opportunities, assignments, and messages."
                                                    );
                                                    if (confirmed) {
                                                        handleDeleteIncident();
                                                    }
                                                }}
                                            >
                                                Delete Incident
                                            </MenuItem>
                                        </MenuList>
                                    </Menu>
                                )}
                            </HStack>
                            <Text color="gray.600">
                                Impact Radius: {activeIncident.radius_miles} miles |
                                Status: {capitalizeFirstLetter(activeIncident.status)} |
                                Created: {new Date(activeIncident.created_at).toLocaleDateString()}
                            </Text>
                        </VStack>
                        <HStack>
                            {isOrganization && isParticipating && (
                                activeIncident?.status === 'archived' ? (
                                    <Button
                                        colorScheme="green"
                                        variant="outline"
                                        onClick={() => setIsArchiveDialogOpen(true)}
                                    >
                                        Unarchive Incident
                                    </Button>
                                ) : (
                                    <Button
                                        colorScheme="red"
                                        variant="outline"
                                        onClick={() => setIsArchiveDialogOpen(true)}
                                    >
                                        Archive Incident
                                    </Button>
                                )
                            )}
                            {renderActionButton()}
                            {isOrganization && isParticipating && (
                                <Button
                                    leftIcon={<AddIcon />}
                                    colorScheme="blue"
                                    onClick={() => setIsUpdateModalOpen(true)}
                                    isDisabled={activeIncident?.status === 'archived'}
                                    _disabled={{
                                        opacity: 0.6,
                                        cursor: 'not-allowed'
                                    }}
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
                    <Grid
                        templateColumns={{
                            base: "1fr",
                            lg: "1fr 400px"  // Back to original fixed layout
                        }}
                        gap={6}
                        p={4}
                    >
                        {/* Main Content */}
                        <Box>  {/* Remove maxW and mx */}
                            <Tabs>
                                <TabList>
                                    <Tab>Overview</Tab>
                                    <Tab>Organizations</Tab>
                                    {isOrganization && <Tab>Updates</Tab>}
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
                                                    zoom={getZoomLevel(activeIncident.radius_miles)}
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
                                                    <RecenterButton
                                                        position={[activeIncident.location_lat, activeIncident.location_lng]}
                                                        radius={activeIncident.radius_miles}
                                                    />
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
                                                            cursor="pointer"
                                                            onClick={(e) => handleProfileClick(e, org.organization, navigate)}
                                                        />
                                                        <VStack align="start" spacing={1}>
                                                            <Text
                                                                fontWeight="bold"
                                                                cursor="pointer"
                                                                color="blue.500"
                                                                _hover={{ textDecoration: 'underline' }}
                                                                onClick={(e) => handleProfileClick(e, org.organization, navigate)}
                                                            >
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

                                    {/* Only show Updates TabPanel for organizations */}
                                    {isOrganization && (
                                        <TabPanel>
                                            <VStack spacing={4} align="stretch">
                                                {updates.map((update, index) => (
                                                    <Box
                                                        key={update.id}
                                                        p={4}
                                                        bg={update.priority_level === 'emergency' ? 'red.50' : 
                                                           update.priority_level === 'urgent' ? 'orange.50' : 'gray.50'}
                                                        borderRadius="md"
                                                        borderLeft="4px solid"
                                                        borderLeftColor={update.priority_level === 'emergency' ? 'red.500' : 
                                                                      update.priority_level === 'urgent' ? 'orange.500' : 'gray.500'}
                                                    >
                                                        <HStack justify="space-between" mb={2}>
                                                            <Badge
                                                                colorScheme={update.priority_level === 'emergency' ? 'red' : 
                                                                           update.priority_level === 'urgent' ? 'orange' : 'gray'}
                                                            >
                                                                {capitalizeFirstLetter(update.priority_level)}
                                                            </Badge>
                                                            <Text fontSize="sm" color="gray.500">
                                                                {new Date(update.created_at).toLocaleString()}
                                                            </Text>
                                                        </HStack>
                                                        <Text>{update.content}</Text>
                                                        <HStack justify="space-between" mt={4}>
                                                            <HStack spacing={1}>
                                                                <Text fontSize="sm" color="gray.500">
                                                                    Posted by
                                                                </Text>
                                                                <Text
                                                                    fontSize="sm"
                                                                    color="gray.500"
                                                                    cursor="pointer"
                                                                    _hover={{ color: "blue.500", textDecoration: "underline" }}
                                                                    onClick={(e) => handleProfileClick(e, update.organization, navigate)}
                                                                >
                                                                    {update.organization?.organization_name}
                                                                </Text>
                                                            </HStack>
                                                        </HStack>
                                                    </Box>
                                                ))}
                                            </VStack>
                                        </TabPanel>
                                    )}

                                    <TabPanel>
                                        <MajorIncidentOpportunities
                                            majorIncidentId={id}
                                            majorIncidentData={activeIncident}
                                            onOpportunityStatusChange={handleOpportunityStatusChange}
                                        />
                                    </TabPanel>

                                    {isParticipating && (
                                        <TabPanel>
                                            <VolunteerPool
                                                majorIncidentId={id}
                                                refreshTrigger={volunteerPoolRefresh}
                                                isArchived={activeIncident?.status === 'archived'}
                                            />
                                        </TabPanel>
                                    )}
                                </TabPanels>
                            </Tabs>
                        </Box>

                        {/* Modify the right panel section */}
                        {(isParticipating || !isOrganization) && (
                            <Box width="400px">
                                <Box
                                    bg="white"
                                    p={6}
                                    borderRadius="lg"
                                    shadow="sm"
                                    height="100%"
                                    maxH="calc(100vh - 200px)"
                                    overflowY="auto"
                                    width="100%"
                                >
                                    {isParticipating ? (
                                        <OrganizationChannel
                                            majorIncidentId={id}
                                            isArchived={activeIncident?.status === 'archived'}
                                        />
                                    ) : !isOrganization && (
                                        <VStack spacing={4} align="stretch">
                                            <Heading size="md">Updates</Heading>
                                            {updates.map((update, index) => (
                                                <Box
                                                    key={update.id}
                                                    p={4}
                                                    bg={update.priority_level === 'emergency' ? 'red.50' : 
                                                       update.priority_level === 'urgent' ? 'orange.50' : 'gray.50'}
                                                    borderRadius="md"
                                                    borderLeft="4px solid"
                                                    borderLeftColor={update.priority_level === 'emergency' ? 'red.500' : 
                                                                  update.priority_level === 'urgent' ? 'orange.500' : 'gray.500'}
                                                >
                                                    <HStack justify="space-between" mb={2}>
                                                        <Badge
                                                            colorScheme={update.priority_level === 'emergency' ? 'red' : 
                                                                       update.priority_level === 'urgent' ? 'orange' : 'gray'}
                                                        >
                                                            {capitalizeFirstLetter(update.priority_level)}
                                                        </Badge>
                                                        <Text fontSize="sm" color="gray.500">
                                                            {new Date(update.created_at).toLocaleString()}
                                                        </Text>
                                                    </HStack>
                                                    <Text>{update.content}</Text>
                                                    <HStack justify="space-between" mt={4}>
                                                        <HStack spacing={1}>
                                                            <Text fontSize="sm" color="gray.500">
                                                                Posted by
                                                            </Text>
                                                            <Text
                                                                fontSize="sm"
                                                                color="gray.500"
                                                                cursor="pointer"
                                                                _hover={{ color: "blue.500", textDecoration: "underline" }}
                                                                onClick={(e) => handleProfileClick(e, update.organization, navigate)}
                                                            >
                                                                {update.organization?.organization_name}
                                                            </Text>
                                                        </HStack>
                                                    </HStack>
                                                </Box>
                                            ))}
                                        </VStack>
                                    )}
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
            <CreateUpdateModal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                onSubmit={handleCreateUpdate}
            />
            <AlertDialog
                isOpen={isArchiveDialogOpen}
                leastDestructiveRef={cancelRef}
                onClose={() => setIsArchiveDialogOpen(false)}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            {activeIncident?.status === 'archived' ? 'Unarchive' : 'Archive'} Major Incident
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            {activeIncident?.status === 'archived' ? (
                                'Are you sure? This will reactivate the incident and allow new volunteer opportunities to be created.'
                            ) : (
                                'Are you sure? This will archive the incident and all related volunteer opportunities. This action cannot be undone.'
                            )}
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={() => setIsArchiveDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button 
                                colorScheme={activeIncident?.status === 'archived' ? 'green' : 'red'}
                                onClick={handleArchiveIncident} 
                                ml={3}
                            >
                                {activeIncident?.status === 'archived' ? 'Unarchive' : 'Archive'}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
};

export default MajorIncidentDashboard;