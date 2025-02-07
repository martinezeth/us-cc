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
    AlertIcon,
    Box,
    ModalFooter,
    FormErrorMessage,
    Tag,
    TagLabel,
    TagCloseButton,
    Wrap,
    WrapItem,
} from '@chakra-ui/react';
import { MdMyLocation } from 'react-icons/md';
import { supabase } from '../supabaseClient';
import LocationMapPreview from './LocationMapPreview';
import LocationSearch from './LocationSearch';
import { STANDARD_SKILLS } from '../constants/incidentTypes';

const CreateVolunteerOpportunityModal = ({
    isOpen,
    onClose,
    onCreateSuccess,
    majorIncidentId = null,
    majorIncidentData = null
}) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        position: null,
        radius_miles: 10,
        required_skills: [],
        newSkill: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const toast = useToast();

    useEffect(() => {
        if (isOpen) {
            // If we have major incident data, use its location
            if (majorIncidentData && majorIncidentData.location_lat && majorIncidentData.location_lng) {
                setFormData(prev => ({
                    ...prev,
                    position: {
                        lat: majorIncidentData.location_lat,
                        lng: majorIncidentData.location_lng
                    }
                }));
            } else {
                // If no major incident data, get current location
                getCurrentLocation();
            }
        }
    }, [isOpen, majorIncidentData]);

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

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = "Title is required";
        if (!formData.description.trim()) newErrors.description = "Description is required";
        if (!formData.position) newErrors.position = "Location is required";
        if (formData.required_skills.length === 0) newErrors.skills = "At least one skill is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields",
                status: "error",
                duration: 3000
            });
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();

            const opportunityData = {
                organization_id: user.id,
                title: formData.title,
                description: formData.description,
                location: formData.location,
                location_lat: formData.position.lat,
                location_lng: formData.position.lng,
                radius_miles: formData.radius_miles,
                required_skills: formData.required_skills,
                status: 'open',
                major_incident_id: majorIncidentId
            };

            const { data, error } = await supabase
                .from('volunteer_opportunities')
                .insert([opportunityData])
                .select()
                .single();

            if (error) throw error;

            toast({
                title: "Success",
                description: `Volunteer opportunity created ${majorIncidentId ? 'for major incident' : 'successfully'}`,
                status: "success",
                duration: 3000
            });

            if (onCreateSuccess) onCreateSuccess(data);
            handleClose();
        } catch (error) {
            toast({
                title: "Error",
                description: error.message,
                status: "error",
                duration: 5000
            });
        }
    };

    const handleClose = () => {
        setFormData({
            title: '',
            description: '',
            location: '',
            position: null,
            radius_miles: 10,
            required_skills: [],
            newSkill: ''
        });
        setErrors({});
        onClose();
    };

    const handleAddSkill = () => {
        if (formData.newSkill && !formData.required_skills.includes(formData.newSkill)) {
            setFormData(prev => ({
                ...prev,
                required_skills: [...prev.required_skills, formData.newSkill],
                newSkill: ''
            }));
            setErrors(prev => ({ ...prev, skills: undefined }));
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            required_skills: prev.required_skills.filter(skill => skill !== skillToRemove)
        }));
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="xl">
            <ModalOverlay />
            <ModalContent maxW="800px">
                <ModalHeader>
                    {majorIncidentId ? 'Create Major Incident Opportunity' : 'Create Volunteer Opportunity'}
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    {majorIncidentId && (
                        <Alert status="info" mb={4}>
                            <AlertIcon />
                            This opportunity will be associated with the current major incident and visible to all volunteers in the incident pool.
                        </Alert>
                    )}

                    <VStack spacing={4}>
                        <FormControl isRequired isInvalid={errors.title}>
                            <FormLabel>Title</FormLabel>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    title: e.target.value
                                }))}
                                placeholder="Enter opportunity title"
                            />
                            {errors.title && <FormErrorMessage>{errors.title}</FormErrorMessage>}
                        </FormControl>

                        <FormControl isRequired isInvalid={errors.description}>
                            <FormLabel>Description</FormLabel>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    description: e.target.value
                                }))}
                                placeholder="Describe the volunteer opportunity"
                                rows={4}
                            />
                            {errors.description && <FormErrorMessage>{errors.description}</FormErrorMessage>}
                        </FormControl>

                        <FormControl isRequired isInvalid={errors.skills}>
                            <FormLabel>Required Skills</FormLabel>
                            <Wrap mb={2}>
                                {formData.required_skills.map(skill => (
                                    <WrapItem key={skill}>
                                        <Tag
                                            size="md"
                                            borderRadius="full"
                                            variant="solid"
                                            colorScheme="blue"
                                        >
                                            <TagLabel>{skill}</TagLabel>
                                            <TagCloseButton
                                                onClick={() => handleRemoveSkill(skill)}
                                            />
                                        </Tag>
                                    </WrapItem>
                                ))}
                            </Wrap>
                            <HStack>
                                <Select
                                    value={formData.newSkill}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        newSkill: e.target.value
                                    }))}
                                    placeholder="Select skill"
                                >
                                    {STANDARD_SKILLS
                                        .filter(skill => !formData.required_skills.includes(skill))
                                        .map(skill => (
                                            <option key={skill} value={skill}>
                                                {skill}
                                            </option>
                                        ))}
                                </Select>
                                <Button onClick={handleAddSkill}>Add</Button>
                            </HStack>
                            {errors.skills && <FormErrorMessage>{errors.skills}</FormErrorMessage>}
                        </FormControl>

                        <FormControl isRequired isInvalid={errors.position}>
                            <FormLabel>Location</FormLabel>
                            <VStack spacing={2} align="stretch">
                                <LocationSearch
                                    mode="address"
                                    placeholder="Enter the opportunity location..."
                                    onSelect={(locationData) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            location: locationData.address,
                                            position: {
                                                lat: locationData.lat,
                                                lng: locationData.lng
                                            }
                                        }));
                                        setErrors(prev => ({ ...prev, position: undefined }));
                                    }}
                                />

                                {!majorIncidentData && (
                                    <HStack mb={2}>
                                        <Button
                                            onClick={getCurrentLocation}
                                            isLoading={isLoadingLocation}
                                            leftIcon={<MdMyLocation />}
                                        >
                                            Use Current Location
                                        </Button>
                                    </HStack>
                                )}

                                {formData.position && (
                                    <Text fontSize="sm" color="gray.600">
                                        Selected: {formData.position.lat.toFixed(6)}, {formData.position.lng.toFixed(6)}
                                    </Text>
                                )}

                                <LocationMapPreview
                                    position={formData.position}
                                    setPosition={(pos) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            position: pos
                                        }));
                                        setErrors(prev => ({ ...prev, position: undefined }));
                                    }}
                                />
                            </VStack>
                            {errors.position && <FormErrorMessage>{errors.position}</FormErrorMessage>}
                        </FormControl>

                        <FormControl>
                            <FormLabel>Search Radius (miles)</FormLabel>
                            <NumberInput
                                value={formData.radius_miles}
                                onChange={(value) => setFormData(prev => ({
                                    ...prev,
                                    radius_miles: parseInt(value)
                                }))}
                                min={1}
                                max={100}
                            >
                                <NumberInputField />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                        </FormControl>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button onClick={handleClose} mr={3}>Cancel</Button>
                    <Button colorScheme="blue" onClick={handleSubmit}>
                        Create Opportunity
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CreateVolunteerOpportunityModal;