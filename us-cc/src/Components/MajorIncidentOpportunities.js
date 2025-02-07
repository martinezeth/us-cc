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

const MajorIncidentOpportunities = ({ majorIncidentId, majorIncidentData }) => {
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

    useEffect(() => {
        fetchOpportunities();
    }, [majorIncidentId]);

    const fetchOpportunities = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            // First fetch opportunities with response counts
            const { data: opportunitiesData, error: opportunitiesError } = await supabase
                .from('volunteer_opportunities')
                .select(`
                    *,
                    responses:opportunity_responses(count)
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

            // Combine the data
            const enrichedOpportunities = opportunitiesData.map(opp => ({
                ...opp,
                organization: orgNameMap[opp.organization_id] || {
                    organization_name: 'Unknown Organization',
                    full_name: 'Unknown Organization'
                }
            }));

            // Calculate stats using the enriched opportunities
            const active = enrichedOpportunities?.filter(opp => opp.status === 'open').length || 0;
            const totalResponses = enrichedOpportunities?.reduce((sum, opp) => sum + opp.responses[0].count, 0) || 0;
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
            const { error } = await supabase
                .from('volunteer_opportunities')
                .update({
                    status: 'archived',
                    archived_at: new Date().toISOString()
                })
                .eq('id', opportunityId);

            if (error) throw error;

            toast({
                title: "Success",
                description: "Opportunity archived",
                status: "success",
                duration: 3000
            });

            fetchOpportunities();
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
                                            >
                                                Archive Opportunity
                                            </MenuItem>
                                            <MenuItem>
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
                                        {opportunity.responses[0].count} responses
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
            </VStack>
        </Box>
    );
};

export default MajorIncidentOpportunities;