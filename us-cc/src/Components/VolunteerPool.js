import React, { useState, useEffect } from 'react';
import {
    Box,
    Alert,
    AlertIcon,
    Badge,
    Text,
    Heading,
    Tag,
    TagLabel,
    Wrap,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Button,
    useToast,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { supabase } from '../supabaseClient';
import VolunteerPoolHeader from './VolunteerPoolHeader';
import VolunteerFilterBar from './VolunteerFilterBar';

const VolunteerPool = ({ majorIncidentId, refreshTrigger, isArchived }) => {
    const [isOrganization, setIsOrganization] = useState(false);
    const [volunteers, setVolunteers] = useState([]);
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const toast = useToast();
    const [localRefreshTrigger, setLocalRefreshTrigger] = useState(0);
    const [filters, setFilters] = useState({
        status: 'available',
        skill: '',
        searchQuery: '',
    });
    const [stats, setStats] = useState({
        skillDistribution: {}
    });

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({
            ...prev,
            ...newFilters
        }));
    };

    useEffect(() => {
        const checkUserRole = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setIsOrganization(user?.user_metadata?.is_organization || false);

            if (majorIncidentId && user) {
                await fetchOpportunities(user);
                await fetchVolunteers();
            }
        };
        checkUserRole();
    }, [majorIncidentId, refreshTrigger]);

    const fetchOpportunities = async (currentUser) => {
        if (!currentUser) {
            console.log('No user provided to fetchOpportunities');
            return;
        }

        try {
            console.log('Fetching opportunities for major incident:', majorIncidentId, 'with user:', currentUser.id);

            // First get opportunities
            const { data: opps, error: oppsError } = await supabase
                .from('volunteer_opportunities')
                .select('*')
                .eq('major_incident_id', majorIncidentId)
                .eq('status', 'open');

            console.log('Raw opportunities query:', {
                majorIncidentId,
                status: 'open',
                result: opps,
                error: oppsError
            });

            if (oppsError) {
                console.error('Error fetching opportunities:', oppsError);
                throw oppsError;
            }

            if (!opps?.length) {
                console.log('No opportunities found');
                setOpportunities([]);
                return;
            }

            // Then get organization names in a separate query
            console.log('Fetching organizations for IDs:', opps.map(opp => opp.organization_id));
            const { data: orgs, error: orgsError } = await supabase
                .from('profiles')
                .select('id, organization_name')
                .in('id', opps.map(opp => opp.organization_id));

            console.log('Organizations data:', orgs);
            if (orgsError) {
                console.error('Error fetching organizations:', orgsError);
                throw orgsError;
            }

            // Combine the data
            const data = opps.map(opp => {
                const org = orgs.find(org => org.id === opp.organization_id);
                console.log(`Matching opp ${opp.id} with org:`, org);
                return {
                    ...opp,
                    organization: org
                };
            });

            console.log('Final processed opportunities:', data);
            setOpportunities(data || []);
        } catch (error) {
            console.error('Error in fetchOpportunities:', error);
            toast({
                title: "Error fetching opportunities",
                description: error.message,
                status: "error",
                duration: 5000
            });
        }
    };

    const fetchVolunteers = async () => {
        try {
            setLoading(true);

            // Get all volunteers in the pool
            const { data: poolData, error: poolError } = await supabase
                .from('major_incident_volunteer_pool')
                .select('id, volunteer_id')
                .eq('major_incident_id', majorIncidentId);

            if (poolError) throw poolError;

            // Get volunteer profiles
            const volunteerIds = poolData.map(entry => entry.volunteer_id);
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('id, full_name, city, state')
                .in('id', volunteerIds);

            if (profilesError) throw profilesError;

            // Get volunteer signups data
            const { data: signupsData, error: signupsError } = await supabase
                .from('volunteer_signups')
                .select('user_id, skills, availability')
                .in('user_id', volunteerIds);

            if (signupsError) throw signupsError;

            // Get assignments
            const { data: assignments, error: assignmentsError } = await supabase
                .from('major_incident_volunteer_assignments')
                .select(`
                    pool_entry_id,
                    organization_id,
                    status,
                    organization:profiles(id, organization_name)
                `)
                .in('pool_entry_id', poolData.map(entry => entry.id));

            if (assignmentsError) throw assignmentsError;

            // Get opportunities separately
            const { data: opportunities, error: opportunitiesError } = await supabase
                .from('volunteer_opportunities')
                .select('id, title, status')
                .eq('major_incident_id', majorIncidentId)
                .eq('status', 'open');

            if (opportunitiesError) throw opportunitiesError;

            // Create lookup maps
            const profileMap = {};
            profiles.forEach(profile => {
                profileMap[profile.id] = profile;
            });

            const signupsMap = {};
            signupsData.forEach(signup => {
                signupsMap[signup.user_id] = signup;
            });

            // Create opportunities lookup map
            const opportunitiesMap = {};
            opportunities?.forEach(opp => {
                opportunitiesMap[opp.id] = opp;
            });

            // Process volunteers with correct column names
            const processedVolunteers = poolData.map(entry => {
                const profile = profileMap[entry.volunteer_id] || {};
                const signup = signupsMap[entry.volunteer_id] || {};
                const assignment = assignments.find(a => a.pool_entry_id === entry.id);

                const isEffectivelyAssigned = !!assignment && assignment.status === 'active';

                return {
                    id: entry.volunteer_id,
                    poolEntryId: entry.id,
                    name: profile.full_name || 'Unknown',
                    location: `${profile.city || 'Unknown'}, ${profile.state || 'Unknown'}`,
                    skills: signup.skills || [],
                    availability: signup.availability || [],
                    isAssigned: isEffectivelyAssigned,
                    assignment: isEffectivelyAssigned ? {
                        organizationId: assignment.organization_id,
                        organizationName: assignment.organization?.organization_name
                    } : null
                };
            });

            setVolunteers(processedVolunteers);
        } catch (error) {
            console.error('Error fetching volunteers:', error);
            toast({
                title: "Error",
                description: "Failed to load volunteer pool",
                status: "error",
                duration: 5000
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAssignVolunteer = async (volunteerId, poolEntryId, opportunityId) => {
        if (!user) return;

        try {
            // Check if any assignment exists (active or inactive)
            const { data: existingAssignment } = await supabase
                .from('major_incident_volunteer_assignments')
                .select('*')
                .eq('pool_entry_id', poolEntryId)
                .eq('organization_id', user.id)
                .single();

            if (existingAssignment?.status === 'active') {
                toast({
                    title: "Already assigned",
                    description: "This volunteer is already assigned to an active opportunity",
                    status: "warning",
                    duration: 3000
                });
                return;
            }

            let error;
            if (existingAssignment) {
                // Update existing assignment
                const { error: updateError } = await supabase
                    .from('major_incident_volunteer_assignments')
                    .update({
                        status: 'active',
                        assigned_at: new Date().toISOString()
                    })
                    .eq('id', existingAssignment.id);
                error = updateError;
            } else {
                // Create new assignment
                const { error: insertError } = await supabase
                    .from('major_incident_volunteer_assignments')
                    .insert({
                        pool_entry_id: poolEntryId,
                        organization_id: user.id,
                        status: 'active',
                        assigned_at: new Date().toISOString()
                    });
                error = insertError;
            }

            if (error) throw error;

            // Send message to volunteer using existing messaging system
            const { error: messageError } = await supabase
                .from('messages')
                .insert([{
                    organization_id: user.id,
                    volunteer_id: volunteerId,
                    opportunity_id: opportunityId,
                    message: `You have been assigned to an opportunity for this major incident response.`,
                    is_group_message: false
                }]);

            if (messageError) throw messageError;

            toast({
                title: "Success",
                description: "Volunteer assigned successfully",
                status: "success",
                duration: 3000
            });

            // Trigger refresh of all components
            setLocalRefreshTrigger(prev => prev + 1);
            fetchVolunteers();
        } catch (error) {
            console.error('Error assigning volunteer:', error);
            toast({
                title: "Error",
                description: error.message,
                status: "error",
                duration: 5000
            });
        }
    };

    // Calculate stats and filter volunteers
    useEffect(() => {
        const skillCounts = {};
        volunteers.forEach(volunteer => {
            volunteer.skills.forEach(skill => {
                skillCounts[skill] = (skillCounts[skill] || 0) + 1;
            });
        });
        setStats({ skillDistribution: skillCounts });
    }, [volunteers]);

    const filteredVolunteers = volunteers.filter(volunteer => {
        if (filters.status === 'available' && volunteer.isAssigned) return false;
        if (filters.status === 'assigned' && !volunteer.isAssigned) return false;
        if (filters.skill && !volunteer.skills.includes(filters.skill)) return false;
        if (filters.searchQuery) {
            const searchLower = filters.searchQuery.toLowerCase();
            const matchesName = volunteer.name.toLowerCase().includes(searchLower);
            const matchesSkills = volunteer.skills.some(skill =>
                skill.toLowerCase().includes(searchLower)
            );
            if (!matchesName && !matchesSkills) return false;
        }
        return true;
    });

    if (!isOrganization) {
        return (
            <Box p={8} textAlign="center">
                <Alert status="warning">
                    <AlertIcon />
                    Only organizations can access the volunteer pool.
                </Alert>
            </Box>
        );
    }

    return (
        <Box mb={8} width="100%">
            <VolunteerPoolHeader
                majorIncidentId={majorIncidentId}
                onVolunteerJoin={() => setLocalRefreshTrigger(prev => prev + 1)}
                refreshTrigger={localRefreshTrigger}
                hideStats={true}
            />

            <Box>
                <VolunteerFilterBar
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    stats={stats}
                />
                {loading ? (
                    <Text>Loading volunteers...</Text>
                ) : (
                    <Box width="100%">
                        <Table variant="simple" bg="white" shadow="sm" borderRadius="lg" size="sm">
                            <Thead>
                                <Tr>
                                    <Th>Volunteer</Th>
                                    <Th>Skills</Th>
                                    <Th>Availability</Th>
                                    <Th>Assignment</Th>
                                    <Th>Organization</Th>
                                    <Th>Actions</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {filteredVolunteers.map(volunteer => (
                                    <Tr key={volunteer.id}>
                                        <Td>{volunteer.name}</Td>
                                        <Td>
                                            <Wrap>
                                                {volunteer.skills.map(skill => (
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
                                        </Td>
                                        <Td>
                                            <Wrap>
                                                {volunteer.availability?.map(time => (
                                                    <Tag
                                                        key={time}
                                                        size="sm"
                                                        colorScheme="green"
                                                        borderRadius="full"
                                                    >
                                                        <TagLabel>{time}</TagLabel>
                                                    </Tag>
                                                ))}
                                            </Wrap>
                                        </Td>
                                        <Td>
                                            {volunteer.isAssigned ? (
                                                <Badge colorScheme="green">Assigned</Badge>
                                            ) : (
                                                <Badge colorScheme="gray">Available</Badge>
                                            )}
                                        </Td>
                                        <Td>
                                            {volunteer.assignment?.organizationName || '-'}
                                        </Td>
                                        <Td>
                                            {!volunteer.isAssigned && (
                                                <Menu>
                                                    <MenuButton
                                                        as={Button}
                                                        size="sm"
                                                        colorScheme="blue"
                                                        rightIcon={<ChevronDownIcon />}
                                                        isDisabled={isArchived}
                                                        _disabled={{
                                                            opacity: 0.6,
                                                            cursor: 'not-allowed'
                                                        }}
                                                    >
                                                        Assign to Opportunity
                                                    </MenuButton>
                                                    <MenuList>
                                                        {opportunities.length > 0 ? (
                                                            opportunities.map(opp => (
                                                                <MenuItem
                                                                    key={opp.id}
                                                                    onClick={() => handleAssignVolunteer(
                                                                        volunteer.id,
                                                                        volunteer.poolEntryId,
                                                                        opp.id
                                                                    )}
                                                                >
                                                                    {opp.title} - {opp.organization?.organization_name}
                                                                </MenuItem>
                                                            ))
                                                        ) : (
                                                            <MenuItem isDisabled>
                                                                No open opportunities available
                                                            </MenuItem>
                                                        )}
                                                    </MenuList>
                                                </Menu>
                                            )}
                                        </Td>
                                    </Tr>
                                ))}
                                {filteredVolunteers.length === 0 && (
                                    <Tr>
                                        <Td colSpan={6} textAlign="center">
                                            No volunteers match the current filters
                                        </Td>
                                    </Tr>
                                )}
                            </Tbody>
                        </Table>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

VolunteerPool.defaultProps = {
    isArchived: false
};

export default VolunteerPool;