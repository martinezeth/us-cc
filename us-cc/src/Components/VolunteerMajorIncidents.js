import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    Grid,
    Heading,
    Text,
    Badge,
    useToast,
    Button,
    HStack
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const VolunteerMajorIncidents = () => {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        fetchIncidents();
    }, []);

    const fetchIncidents = async () => {
        try {
            const { data, error } = await supabase
            .from('major_incidents')
            .select(`
                *,
                major_incident_organizations!inner(
                    organization:profiles!inner(
                        id,
                        organization_name
                    )
                )
            `)
            .eq('status', 'active')
            .is('deleted_at', null)  // Changed to check deleted_at is null
            .order('created_at', { ascending: false });

            if (error) throw error;
            const validIncidents = (data || []).filter(incident => 
                incident.id && 
                incident.title && 
                incident.major_incident_organizations?.length > 0
            );
            setIncidents(validIncidents);
        } catch (error) {
            console.error('Error fetching incidents:', error);
            toast({
                title: "Error",
                description: "Failed to load major incidents",
                status: "error",
                duration: 5000
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const interval = setInterval(fetchIncidents, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return <Text textAlign="center">Loading major incidents...</Text>;
    }

    return (
        <VStack spacing={6} align="stretch">
            <Heading size="lg">Major Incidents</Heading>
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
                        <VStack align="stretch" spacing={4}>
                            <HStack justify="space-between">
                                <Heading size="md">{incident.title}</Heading>
                                <Badge colorScheme={
                                    incident.severity_level === 'high' ? 'red' :
                                        incident.severity_level === 'medium' ? 'orange' : 'yellow'
                                }>
                                    {incident.severity_level.toUpperCase()}
                                </Badge>
                            </HStack>
                            <Text noOfLines={3}>{incident.description}</Text>
                            <Text color="gray.600">
                                Impact Radius: {incident.radius_miles} miles
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                                Organizations Involved: {incident.major_incident_organizations.length}
                            </Text>
                            <Button
                                colorScheme="blue"
                                onClick={() => navigate(`/major-incident/${incident.id}`)}
                            >
                                View Details
                            </Button>
                        </VStack>
                    </Box>
                ))}
                {incidents.length === 0 && (
                    <Text textAlign="center" color="gray.500">
                        No active major incidents at this time.
                    </Text>
                )}
            </Grid>
        </VStack>
    );
};

export default VolunteerMajorIncidents;