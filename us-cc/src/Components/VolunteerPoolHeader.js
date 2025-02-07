import React, { useState, useEffect } from 'react';
import {
    Box,
    HStack,
    VStack,
    Text,
    Button,
    StatGroup,
    Stat,
    StatLabel,
    StatNumber,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    useDisclosure,
    Alert,
    AlertIcon,
    useToast,
    Badge,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const VolunteerPoolHeader = ({ majorIncidentId, onVolunteerJoin, refreshTrigger, hideStats  = false }) => {
    const [stats, setStats] = useState({
        totalVolunteers: 0,
        availableVolunteers: 0,
        totalOrganizations: 0,
        skillDistribution: {}
    });
    const [isVolunteer, setIsVolunteer] = useState(false);
    const [isAlreadyInPool, setIsAlreadyInPool] = useState(false);
    const [loading, setLoading] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const navigate = useNavigate();
    const [isOrganization, setIsOrganization] = useState(false);

    useEffect(() => {
        const checkUserRole = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setIsOrganization(user?.user_metadata?.is_organization || false);
        };
        checkUserRole();
        fetchStats();
    }, []);

    useEffect(() => {
        if (majorIncidentId) {
            checkVolunteerStatus();
            fetchStats();
        }
    }, [majorIncidentId, refreshTrigger]);

    useEffect(() => {
        if (!majorIncidentId) return;

        const channel = supabase
            .channel(`volunteer-pool-${majorIncidentId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'major_incident_volunteer_pool',
                filter: `major_incident_id=eq.${majorIncidentId}`
            }, () => {
                fetchStats();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [majorIncidentId]);

    const checkVolunteerStatus = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setIsVolunteer(false);
                setIsAlreadyInPool(false);
                return;
            }

            // First check if user is a volunteer
            const { data: volunteerData, error: volunteerError } = await supabase
                .from('volunteer_signups')
                .select('id')
                .eq('user_id', user.id);

            // Handle case where no volunteer signup exists
            if (volunteerError || !volunteerData || volunteerData.length === 0) {
                setIsVolunteer(false);
                setIsAlreadyInPool(false);
                return;
            }

            setIsVolunteer(true);

            // Only check pool status if they are a volunteer
            const { data: poolEntry, error: poolError } = await supabase
                .from('major_incident_volunteer_pool')
                .select('id')
                .eq('major_incident_id', majorIncidentId)
                .eq('volunteer_id', user.id)
                .single();

            // Don't throw on .single() error, just means they're not in pool
            if (!poolError) {
                setIsAlreadyInPool(!!poolEntry);
            } else {
                setIsAlreadyInPool(false);
            }

        } catch (error) {
            console.error('Error checking volunteer status:', error);
            // Set safe default values
            setIsVolunteer(false);
            setIsAlreadyInPool(false);
        }
    };

    const fetchStats = async () => {
        try {
            // Get total volunteers in pool
            const { count: totalVolunteers } = await supabase
                .from('major_incident_volunteer_pool')
                .select('*', { count: 'exact' })
                .eq('major_incident_id', majorIncidentId);

            // Get total organizations participating
            const { count: totalOrganizations } = await supabase
                .from('major_incident_organizations')
                .select('*', { count: 'exact' })
                .eq('major_incident_id', majorIncidentId);

            // Get volunteers with active assignments
            const { count: assignedVolunteers } = await supabase
                .from('major_incident_volunteer_assignments')
                .select('*', { count: 'exact' })
                .eq('status', 'active');

            // Get skill distribution
            const { data: poolData } = await supabase
                .from('major_incident_volunteer_pool')
                .select('volunteer_id')
                .eq('major_incident_id', majorIncidentId);

            const volunteerIds = poolData?.map(entry => entry.volunteer_id) || [];

            // Only fetch skills if we have volunteers
            let skillCounts = {};
            if (volunteerIds.length > 0) {
                const { data: volunteerSignups } = await supabase
                    .from('volunteer_signups')
                    .select('skills')
                    .in('user_id', volunteerIds);

                // Count skills
                volunteerSignups?.forEach(signup => {
                    signup.skills?.forEach(skill => {
                        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
                    });
                });
            }

            setStats({
                totalVolunteers: totalVolunteers || 0,
                availableVolunteers: (totalVolunteers || 0) - (assignedVolunteers || 0),
                totalOrganizations: totalOrganizations || 0,
                skillDistribution: skillCounts
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleJoinPool = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase
                .from('major_incident_volunteer_pool')
                .insert([{
                    major_incident_id: majorIncidentId,
                    volunteer_id: user.id
                }]);

            if (error) throw error;

            toast({
                title: "Success!",
                description: "You've joined the volunteer pool",
                status: "success",
                duration: 3000
            });

            setIsAlreadyInPool(true);
            onVolunteerJoin?.();
            fetchStats();
            onClose();
        } catch (error) {
            toast({
                title: "Error joining pool",
                description: error.message,
                status: "error",
                duration: 5000
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {!isOrganization ? (
                <Box bg="white" p={6} borderRadius="lg" shadow="sm" mb={4}>
                    <Alert status="warning">
                        <AlertIcon />
                        Only organizations can access the volunteer pool.
                    </Alert>
                </Box>
            ) : (
                <Box bg="white" p={6} borderRadius="lg" shadow="sm" mb={4}>
                    <VStack spacing={6} align="stretch">
                        <HStack justify="space-between">
                            <Text fontSize="2xl" fontWeight="bold">Volunteer Pool</Text>
                        </HStack>

                        <StatGroup>
                            <Stat>
                                <StatLabel>Total Volunteers</StatLabel>
                                <StatNumber>{stats.totalVolunteers}</StatNumber>
                            </Stat>
                            <Stat>
                                <StatLabel>Available Volunteers</StatLabel>
                                <StatNumber>{stats.availableVolunteers}</StatNumber>
                            </Stat>
                            <Stat>
                                <StatLabel>Organizations</StatLabel>
                                <StatNumber>{stats.totalOrganizations}</StatNumber>
                            </Stat>
                        </StatGroup>

                        {/* Join Pool Modal */}
                        <Modal isOpen={isOpen} onClose={onClose}>
                            <ModalOverlay />
                            <ModalContent>
                                <ModalHeader>Join Volunteer Pool</ModalHeader>
                                <ModalCloseButton />
                                <ModalBody>
                                    <Alert status="info" mb={4}>
                                        <AlertIcon />
                                        By joining this volunteer pool, you'll be available to help multiple organizations responding to this major incident.
                                    </Alert>
                                    <Text>Your current skills and availability will be shared with participating organizations.</Text>
                                </ModalBody>
                                <ModalFooter>
                                    <Button mr={3} onClick={onClose}>Cancel</Button>
                                    <Button
                                        colorScheme="blue"
                                        onClick={handleJoinPool}
                                        isLoading={loading}
                                    >
                                        Join Pool
                                    </Button>
                                </ModalFooter>
                            </ModalContent>
                        </Modal>
                    </VStack>
                </Box>
            )}
        </>
    );
};

export default VolunteerPoolHeader;