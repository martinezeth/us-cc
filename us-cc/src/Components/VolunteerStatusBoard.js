import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Badge, Stat, StatLabel, StatNumber, StatGroup, Select, Table, Thead, Tbody, Tr, Th, Td, Tag, TagLabel, useToast, Menu, MenuButton, MenuList, MenuItem, IconButton, Wrap } from '@chakra-ui/react';
import { supabase } from '../supabaseClient';
import { ChevronDownIcon } from '@chakra-ui/icons';

const VolunteerStatusBoard = ({ majorIncidentId, refreshTrigger }) => {
    const [stats, setStats] = useState({
        totalVolunteers: 0,
        assignedVolunteers: 0,
        availableVolunteers: 0,
        skillDistribution: {}
    });
    const [volunteers, setVolunteers] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [skillFilter, setSkillFilter] = useState('');
    const [assignmentFilter, setAssignmentFilter] = useState('');
    const toast = useToast();

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
            const { data: assignmentsData, error: assignmentsError } = await supabase
                .from('major_incident_volunteer_assignments')
                .select(`
                    id,
                    pool_entry_id,
                    organization_id,
                    status,
                    assigned_at,
                    organization:profiles(id, organization_name)
                `)
                .in('pool_entry_id', poolData.map(entry => entry.id));

            if (assignmentsError) throw assignmentsError;

            setAssignments(assignmentsData);

            // Get opportunities separately
            const { data: opportunities, error: opportunitiesError } = await supabase
                .from('volunteer_opportunities')
                .select('id, title, status')
                .eq('major_incident_id', majorIncidentId);

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

            // Calculate skill distribution
            const skillCounts = {};
            signupsData.forEach(signup => {
                signup.skills?.forEach(skill => {
                    skillCounts[skill] = (skillCounts[skill] || 0) + 1;
                });
            });

            // Create opportunities lookup map
            const opportunitiesMap = {};
            opportunities?.forEach(opp => {
                opportunitiesMap[opp.id] = opp;
            });

            // Process and combine all data
            const processedVolunteers = poolData.map(entry => {
                const profile = profileMap[entry.volunteer_id] || {};
                const signup = signupsMap[entry.volunteer_id] || {};
                const assignment = assignmentsData.find(a => a.pool_entry_id === entry.id);

                // A volunteer is only considered assigned if they have an active assignment
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
                        id: assignment.id,
                        organizationId: assignment.organization_id,
                        organizationName: assignment.organization?.organization_name,
                        opportunityTitle: `Assigned to ${assignment.organization?.organization_name} (Status: ${assignment.status}, Assigned: ${new Date(assignment.assigned_at).toLocaleString()})`
                    } : null
                };
            });

            // Update stats
            const assignedCount = processedVolunteers.filter(v => v.isAssigned).length;
            setStats({
                totalVolunteers: processedVolunteers.length,
                assignedVolunteers: assignedCount,
                availableVolunteers: processedVolunteers.length - assignedCount,
                skillDistribution: skillCounts
            });

            setVolunteers(processedVolunteers);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching volunteers:', error);
            toast({
                title: "Error fetching volunteers",
                description: error.message,
                status: "error",
                duration: 5000
            });
            setLoading(false);
        }
    };

    const handleUnassignVolunteer = async (assignmentId) => {
        try {
            const { error } = await supabase
                .from('major_incident_volunteer_assignments')
                .update({ status: 'inactive' })
                .eq('id', assignmentId);

            if (error) throw error;

            toast({
                title: "Success",
                description: "Volunteer unassigned successfully",
                status: "success",
                duration: 3000
            });

            // Refresh the volunteer list
            fetchVolunteers();
        } catch (error) {
            console.error('Error unassigning volunteer:', error);
            toast({
                title: "Error unassigning volunteer",
                description: error.message,
                status: "error",
                duration: 5000
            });
        }
    };

    useEffect(() => {
        if (majorIncidentId) {
            fetchVolunteers();
        }
    }, [majorIncidentId, refreshTrigger]);

    // Filter volunteers based on selected filters
    const filteredVolunteers = volunteers.filter(volunteer => {
        const matchesSkill = !skillFilter || volunteer.skills.includes(skillFilter);
        const matchesAssignment = !assignmentFilter ||
            (assignmentFilter === 'assigned' && volunteer.isAssigned) ||
            (assignmentFilter === 'available' && !volunteer.isAssigned);
        return matchesSkill && matchesAssignment;
    });

    if (loading) {
        return <Text>Loading volunteer data...</Text>;
    }

    return (
        <VStack spacing={6} align="stretch" width="100%">
            {/* Filters */}
            <HStack spacing={4}>
                <Select
                    placeholder="Filter by skill"
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                    maxW="200px"
                >
                    {Object.entries(stats.skillDistribution).map(([skill, count]) => (
                        <option key={skill} value={skill}>
                            {skill} ({count})
                        </option>
                    ))}
                </Select>
                <Select
                    placeholder="Filter by assignment"
                    value={assignmentFilter}
                    onChange={(e) => setAssignmentFilter(e.target.value)}
                    maxW="200px"
                >
                    <option value="assigned">Currently Assigned</option>
                    <option value="available">Available</option>
                </Select>
            </HStack>

            {/* Volunteer Table */}
            <Box overflowX="auto">
                <Table variant="simple" bg="white" shadow="sm" borderRadius="lg">
                    <Thead>
                        <Tr>
                            <Th>Volunteer</Th>
                            <Th>Availability</Th>
                            <Th>Skills</Th>
                            <Th>Assignment</Th>
                            <Th>Organization</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {filteredVolunteers.map(volunteer => (
                            <Tr key={volunteer.id}>
                                <Td>{volunteer.name}</Td>
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
                                    <HStack spacing={2} wrap="wrap">
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
                                    </HStack>
                                </Td>
                                <Td>
                                    {volunteer.isAssigned ? (
                                        <VStack align="start" spacing={0}>
                                            <HStack justify="space-between" width="100%">
                                                <Text>{volunteer.assignment.opportunityTitle}</Text>
                                                <Menu>
                                                    <MenuButton
                                                        as={IconButton}
                                                        icon={<ChevronDownIcon />}
                                                        variant="ghost"
                                                        size="sm"
                                                    />
                                                    <MenuList>
                                                        <MenuItem 
                                                            onClick={() => handleUnassignVolunteer(volunteer.assignment.id)}
                                                        >
                                                            Unassign Volunteer
                                                        </MenuItem>
                                                    </MenuList>
                                                </Menu>
                                            </HStack>
                                            <Text fontSize="xs" color="gray.500">
                                                Assignment ID: {volunteer.assignment.id}
                                            </Text>
                                        </VStack>
                                    ) : (
                                        <Badge colorScheme="green">Available</Badge>
                                    )}
                                </Td>
                                <Td>
                                    {volunteer.isAssigned ?
                                        volunteer.assignment.organizationName :
                                        '-'
                                    }
                                </Td>
                            </Tr>
                        ))}
                        {filteredVolunteers.length === 0 && (
                            <Tr>
                                <Td colSpan={5} textAlign="center">
                                    No volunteers found matching the current filters.
                                </Td>
                            </Tr>
                        )}
                    </Tbody>
                </Table>
            </Box>

            {/* Stats */}
            <StatGroup bg="white" p={4} borderRadius="lg" shadow="sm">
                <Stat>
                    <StatLabel>Total Volunteers</StatLabel>
                    <StatNumber>{stats.totalVolunteers}</StatNumber>
                </Stat>
                <Stat>
                    <StatLabel>Currently Assigned</StatLabel>
                    <StatNumber>{stats.assignedVolunteers}</StatNumber>
                </Stat>
                <Stat>
                    <StatLabel>Available</StatLabel>
                    <StatNumber>{stats.availableVolunteers}</StatNumber>
                </Stat>
            </StatGroup>
        </VStack>
    );
};

export default VolunteerStatusBoard;