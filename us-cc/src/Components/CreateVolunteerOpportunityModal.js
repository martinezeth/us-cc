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
    WrapItem
} from '@chakra-ui/react';
import { MdMyLocation } from 'react-icons/md';
import { supabase } from '../supabaseClient';
import LocationMapPreview from './LocationMapPreview';
import { STANDARD_SKILLS } from '../constants/incidentTypes';

const CreateVolunteerOpportunityModal = ({ isOpen, onClose, onSuccess }) => {
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
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!formData.position) {
                toast({
                    title: "Location Required",
                    description: "Please select a location on the map",
                    status: "error",
                    duration: 3000
                });
                return;
            }

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

            if (onSuccess) onSuccess(data[0]);
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
        onClose();
    };

    const handleAddSkill = () => {
        if (newSkill && !formData.required_skills.includes(newSkill)) {
            setFormData(prev => ({
                ...prev,
                required_skills: [...prev.required_skills, newSkill]
            }));
            setNewSkill('');
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
                        <FormControl isRequired>
                            <FormLabel>Title</FormLabel>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    title: e.target.value
                                }))}
                                placeholder="Enter opportunity title"
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
                                placeholder="Describe the volunteer opportunity"
                                rows={4}
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Location Name</FormLabel>
                            <Input
                                value={formData.location}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    location: e.target.value
                                }))}
                                placeholder="e.g., Central Park, Downtown Area"
                            />
                        </FormControl>

                        <FormControl isRequired>
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
                                    {STANDARD_SKILLS.map(skill => (
                                        <option key={skill} value={skill}>
                                            {skill}
                                        </option>
                                    ))}
                                </Select>
                                <Button onClick={handleAddSkill}>Add</Button>
                            </HStack>
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
                                {formData.position && (
                                    <Text fontSize="sm" color="gray.600">
                                        Lat: {formData.position.lat.toFixed(6)},
                                        Lng: {formData.position.lng.toFixed(6)}
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