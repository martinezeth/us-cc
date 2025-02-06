import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    VStack,
    HStack,
    Text,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    useToast,
    Select,
    Input,
    InputGroup,
    InputLeftElement,
    Tag,
    TagLabel,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    IconButton,
    Wrap,
    WrapItem
} from '@chakra-ui/react';
import { SearchIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { supabase } from '../supabaseClient';

const VolunteerPool = ({ majorIncidentId }) => {
    const navigate = useNavigate();
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [skillFilter, setSkillFilter] = useState('');
    const [availableSkills, setAvailableSkills] = useState([]);
    const toast = useToast();
    const [isOrganization, setIsOrganization] = useState(false);

    useEffect(() => {
        const checkUserRole = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            const isOrg = user?.user_metadata?.is_organization || false;
            setIsOrganization(isOrg);
            
            // If not an organization, redirect away
            if (!isOrg) {
                toast({
                    title: "Access Denied",
                    description: "Only organizations can access the volunteer pool",
                    status: "error",
                    duration: 5000
                });
                navigate('/');
            }
        };
        checkUserRole();
    }, [navigate, toast]);

    useEffect(() => {
        fetchVolunteerPool();
    }, [majorIncidentId]);

    const fetchVolunteerPool = async () => {
        try {
            setLoading(true);
            // Get current organization
            const { data: { user } } = await supabase.auth.getUser();

            const { data: poolData, error: poolError } = await supabase
                .from('major_incident_volunteer_pool')
                .select(`
                id,
                volunteer_id,
                volunteer:profiles!major_incident_volunteer_pool_volunteer_id_fkey (
                    id,
                    full_name,
                    city,
                    state
                ),
                assignments:major_incident_volunteer_assignments (
                    organization_id,
                    status
                )
            `)
                .eq('major_incident_id', majorIncidentId);

            if (poolError) throw poolError;

            // Get volunteer skills/availability in a separate query
            const volunteerIds = poolData.map(entry => entry.volunteer_id);
            const { data: volunteerSignups, error: signupsError } = await supabase
                .from('volunteer_signups')
                .select('user_id, skills, availability')
                .in('user_id', volunteerIds);

            if (signupsError) throw signupsError;

            // Create a lookup map for volunteer signups
            const signupsMap = {};
            volunteerSignups?.forEach(signup => {
                signupsMap[signup.user_id] = signup;
            });

            // Process volunteer data
            const processedVolunteers = poolData.map(entry => ({
                id: entry.volunteer_id,
                poolEntryId: entry.id,
                name: entry.volunteer?.full_name || 'Unknown',
                location: entry.volunteer ? `${entry.volunteer.city || ''}, ${entry.volunteer.state || ''}` : '',
                skills: signupsMap[entry.volunteer_id]?.skills || [],
                availability: signupsMap[entry.volunteer_id]?.availability || [],
                assignments: entry.assignments || []
            }));

            // Collect all unique skills for filtering
            const skills = new Set();
            processedVolunteers.forEach(volunteer => {
                volunteer.skills.forEach(skill => skills.add(skill));
            });
            setAvailableSkills(Array.from(skills));

            setVolunteers(processedVolunteers);
        } catch (error) {
            console.error('Error fetching volunteer pool:', error);
            toast({
                title: "Error loading volunteer pool",
                description: error.message,
                status: "error",
                duration: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAssignVolunteer = async (volunteerId, poolEntryId) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Check if assignment already exists
            const { data: existingAssignment } = await supabase
                .from('major_incident_volunteer_assignments')
                .select('id')
                .eq('pool_entry_id', poolEntryId)
                .eq('organization_id', user.id)
                .single();

            if (existingAssignment) {
                toast({
                    title: "Already assigned",
                    description: "This volunteer is already assigned to your organization",
                    status: "warning",
                    duration: 3000
                });
                return;
            }

            // Create new assignment
            const { error: assignError } = await supabase
                .from('major_incident_volunteer_assignments')
                .insert([{
                    pool_entry_id: poolEntryId,
                    organization_id: user.id,
                    status: 'active'
                }]);

            if (assignError) throw assignError;

            toast({
                title: "Success",
                description: "Volunteer assigned successfully",
                status: "success",
                duration: 3000
            });

            // Refresh volunteer pool
            fetchVolunteerPool();
        } catch (error) {
            toast({
                title: "Error",
                description: error.message,
                status: "error",
                duration: 5000
            });
        }
    };

    // Filter volunteers based on search query and skill filter
    const filteredVolunteers = volunteers.filter(volunteer => {
        const matchesSearch = volunteer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            volunteer.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSkill = !skillFilter || volunteer.skills.includes(skillFilter);
        return matchesSearch && matchesSkill;
    });

    if (!isOrganization) {
        return null;
    }

    return (
        <Box>
            <VStack spacing={4} align="stretch">
                {/* Filters */}
                <HStack spacing={4}>
                    <InputGroup maxW="300px">
                        <InputLeftElement pointerEvents="none">
                            <SearchIcon color="gray.400" />
                        </InputLeftElement>
                        <Input
                            placeholder="Search volunteers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </InputGroup>
                    <Select
                        placeholder="Filter by skill"
                        value={skillFilter}
                        onChange={(e) => setSkillFilter(e.target.value)}
                        maxW="200px"
                    >
                        {availableSkills.map(skill => (
                            <option key={skill} value={skill}>{skill}</option>
                        ))}
                    </Select>
                </HStack>

                {/* Volunteer Table */}
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Volunteer</Th>
                            <Th>Location</Th>
                            <Th>Skills</Th>
                            <Th>Availability</Th>
                            <Th>Current Assignments</Th>
                            <Th>Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {filteredVolunteers.map(volunteer => (
                            <Tr key={volunteer.id}>
                                <Td>{volunteer.name}</Td>
                                <Td>{volunteer.location}</Td>
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
                                        {volunteer.availability.map(time => (
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
                                    <Badge>
                                        {volunteer.assignments.length} organization(s)
                                    </Badge>
                                </Td>
                                <Td>
                                    <Menu>
                                        <MenuButton
                                            as={IconButton}
                                            icon={<ChevronDownIcon />}
                                            variant="ghost"
                                            size="sm"
                                        />
                                        <MenuList>
                                            <MenuItem
                                                onClick={() => handleAssignVolunteer(volunteer.id, volunteer.poolEntryId)}
                                            >
                                                Assign to Organization
                                            </MenuItem>
                                            <MenuItem>
                                                Send Message
                                            </MenuItem>
                                        </MenuList>
                                    </Menu>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>

                {loading && (
                    <Text textAlign="center" color="gray.500">
                        Loading volunteer pool...
                    </Text>
                )}

                {!loading && filteredVolunteers.length === 0 && (
                    <Text textAlign="center" color="gray.500">
                        No volunteers found matching your criteria.
                    </Text>
                )}
            </VStack>
        </Box>
    );
};

export default VolunteerPool;