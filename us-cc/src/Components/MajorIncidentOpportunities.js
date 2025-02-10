import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Button,
    Grid,
    Badge,
    useToast,
    Stat,
    StatLabel,
    StatNumber,
    StatGroup,
    Tag,
    TagLabel,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    IconButton,
    Wrap,
    useDisclosure,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
} from '@chakra-ui/react';
import { AddIcon, ChevronDownIcon, DeleteIcon } from '@chakra-ui/icons';
import { supabase } from '../supabaseClient';
import CreateVolunteerOpportunityModal from './CreateVolunteerOpportunityModal';
import VolunteerResponsesDrawer from './VolunteerResponsesDrawer';

const MajorIncidentOpportunities = ({ majorIncidentId, majorIncidentData, onOpportunityStatusChange }) => {
    const [opportunities, setOpportunities] = useState([]);
    const [stats, setStats] = useState({
        totalOpportunities: 0,
        activeOpportunities: 0,
        totalResponses: 0,
        responseRate: 0
    });
    const [loading, setLoading] = useState(true);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const [selectedOpportunity, setSelectedOpportunity] = useState(null);
    const [isResponsesDrawerOpen, setIsResponsesDrawerOpen] = useState(false);
    const [isOrganization, setIsOrganization] = useState(false);
    const [user, setUser] = useState(null);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [opportunityToDelete, setOpportunityToDelete] = useState(null);
    const cancelRef = useRef();
    const [isArchiveAlertOpen, setIsArchiveAlertOpen] = useState(false);
    const [opportunityToArchive, setOpportunityToArchive] = useState(null);

    useEffect(() => {
        const checkUserType = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setIsOrganization(user.user_metadata?.is_organization || false);
                setUser(user);
            }
        };
        checkUserType();
        fetchOpportunities();
    }, [majorIncidentId]);

    const fetchOpportunities = async () => {
        try {
            setLoading(true);
            const { data: opportunitiesData, error: opportunitiesError } = await supabase
                .from('volunteer_opportunities')
                .select(`
                    *,
                    responses:opportunity_responses!left(
                        id,
                        volunteer_id,
                        status,
                        response_date
                    )
                `)
                .eq('major_incident_id', majorIncidentId)
                .order('created_at', { ascending: false });

            if (opportunitiesError) throw opportunitiesError;

            // Then get the organization profiles for these opportunities
            const orgIds = [...new Set(opportunitiesData?.map(opp => opp.organization_id) || [])];

            const { data: orgProfiles, error: profilesError } = await supabase
                .from('profiles')
                .select('id, organization_name, full_name')
                .in('id', orgIds);

            if (profilesError) throw profilesError;

            // Create a lookup map for organization names
            const orgNameMap = {};
            orgProfiles?.forEach(profile => {
                orgNameMap[profile.id] = {
                    organization_name: profile.organization_name,
                    full_name: profile.full_name
                };
            });

            // Fetch assignments separately for these opportunities
            const { data: assignmentsData, error: assignmentsError } = await supabase
                .from('major_incident_volunteer_assignments')
                .select(`
                    id,
                    pool_entry_id,
                    organization_id,
                    status,
                    pool_entry:major_incident_volunteer_pool!inner(
                        id,
                        volunteer_id,
                        major_incident_id
                    )
                `)
                .eq('status', 'active');

            if (assignmentsError) throw assignmentsError;

            // Filter assignments to only include those for this major incident
            const relevantAssignments = assignmentsData?.filter(a => 
                a.pool_entry.major_incident_id === majorIncidentId
            ).map(assignment => ({
                id: assignment.id,
                volunteer_id: assignment.pool_entry.volunteer_id,
                status: assignment.status
            })) || [];

            // Update the enrichedOpportunities mapping
            const enrichedOpportunities = opportunitiesData.map(opp => {
                const responses = opp.responses || [];
                // For now, include all assignments for this major incident with each opportunity
                // You may want to modify this based on your business logic
                const assignments = relevantAssignments;
                const totalResponses = responses.length + assignments.length;

                return {
                    ...opp,
                    organization: orgNameMap[opp.organization_id] || {
                        organization_name: 'Unknown Organization',
                        full_name: 'Unknown Organization'
                    },
                    response_count: [{ count: totalResponses }],
                    responses: [...responses, ...assignments.map(a => ({
                        id: a.id,
                        volunteer_id: a.volunteer_id,
                        status: 'assigned',
                        response_date: null
                    }))]
                };
            });

            // Calculate stats
            const active = enrichedOpportunities?.filter(opp => opp.status === 'open').length || 0;
            const totalResponses = enrichedOpportunities?.reduce((sum, opp) => sum + opp.response_count[0].count, 0);
            const responseRate = enrichedOpportunities?.length ?
                (totalResponses / enrichedOpportunities.length).toFixed(1) : 0;

            setStats({
                totalOpportunities: enrichedOpportunities?.length || 0,
                activeOpportunities: active,
                totalResponses,
                responseRate
            });

            setOpportunities(enrichedOpportunities || []);
        } catch (error) {
            console.error('Error fetching opportunities:', error);
            toast({
                title: "Error loading opportunities",
                description: error.message,
                status: "error",
                duration: 5000
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSuccess = () => {
        fetchOpportunities();
        onClose();
    };

    const handleArchiveClick = (opportunity) => {
        setOpportunityToArchive(opportunity);
        setIsArchiveAlertOpen(true);
    };

    const handleArchiveConfirm = async () => {
        if (!opportunityToArchive) return;
        
        try {
            const { error } = await supabase
                .from('volunteer_opportunities')
                .update({ archived_at: new Date().toISOString() })
                .eq('id', opportunityToArchive.id);

            if (error) throw error;

            toast({
                title: "Opportunity Archived",
                description: "The volunteer opportunity has been archived successfully.",
                status: "success",
                duration: 3000,
            });

            // Refresh your data here
            if (onOpportunityStatusChange) onOpportunityStatusChange();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to archive the opportunity. Please try again.",
                status: "error",
                duration: 5000,
            });
        } finally {
            setIsArchiveAlertOpen(false);
            setOpportunityToArchive(null);
        }
    };

    const handleViewResponses = async (opportunity) => {
        try {
            console.log("Viewing responses for opportunity:", opportunity);

            // Fetch both responses and assignments
            const [responseResult, assignmentResult] = await Promise.all([
                supabase
                    .from('opportunity_responses')
                    .select('*')
                    .eq('opportunity_id', opportunity.id),
                supabase
                    .from('major_incident_volunteer_assignments')
                    .select(`
                        id,
                        pool_entry_id,
                        organization_id,
                        status,
                        pool_entry:major_incident_volunteer_pool!inner(
                            volunteer_id,
                            major_incident_id
                        )
                    `)
                    .eq('status', 'active')
            ]);

            if (responseResult.error) throw responseResult.error;
            if (assignmentResult.error) throw assignmentResult.error;

            // Filter assignments to only include those for this major incident
            const relevantAssignments = assignmentResult.data
                .filter(a => a.pool_entry.major_incident_id === majorIncidentId);

            const allResponses = [
                ...responseResult.data,
                ...relevantAssignments.map(a => ({
                    id: a.id,
                    volunteer_id: a.pool_entry.volunteer_id,
                    status: 'assigned',
                    response_date: null
                }))
            ];

            // Process responses with volunteer details
            const processedResponses = await Promise.all(allResponses.map(async (response) => {
                // Get volunteer details from volunteer_signups
                const { data: signupData } = await supabase
                    .from('volunteer_signups')
                    .select('skills, region')
                    .eq('user_id', response.volunteer_id)
                    .single();

                // Get profile details
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('full_name, city, state')
                    .eq('id', response.volunteer_id)
                    .single();

                return {
                    id: response.id,
                    volunteer_id: response.volunteer_id,
                    volunteer_name: profileData?.full_name || 'Anonymous Volunteer',
                    city: profileData?.city || 'Unknown City',
                    state: profileData?.state || 'Unknown State',
                    skills: signupData?.skills || [],
                    status: response.status,
                    response_date: response.response_date
                };
            }));

            // Update the opportunity with processed responses
            setSelectedOpportunity({
                ...opportunity,
                responses: processedResponses
            });
            setIsResponsesDrawerOpen(true);

        } catch (error) {
            console.error('Error processing responses:', error);
            toast({
                title: "Error loading responses",
                description: error.message,
                status: "error",
                duration: 5000
            });
        }
    };

    const handleVolunteerResponse = async (opportunity) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            const { data: existingResponse, error: checkError } = await supabase
                .from('opportunity_responses')
                .select('*')
                .eq('opportunity_id', opportunity.id)
                .eq('volunteer_id', user.id)
                .single();

            if (checkError && checkError.code !== 'PGRST116') {
                throw checkError;
            }

            if (existingResponse) {
                toast({
                    title: "Already Responded",
                    description: "You have already responded to this opportunity",
                    status: "info",
                    duration: 3000
                });
                return;
            }

            const { error: responseError } = await supabase
                .from('opportunity_responses')
                .insert([{
                    opportunity_id: opportunity.id,
                    volunteer_id: user.id,
                    status: 'pending'
                }]);

            if (responseError) throw responseError;

            toast({
                title: "Response Submitted",
                description: "Your interest has been registered for this opportunity",
                status: "success",
                duration: 3000
            });

            fetchOpportunities();
        } catch (error) {
            console.error('Error responding to opportunity:', error);
            toast({
                title: "Error",
                description: error.message,
                status: "error",
                duration: 5000
            });
        }
    };

    // First add a function to check if user has already responded
    const hasUserResponded = (opportunity, userId) => {
        return opportunity.responses?.some(response => 
            response.volunteer_id === userId
        );
    };

    const handleDelete = async () => {
        if (!opportunityToDelete) return;

        try {
            // Use a single transaction to handle all the deletions
            const { error } = await supabase.rpc('delete_opportunity_with_related', {
                opportunity_id: opportunityToDelete.id
            });

            if (error) throw error;

            // Remove from local state immediately
            setOpportunities(prevOpportunities => 
                prevOpportunities.filter(opp => opp.id !== opportunityToDelete.id)
            );

            toast({
                title: "Opportunity deleted",
                status: "success",
                duration: 3000,
            });

            // Update stats
            setStats(prev => ({
                ...prev,
                totalOpportunities: prev.totalOpportunities - 1,
                activeOpportunities: opportunityToDelete.status === 'open' ? 
                    prev.activeOpportunities - 1 : 
                    prev.activeOpportunities
            }));

            // Refresh the opportunities list
            fetchOpportunities();
        } catch (error) {
            console.error('Error deleting opportunity:', error);
            toast({
                title: "Error deleting opportunity",
                description: error.message,
                status: "error",
                duration: 5000,
            });
        } finally {
            setIsDeleteAlertOpen(false);
            setOpportunityToDelete(null);
        }
    };

    return (
        <Box>
            <VStack spacing={6} align="stretch">
                <HStack justify="space-between">
                    <Text fontSize="2xl" fontWeight="bold">Volunteer Opportunities</Text>
                    {isOrganization && (
                        <Button
                            leftIcon={<AddIcon />}
                            colorScheme="blue"
                            onClick={onOpen}
                        >
                            Create Opportunity
                        </Button>
                    )}
                </HStack>

                <StatGroup>
                    <Stat>
                        <StatLabel>Total Opportunities</StatLabel>
                        <StatNumber>{stats.totalOpportunities}</StatNumber>
                    </Stat>
                    <Stat>
                        <StatLabel>Active Opportunities</StatLabel>
                        <StatNumber>{stats.activeOpportunities}</StatNumber>
                    </Stat>
                    <Stat>
                        <StatLabel>Total Responses</StatLabel>
                        <StatNumber>{stats.totalResponses}</StatNumber>
                    </Stat>
                </StatGroup>

                <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
                    {opportunities.map(opportunity => (
                        <Box
                            key={opportunity.id}
                            p={6}
                            bg="white"
                            borderRadius="lg"
                            shadow="sm"
                            border="1px solid"
                            borderColor="gray.100"
                            position="relative"
                        >
                            <VStack align="stretch" spacing={4}>
                                <HStack justify="space-between">
                                    <Badge
                                        colorScheme={opportunity.status === 'open' ? 'green' : 'gray'}
                                    >
                                        {opportunity.status.toUpperCase()}
                                    </Badge>
                                    {isOrganization && (
                                        <Menu>
                                            <MenuButton
                                                as={IconButton}
                                                icon={<ChevronDownIcon />}
                                                variant="ghost"
                                                size="sm"
                                            />
                                            <MenuList>
                                                <MenuItem
                                                    onClick={() => handleArchiveClick(opportunity)}
                                                    isDisabled={opportunity.status === 'archived'}
                                                >
                                                    Archive Opportunity
                                                </MenuItem>
                                                <MenuItem onClick={() => handleViewResponses(opportunity)}>
                                                    View Responses
                                                </MenuItem>
                                                <MenuItem
                                                    onClick={() => {
                                                        setOpportunityToDelete(opportunity);
                                                        setIsDeleteAlertOpen(true);
                                                    }}
                                                    icon={<DeleteIcon />}
                                                    color="red.500"
                                                >
                                                    Delete Opportunity
                                                </MenuItem>
                                            </MenuList>
                                        </Menu>
                                    )}
                                </HStack>

                                <VStack align="start" spacing={2}>
                                    <Text fontSize="lg" fontWeight="bold">
                                        {opportunity.title}
                                    </Text>
                                    <Text color="gray.600">
                                        {opportunity.description}
                                    </Text>
                                </VStack>

                                <Box>
                                    <Text fontWeight="medium" mb={2}>Required Skills:</Text>
                                    <Wrap>
                                        {opportunity.required_skills?.map(skill => (
                                            <Tag
                                                key={skill}
                                                size="sm"
                                                colorScheme="blue"
                                                borderRadius="full"
                                            >
                                                <TagLabel>{skill}</TagLabel>
                                            </Tag>
                                        ))}
                                    </Wrap>
                                </Box>

                                <HStack justify="space-between" align="center">
                                    {isOrganization ? (
                                        <Badge colorScheme="purple">
                                            {opportunity.response_count?.[0]?.count || 0} responses
                                        </Badge>
                                    ) : (
                                        <Button
                                            colorScheme="blue"
                                            size="sm"
                                            onClick={() => handleVolunteerResponse(opportunity)}
                                            isDisabled={opportunity.status !== 'open' || hasUserResponded(opportunity, user?.id)}
                                        >
                                            {opportunity.status !== 'open' ? 'Opportunity Closed' :
                                                hasUserResponded(opportunity, user?.id) ? 'Already Responded' :
                                                'Respond to Opportunity'}
                                        </Button>
                                    )}
                                </HStack>

                                <Text fontSize="sm" color="gray.500">
                                    Posted by: {opportunity.organization?.organization_name || opportunity.organization?.full_name}
                                </Text>
                            </VStack>
                        </Box>
                    ))}
                </Grid>

                {loading && (
                    <Text textAlign="center" color="gray.500">
                        Loading opportunities...
                    </Text>
                )}

                {!loading && opportunities.length === 0 && (
                    <Text textAlign="center" color="gray.500">
                        No opportunities created yet for this major incident.
                    </Text>
                )}

                <CreateVolunteerOpportunityModal
                    isOpen={isOpen}
                    onClose={onClose}
                    onCreateSuccess={handleCreateSuccess}
                    majorIncidentId={majorIncidentId}
                    majorIncidentData={majorIncidentData}
                />

                <VolunteerResponsesDrawer
                    isOpen={isResponsesDrawerOpen}
                    onClose={() => {
                        setIsResponsesDrawerOpen(false);
                        setSelectedOpportunity(null);
                    }}
                    opportunity={selectedOpportunity}
                />

                <AlertDialog
                    isOpen={isDeleteAlertOpen}
                    leastDestructiveRef={cancelRef}
                    onClose={() => {
                        setIsDeleteAlertOpen(false);
                        setOpportunityToDelete(null);
                    }}
                >
                    <AlertDialogOverlay>
                        <AlertDialogContent>
                            <AlertDialogHeader fontSize="lg" fontWeight="bold">
                                Delete Opportunity
                            </AlertDialogHeader>

                            <AlertDialogBody>
                                Are you sure you want to delete this opportunity? This action cannot be undone.
                                All volunteer responses will also be deleted.
                            </AlertDialogBody>

                            <AlertDialogFooter>
                                <Button ref={cancelRef} onClick={() => setIsDeleteAlertOpen(false)}>
                                    Cancel
                                </Button>
                                <Button colorScheme="red" onClick={handleDelete} ml={3}>
                                    Delete
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialogOverlay>
                </AlertDialog>

                <AlertDialog
                    isOpen={isArchiveAlertOpen}
                    leastDestructiveRef={cancelRef}
                    onClose={() => setIsArchiveAlertOpen(false)}
                >
                    <AlertDialogOverlay>
                        <AlertDialogContent>
                            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                                Archive Volunteer Opportunity
                            </AlertDialogHeader>

                            <AlertDialogBody>
                                Are you sure you want to archive this opportunity? 
                                This will remove it from the active opportunities list and volunteers will no longer be able to respond to it.
                            </AlertDialogBody>

                            <AlertDialogFooter>
                                <Button ref={cancelRef} onClick={() => setIsArchiveAlertOpen(false)}>
                                    Cancel
                                </Button>
                                <Button colorScheme='red' onClick={handleArchiveConfirm} ml={3}>
                                    Archive
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialogOverlay>
                </AlertDialog>
            </VStack>
        </Box>
    );
};

export default MajorIncidentOpportunities;