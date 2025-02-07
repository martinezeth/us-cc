import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Badge, Stat, StatLabel, StatNumber, StatGroup, Select, Table, Thead, Tbody, Tr, Th, Td, Tag, TagLabel, useToast, Menu, MenuButton, MenuList, MenuItem, IconButton, Wrap, Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { ChevronDownIcon, SearchIcon } from '@chakra-ui/icons';
import { supabase } from '../supabaseClient';
import {
    processVolunteerData,
    filterVolunteers,
    calculatePoolStats,
    sortVolunteers,
    getSkillMatch
} from '../utils/volunteerPoolHelpers';
import VolunteerFilterBar from './VolunteerFilterBar';

const VolunteerStatusBoard = ({ majorIncidentId, refreshTrigger }) => {
    const [volunteers, setVolunteers] = useState([]);
    const [filters, setFilters] = useState({
        status: 'available',
        skill: '',
        searchQuery: '',
        sortBy: 'skills'
    });
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [availableSkills, setAvailableSkills] = useState([]);
    const toast = useToast();

    useEffect(() => {
        fetchVolunteers();
    }, [majorIncidentId, refreshTrigger]);

    const fetchVolunteers = async () => {
        try {
            setLoading(true);

            const { data: poolData, error: poolError } = await supabase
                .from('major_incident_volunteer_pool')
                .select('*')
                .eq('major_incident_id', majorIncidentId);

            if (poolError) throw poolError;

            const { data: assignments } = await supabase
                .from('major_incident_volunteer_assignments')
                .select('*')
                .in('pool_entry_id', poolData.map(entry => entry.id));

            const { data: profiles } = await supabase
                .from('profiles')
                .select('*')
                .in('id', poolData.map(entry => entry.volunteer_id));

            const { data: signups } = await supabase
                .from('volunteer_signups')
                .select('*')
                .in('user_id', poolData.map(entry => entry.volunteer_id));

            const orgIds = assignments?.map(a => a.organization_id) || [];
            const { data: orgProfiles } = await supabase
                .from('profiles')
                .select('*')
                .in('id', orgIds);

            const processedVolunteers = processVolunteerData(
                poolData,
                assignments,
                profiles,
                signups,
                orgProfiles
            );

            const poolStats = calculatePoolStats(processedVolunteers);
            setStats(poolStats);

            const filteredVolunteers = filterVolunteers(processedVolunteers, filters);
            const sortedVolunteers = sortVolunteers(filteredVolunteers, filters.sortBy);

            setVolunteers(sortedVolunteers);

        } catch (error) {
            console.error('Error fetching volunteers:', error);
            toast({
                title: "Error fetching volunteer data",
                description: error.message,
                status: "error",
                duration: 5000
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({
            ...prev,
            ...newFilters
        }));

        const filteredVolunteers = filterVolunteers(volunteers, {
            ...filters,
            ...newFilters
        });
        const sortedVolunteers = sortVolunteers(filteredVolunteers, filters.sortBy);
        setVolunteers(sortedVolunteers);
    };

    const getFilteredVolunteers = () => {
        let filtered = [...volunteers];

        filtered = filterVolunteers(filtered, filters);

        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            filtered = filtered.filter(volunteer =>
                volunteer.name.toLowerCase().includes(query) ||
                volunteer.location.toLowerCase().includes(query) ||
                volunteer.skills.some(skill =>
                    skill.toLowerCase().includes(query)
                )
            );
        }

        return sortVolunteers(filtered, filters.sortBy);
    };

    const filteredVolunteers = getFilteredVolunteers();

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

    if (loading) {
        return <Text>Loading volunteer data...</Text>;
    }

    return (
        <VStack spacing={6} align="stretch">
            <VolunteerFilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                stats={stats}
            />

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
        </VStack>
    );
};

export default VolunteerStatusBoard;