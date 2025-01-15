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
    Tag,
    TagLabel,
    TagCloseButton,
    Wrap,
    WrapItem,
    Box,
    Text,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { STANDARD_SKILLS } from '../constants/incidentTypes';
import { supabase } from '../supabaseClient';
import LocationSearch from './LocationSearch';
import LocationMapPreview from './LocationMapPreview';

const EditVolunteerOpportunityModal = ({ isOpen, onClose, opportunity, onUpdateSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        required_skills: [],
        radius_miles: 10,
        newSkill: '',
        position: null
    });
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    useEffect(() => {
        if (opportunity) {
            setFormData({
                title: opportunity.title || '',
                description: opportunity.description || '',
                location: opportunity.location || '',
                required_skills: opportunity.required_skills || [],
                radius_miles: opportunity.radius_miles || 10,
                newSkill: '',
                position: opportunity.location_lat && opportunity.location_lng ? {
                    lat: opportunity.location_lat,
                    lng: opportunity.location_lng
                } : null
            });
        }
    }, [opportunity]);

    const handleSubmit = async () => {
        if (!formData.title || !formData.description || !formData.location || !formData.position) {
            toast({
                title: "Missing Required Fields",
                description: "Please fill in all required fields, including location",
                status: "error",
                duration: 3000
            });
            return;
        }

        try {
            setIsLoading(true);
            const { error } = await supabase
                .from('volunteer_opportunities')
                .update({
                    title: formData.title,
                    description: formData.description,
                    location: formData.location,
                    required_skills: formData.required_skills,
                    radius_miles: formData.radius_miles,
                    location_lat: formData.position.lat,
                    location_lng: formData.position.lng
                })
                .eq('id', opportunity.id);

            if (error) throw error;

            toast({
                title: "Success",
                description: "Opportunity updated successfully",
                status: "success",
                duration: 3000
            });

            if (onUpdateSuccess) onUpdateSuccess();
            onClose();
        } catch (error) {
            toast({
                title: "Error updating opportunity",
                description: error.message,
                status: "error",
                duration: 5000
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddSkill = () => {
        if (formData.newSkill && !formData.required_skills.includes(formData.newSkill)) {
            setFormData(prev => ({
                ...prev,
                required_skills: [...prev.required_skills, formData.newSkill],
                newSkill: ''
            }));
        }
    };

    const handleRemoveSkill = (skill) => {
        setFormData(prev => ({
            ...prev,
            required_skills: prev.required_skills.filter(s => s !== skill)
        }));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent maxW="800px">
                <ModalHeader>Edit Volunteer Opportunity</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
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
                                    }}
                                />
                                <Text fontSize="sm" color="gray.600">Current location: {formData.location}</Text>
                                <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
                                    <LocationMapPreview
                                        position={formData.position}
                                        setPosition={(pos) => setFormData(prev => ({
                                            ...prev,
                                            position: pos,
                                            location: `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`
                                        }))}
                                        height="300px"
                                    />
                                </Box>
                            </VStack>
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
                                <Button onClick={handleAddSkill} leftIcon={<AddIcon />}>
                                    Add
                                </Button>
                            </HStack>
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
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        colorScheme="blue"
                        onClick={handleSubmit}
                        isLoading={isLoading}
                    >
                        Save Changes
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default EditVolunteerOpportunityModal;