import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Button,
    VStack,
    HStack,
    useToast,
    Text,
    Select,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Alert,
    AlertIcon
} from '@chakra-ui/react';
import { supabase } from '../supabaseClient';
import LocationMapPreview from './LocationMapPreview';
import { MdMyLocation } from 'react-icons/md';
import LocationSearch from './LocationSearch';

const CreateMajorIncidentModal = ({ isOpen, onClose, onCreateSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        severity_level: 'medium',
        radius_miles: 50,
        expected_duration_days: 7,
        location: '',
        position: null
    });
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const toast = useToast();

    useEffect(() => {
        if (isOpen) {
            getCurrentLocation();
        }
    }, [isOpen]);

    const getCurrentLocation = () => {
        setIsLoadingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        position: {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        }
                    }));
                    setIsLoadingLocation(false);
                },
                (error) => {
                    console.error("Error obtaining location:", error);
                    toast({
                        title: "Location Error",
                        description: "Could not get your location. Please select on map.",
                        status: "error",
                        duration: 5000
                    });
                    setIsLoadingLocation(false);
                }
            );
        }
    };

    const handleSubmit = async () => {
        if (!formData.position) {
            toast({
                title: "Location Required",
                description: "Please select a location on the map",
                status: "error",
                duration: 3000
            });
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Create major incident
            const { data: majorIncident, error: majorIncidentError } = await supabase
                .from('major_incidents')
                .insert([{
                    title: formData.title,
                    description: formData.description,
                    severity_level: formData.severity_level,
                    radius_miles: formData.radius_miles,
                    expected_duration: `${formData.expected_duration_days} days`,
                    created_by: user.id,
                    location_lat: formData.position.lat,
                    location_lng: formData.position.lng,
                    status: 'active'
                }])
                .select()
                .single();

            if (majorIncidentError) throw majorIncidentError;

            // Add creating organization as participant
            const { error: orgError } = await supabase
                .from('major_incident_organizations')
                .insert([{
                    major_incident_id: majorIncident.id,
                    organization_id: user.id,
                    role: 'coordinator'
                }]);

            if (orgError) throw orgError;

            // Create initial update
            const { error: updateError } = await supabase
                .from('major_incident_updates')
                .insert([{
                    major_incident_id: majorIncident.id,
                    organization_id: user.id,
                    update_type: 'status',
                    content: 'Major incident created and response coordination initiated.',
                    priority_level: 'important',
                    is_public: true
                }]);

            if (updateError) throw updateError;

            // Create coordination channel
            const { error: channelError } = await supabase
                .from('coordination_channels')
                .insert([{
                    major_incident_id: majorIncident.id,
                    name: 'General',
                    description: 'Main coordination channel for this incident',
                    channel_type: 'general'
                }]);

            if (channelError) throw channelError;

            toast({
                title: "Success",
                description: "Major incident created successfully",
                status: "success",
                duration: 3000
            });

            if (onCreateSuccess) {
                onCreateSuccess(majorIncident);
            }
            onClose();

        } catch (error) {
            toast({
                title: "Error creating major incident",
                description: error.message,
                status: "error",
                duration: 5000
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent maxW="800px">
                <ModalHeader>Create Major Incident</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <VStack spacing={4}>
                        <Alert status="warning">
                            <AlertIcon />
                            Creating a major incident will initiate a coordinated response platform for multiple organizations.
                        </Alert>

                        <FormControl isRequired>
                            <FormLabel>Title</FormLabel>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    title: e.target.value
                                }))}
                                placeholder="Enter incident title"
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Description</FormLabel>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    description: e.target.value
                                }))}
                                placeholder="Describe the incident in detail"
                                rows={4}
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Severity Level</FormLabel>
                            <Select
                                value={formData.severity_level}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    severity_level: e.target.value
                                }))}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </Select>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Impact Radius (miles)</FormLabel>
                            <NumberInput
                                value={formData.radius_miles}
                                onChange={(value) => setFormData(prev => ({
                                    ...prev,
                                    radius_miles: parseInt(value)
                                }))}
                                min={1}
                                max={500}
                            >
                                <NumberInputField />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Expected Duration (days)</FormLabel>
                            <NumberInput
                                value={formData.expected_duration_days}
                                onChange={(value) => setFormData(prev => ({
                                    ...prev,
                                    expected_duration_days: parseInt(value)
                                }))}
                                min={1}
                                max={365}
                            >
                                <NumberInputField />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Location</FormLabel>
                            <VStack spacing={2} align="stretch">
                                <LocationSearch
                                    mode="address"
                                    placeholder="Search for an address..."
                                    onSelect={(locationData) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            location: locationData.address,
                                            position: {
                                                lat: locationData.lat,
                                                lng: locationData.lng
                                            }
                                        }));
                                    }}
                                />
                                <HStack mb={2}>
                                    <Button
                                        onClick={getCurrentLocation}
                                        isLoading={isLoadingLocation}
                                        leftIcon={<MdMyLocation />}
                                    >
                                        Use Current Location
                                    </Button>
                                    {formData.position && (
                                        <Text fontSize="sm" color="gray.600">
                                            Lat: {formData.position.lat.toFixed(6)}, Lng: {formData.position.lng.toFixed(6)}
                                        </Text>
                                    )}
                                </HStack>
                                <LocationMapPreview
                                    position={formData.position}
                                    setPosition={(pos) => setFormData(prev => ({
                                        ...prev,
                                        position: pos
                                    }))}
                                />
                            </VStack>
                        </FormControl>

                        <HStack spacing={4} width="100%" justify="flex-end">
                            <Button onClick={onClose}>Cancel</Button>
                            <Button colorScheme="blue" onClick={handleSubmit}>
                                Create Major Incident
                            </Button>
                        </HStack>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default CreateMajorIncidentModal;