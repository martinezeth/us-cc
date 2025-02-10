import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Heading,
    Text,
    Badge,
    VStack,
    HStack,
    Button,
    useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const AvailableMajorIncidents = ({ userLocation }) => {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        fetchAvailableIncidents();
    }, [userLocation]);

    const fetchAvailableIncidents = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Get organization's profile for location
            const { data: profile } = await supabase
                .from('profiles')
                .select('state')
                .eq('id', user.id)
                .single();

            const { data: incidents, error } = await supabase
                .from('major_incidents')
                .select(`
                    *,
                    major_incident_organizations!inner(
                        organization_id
                    )
                `)
                .eq('status', 'active')
                .is('deleted_at', null)
                .not('major_incident_organizations.organization_id', 'eq', user.id);

            if (error) throw error;

            const filteredIncidents = profile?.state
                ? incidents.filter(incident => {
                    return incident.state === profile.state;
                })
                : incidents;

            setIncidents(filteredIncidents);
        } catch (error) {
            console.error('Error fetching incidents:', error);
            toast({
                title: "Error",
                description: "Failed to load available incidents",
                status: "error",
                duration: 5000
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <VStack spacing={4} align="stretch">
            <Heading size="md">Available Major Incidents</Heading>
            <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
                {incidents.map(incident => (
                    <Box
                        key={incident.id}
                        p={6}
                        bg="white"
                        borderRadius="lg"
                        shadow="sm"
                        border="1px solid"
                        borderColor="gray.100"
                        _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                        transition="all 0.2s"
                    >
                        <VStack align="stretch" spacing={3}>
                            <Heading size="md">{incident.title}</Heading>
                            <HStack>
                                <Badge colorScheme={
                                    incident.severity_level === 'high' ? 'red' :
                                        incident.severity_level === 'medium' ? 'orange' :
                                            'yellow'
                                }>
                                    {incident.severity_level.toUpperCase()}
                                </Badge>
                                <Text fontSize="sm" color="gray.500">
                                    Created: {new Date(incident.created_at).toLocaleDateString()}
                                </Text>
                            </HStack>
                            <Text noOfLines={3}>{incident.description}</Text>
                            <Button
                                colorScheme="blue"
                                onClick={() => navigate(`/major-incident/${incident.id}`)}
                            >
                                View Details
                            </Button>
                        </VStack>
                    </Box>
                ))}
                {incidents.length === 0 && !loading && (
                    <Text color="gray.500">
                        No available major incidents. You'll see incidents here when other organizations initiate major incident responses that you haven't joined yet.
                    </Text>
                )}
            </Grid>
        </VStack>
    );
};

export default AvailableMajorIncidents;