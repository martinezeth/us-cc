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
    Select
} from '@chakra-ui/react';
import { supabase } from '../supabaseClient';
import LocationMapPreview from './LocationMapPreview';
import { MdMyLocation } from 'react-icons/md';
import { INCIDENT_TYPES } from '../constants/incidentTypes';


const CreateIncidentModal = ({ isOpen, onClose, onCreateSuccess }) => {
    const [incidentType, setIncidentType] = useState('');
    const [description, setDescription] = useState('');
    const [position, setPosition] = useState(null);
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
                    setPosition({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
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
        if (!position) {
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
            const { data, error } = await supabase
                .from('incidents')
                .insert([{
                    incident_type: incidentType,
                    description: description,
                    location_lat: position.lat,
                    location_lng: position.lng,
                    created_by: user.id,
                    timestamp: new Date().toISOString()
                }])
                .select();

            if (error) throw error;

            toast({
                title: "Success",
                description: "Incident reported successfully",
                status: "success",
                duration: 3000
            });

            // Reset form
            setIncidentType('');
            setDescription('');
            setPosition(null);

            if (onCreateSuccess) onCreateSuccess();
            onClose();
        } catch (error) {
            toast({
                title: "Error creating incident",
                description: error.message,
                status: "error",
                duration: 5000
            });
        }
    };

    const handleCancel = () => {
        setIncidentType('');
        setDescription('');
        setPosition(null);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleCancel} size="xl">
            <ModalOverlay />
            <ModalContent maxW="800px">
                <ModalHeader>Report New Incident</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <VStack spacing={4}>
                        <FormControl isRequired>
                            <FormLabel>Incident Type</FormLabel>
                            <Select
                                value={incidentType}
                                onChange={(e) => setIncidentType(e.target.value)}
                                placeholder="Select incident type"
                            >
                                {Object.entries(INCIDENT_TYPES).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Description</FormLabel>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the incident"
                                rows={4}
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Location</FormLabel>
                            <HStack mb={2}>
                                <Button
                                    onClick={getCurrentLocation}
                                    isLoading={isLoadingLocation}
                                    leftIcon={<MdMyLocation />}
                                >
                                    Use Current Location
                                </Button>
                                {position && (
                                    <Text fontSize="sm" color="gray.600">
                                        Lat: {position.lat.toFixed(6)}, Lng: {position.lng.toFixed(6)}
                                    </Text>
                                )}
                            </HStack>
                            <LocationMapPreview
                                position={position}
                                setPosition={setPosition}
                            />
                        </FormControl>

                        <HStack spacing={4} width="100%" justify="flex-end">
                            <Button onClick={handleCancel}>Cancel</Button>
                            <Button colorScheme="blue" onClick={handleSubmit}>
                                Submit Report
                            </Button>
                        </HStack>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default CreateIncidentModal;