import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Button,
    VStack,
    HStack,
    Select,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    useToast,
    Text,
    Tag,
    TagLabel,
    TagCloseButton,
    Wrap,
    WrapItem,
    FormErrorMessage,
} from '@chakra-ui/react';
import { MdMyLocation } from 'react-icons/md';
import { supabase } from '../supabaseClient';
import LocationMapPreview from './LocationMapPreview';
import LocationSearch from './LocationSearch';
import { STANDARD_SKILLS } from '../constants/incidentTypes';

const CreateVolunteerOpportunityModal = ({ isOpen, onClose, onCreateSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        radius_miles: 10,
        required_skills: [],
        position: null
    });
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [newSkill, setNewSkill] = useState('');
    const [errors, setErrors] = useState({});
    const toast = useToast();

    useEffect(() => {
        if (isOpen) {
            getCurrentLocation();
        }
    }, [isOpen]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = "Title is required";
        if (!formData.description.trim()) newErrors.description = "Description is required";
        if (!formData.location.trim()) newErrors.location = "Location is required";
        if (!formData.position) newErrors.position = "Location coordinates are required";
        if (formData.required_skills.length === 0) newErrors.required_skills = "At least one skill is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

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
                        description: "Could not get your location. Please select on map or enter address.",
                        status: "error",
                        duration: 5000
                    });
                    setIsLoadingLocation(false);
                }
            );
        }
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

            const { data, error } = await supabase
                .from('volunteer_opportunities')
                .insert([{
                    organization_id: user.id,
                    title: formData.title,
                    description: formData.description,
                    location: formData.location,
                    location_lat: formData.position.lat,
                    location_lng: formData.position.lng,
                    radius_miles: formData.radius_miles,
                    required_skills: formData.required_skills,
                    status: 'open'
                }])
                .select();

            if (error) throw error;

            toast({
                title: "Success",
                description: "Volunteer opportunity created successfully",
                status: "success",
                duration: 3000
            });

            if (onCreateSuccess) onCreateSuccess(data[0]);
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
            radius_miles: 10,
            required_skills: [],
            position: null
        });
        setNewSkill('');
        setErrors({});
        onClose();
    };

    const handleAddSkill = () => {
        if (newSkill && !formData.required_skills.includes(newSkill)) {
            setFormData(prev => ({
                ...prev,
                required_skills: [...prev.required_skills, newSkill]
            }));
            setNewSkill('');
            setErrors(prev => ({ ...prev, required_skills: undefined }));
        }
    };

    const handleRemoveSkill = (skill) => {
        setFormData(prev => ({
            ...prev,
            required_skills: prev.required_skills.filter(s => s !== skill)
        }));
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="xl">
            <ModalOverlay />
            <ModalContent maxW="800px">
                <ModalHeader>Create Volunteer Opportunity</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <VStack spacing={4}>
                        <FormControl isRequired isInvalid={errors.title}>
                            <FormLabel>Title</FormLabel>
                            <Input
                                value={formData.title}
                                onChange={(e) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        title: e.target.value
                                    }));
                                    if (e.target.value.trim()) {
                                        setErrors(prev => ({ ...prev, title: undefined }));
                                    }
                                }}
                                placeholder="Enter opportunity title"
                            />
                            {errors.title && <FormErrorMessage>{errors.title}</FormErrorMessage>}
                        </FormControl>

                        <FormControl isRequired isInvalid={errors.description}>
                            <FormLabel>Description</FormLabel>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        description: e.target.value
                                    }));
                                    if (e.target.value.trim()) {
                                        setErrors(prev => ({ ...prev, description: undefined }));
                                    }
                                }}
                                placeholder="Describe the volunteer opportunity"
                                rows={4}
                            />
                            {errors.description && <FormErrorMessage>{errors.description}</FormErrorMessage>}
                        </FormControl>

                        <FormControl isRequired isInvalid={errors.required_skills}>
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
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
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
                            {errors.required_skills &&
                                <FormErrorMessage>{errors.required_skills}</FormErrorMessage>}
                        </FormControl>

                        <FormControl isRequired isInvalid={errors.location || errors.position}>
                            <FormLabel>Location</FormLabel>
                            <VStack spacing={2} align="stretch">
                                <LocationSearch
                                    mode="address"
                                    placeholder="Enter the opportunity location..."
                                    onSelect={locationData => {
                                        setFormData(prev => ({
                                            ...prev,
                                            location: locationData.address,
                                            position: {
                                                lat: locationData.lat,
                                                lng: locationData.lng
                                            }
                                        }));
                                        setErrors(prev => ({
                                            ...prev,
                                            position: undefined,
                                            location: undefined
                                        }));
                                    }}
                                />

                                <Text fontSize="sm" color="gray.600">Or select location on map:</Text>

                                <HStack>
                                    <Button
                                        size="sm"
                                        onClick={getCurrentLocation}
                                        isLoading={isLoadingLocation}
                                        leftIcon={<MdMyLocation />}
                                    >
                                        Use Current Location
                                    </Button>
                                    {formData.position && (
                                        <Text fontSize="sm" color="gray.600">
                                            Selected: {formData.position.lat.toFixed(6)}, {formData.position.lng.toFixed(6)}
                                        </Text>
                                    )}
                                </HStack>

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
                                {(errors.location || errors.position) &&
                                    <FormErrorMessage>{errors.location || errors.position}</FormErrorMessage>}
                            </VStack>
                        </FormControl>

                        <FormControl isRequired>
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