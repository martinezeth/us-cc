import React, { useState, useEffect } from 'react';
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
} from '@chakra-ui/react';
import { AddIcon, ChevronDownIcon } from '@chakra-ui/icons';
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

    useEffect(() => {
        fetchOpportunities();
    }, [majorIncidentId]);

    const fetchOpportunities = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            // First fetch opportunities with response counts and actual responses
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

    const handleArchiveOpportunity = async (opportunityId) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // First check if opportunity is already archived
            const { data: opportunity } = await supabase
                .from('volunteer_opportunities')
                .select('status')
                .eq('id', opportunityId)
                .single();

            if (opportunity?.status === 'archived') {
                toast({
                    title: "Already Archived",
                    description: "This opportunity is already archived",
                    status: "info",
                    duration: 3000
                });
                return;
            }

            // Get all active assignments for this organization's opportunity
            const { data: assignments, error: findError } = await supabase
                .from('major_incident_volunteer_assignments')
                .select('id, status')
                .eq('organization_id', user.id)
                .eq('status', 'active');

            if (findError) {
                console.error('Error finding assignments:', findError);
                throw findError;
            }

            // Update opportunity status to archived
            const { error: updateError } = await supabase
                .from('volunteer_opportunities')
                .update({ status: 'archived' })
                .eq('id', opportunityId);

            if (updateError) throw updateError;

            // Update all active assignments to inactive
            if (assignments?.length > 0) {
                const { error: assignmentError } = await supabase
                    .from('major_incident_volunteer_assignments')
                    .update({ status: 'inactive' })
                    .in('id', assignments.map(a => a.id));

                if (assignmentError) {
                    console.error('Error updating assignments:', assignmentError);
                    throw assignmentError;
                }
            }

            // Call the refresh handler after successful archive
            onOpportunityStatusChange?.();

            toast({
                title: "Success",
                description: "Opportunity archived and volunteers released",
                status: "success",
                duration: 3000
            });

            // Refresh the opportunities list
            fetchOpportunities();
        } catch (error) {
            console.error('Error archiving opportunity:', error);
            toast({
                title: "Error archiving opportunity",
                description: error.message,
                status: "error",
                duration: 5000
            });
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

    return (
        <Box>
            <VStack spacing={6} align="stretch">
                <HStack justify="space-between">
                    <Text fontSize="2xl" fontWeight="bold">Volunteer Opportunities</Text>
                    <Button
                        leftIcon={<AddIcon />}
                        colorScheme="blue"
                        onClick={onOpen}
                    >
                        Create Opportunity
                    </Button>
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
                    <Stat>
                        <StatLabel>Avg. Responses per Opportunity</StatLabel>
                        <StatNumber>{stats.responseRate}</StatNumber>
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
                                    <Menu>
                                        <MenuButton
                                            as={IconButton}
                                            icon={<ChevronDownIcon />}
                                            variant="ghost"
                                            size="sm"
                                        />
                                        <MenuList>
                                            <MenuItem
                                                onClick={() => handleArchiveOpportunity(opportunity.id)}
                                                isDisabled={opportunity.status === 'archived'}
                                            >
                                                Archive Opportunity
                                            </MenuItem>
                                            <MenuItem onClick={() => handleViewResponses(opportunity)}>
                                                View Responses
                                            </MenuItem>
                                        </MenuList>
                                    </Menu>
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

                                <HStack justify="space-between">
                                    <Text fontSize="sm" color="gray.500">
                                        📍 {opportunity.location}
                                    </Text>
                                    <Badge colorScheme="purple">
                                        {opportunity.response_count?.[0]?.count || 0} responses
                                    </Badge>
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
            </VStack>
        </Box>
    );
};

export default MajorIncidentOpportunities;