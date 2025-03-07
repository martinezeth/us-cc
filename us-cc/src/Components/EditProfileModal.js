import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    useToast,
    Wrap,
    WrapItem,
    Tag,
    TagLabel,
    TagCloseButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    IconButton,
    Text,
    Box,
    Divider,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { supabase } from '../supabaseClient';
import { STANDARD_SKILLS, AVAILABILITY_OPTIONS } from '../constants/incidentTypes';
import LocationSearch from './LocationSearch';

export default function EditProfileModal({ isOpen, onClose, userData, volunteerData, onUpdateSuccess, isOrganization }) {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: userData?.full_name || '',
        city: userData?.city || '',
        state: userData?.state || '',
        phone: userData?.phone || '',
        address: userData?.address || '',
        mission_statement: userData?.mission_statement || '',
    });
    const [skills, setSkills] = useState(volunteerData?.skills || []);
    const [availability, setAvailability] = useState(volunteerData?.availability || []);
    const [isEditing, setIsEditing] = useState({
        name: false,
        location: false
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                full_name: userData?.full_name || '',
                city: userData?.city || '',
                state: userData?.state || '',
                phone: userData?.phone || '',
                address: userData?.address || '',
                mission_statement: userData?.mission_statement || '',
            });
        }
    }, [isOpen, userData]);

    const handleAddSkill = (skill) => {
        if (!skills.includes(skill)) {
            setSkills([...skills, skill]);
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setSkills(skills.filter(skill => skill !== skillToRemove));
    };

    const handleAddAvailability = (option) => {
        if (!availability.includes(option)) {
            setAvailability([...availability, option]);
        }
    };

    const handleRemoveAvailability = (optionToRemove) => {
        setAvailability(availability.filter(option => option !== optionToRemove));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Keep the original name if it wasn't changed
            const updatedName = formData.full_name || userData.full_name;

            // Update profile with all fields
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    full_name: updatedName,
                    city: formData.city,
                    state: formData.state,
                    phone: formData.phone || null,
                    address: formData.address || null,
                    mission_statement: formData.mission_statement || null,
                    updated_at: new Date(),
                })
                .eq('id', userData.id);

            if (profileError) throw profileError;

            // Update the user's metadata in Auth
            const { error: metadataError } = await supabase.auth.updateUser({
                data: {
                    name: updatedName,
                    full_name: updatedName,
                    is_organization: isOrganization // Ensure we keep the organization status
                }
            });

            if (metadataError) throw metadataError;

            // Update volunteer data if it exists and not an organization
            if (volunteerData && !isOrganization) {
                const { error: volunteerError } = await supabase
                    .from('volunteer_signups')
                    .update({
                        skills: skills,
                        availability: availability,
                        city: formData.city,
                        state: formData.state
                    })
                    .eq('user_id', userData.id);

                if (volunteerError) throw volunteerError;
            }

            toast({
                title: 'Profile updated successfully',
                status: 'success',
                duration: 3000,
            });

            // Pass all updated data back to the parent component with the correct name
            onUpdateSuccess({
                ...userData,
                ...formData,
                full_name: updatedName, // Ensure we pass the correct name
                name: updatedName, // Add this for the profile display
                ...(volunteerData && !isOrganization ? { skills, availability } : {}),
                city: formData.city,
                state: formData.state,
                is_organization: isOrganization // Ensure we keep the organization status
            });

            // Force refresh the auth context to update the header
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: updatedProfile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                // Ensure the profile update event includes the correct name
                window.dispatchEvent(new CustomEvent('profileUpdate', {
                    detail: {
                        ...updatedProfile,
                        name: updatedName,
                        full_name: updatedName
                    }
                }));
            }

            onClose();
        } catch (error) {
            console.error('Error updating profile:', error);
            toast({
                title: 'Error updating profile',
                description: error.message,
                status: 'error',
                duration: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "lg" }}>
            <ModalOverlay />
            <ModalContent margin={{ base: 0, md: "auto" }} maxH={{ base: "100vh", md: "auto" }}>
                <ModalHeader fontSize={{ base: "xl", md: "2xl" }}>
                    Edit {isOrganization ? 'Organization' : 'Profile'}
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={{ base: 4, md: 6 }}>
                        <FormControl>
                            <FormLabel>{isOrganization ? 'Organization Name' : 'Full Name'}</FormLabel>
                            {!isEditing.name ? (
                                <Box
                                    p={2}
                                    borderWidth="1px"
                                    borderRadius="md"
                                    onClick={() => setIsEditing({ ...isEditing, name: true })}
                                    cursor="pointer"
                                    _hover={{ bg: "gray.50" }}
                                >
                                    <Text color={formData.full_name ? "black" : "gray.400"}>
                                        {formData.full_name || "Enter your full name..."}
                                    </Text>
                                </Box>
                            ) : (
                                <Input
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        full_name: e.target.value
                                    })}
                                    autoFocus
                                    onBlur={() => setIsEditing({ ...isEditing, name: false })}
                                />
                            )}
                        </FormControl>

                        {!isOrganization && (
                            <FormControl>
                                <FormLabel>Location</FormLabel>
                                {!isEditing.location ? (
                                    <Box
                                        p={2}
                                        borderWidth="1px"
                                        borderRadius="md"
                                        onClick={() => setIsEditing({ ...isEditing, location: true })}
                                        cursor="pointer"
                                        _hover={{ bg: "gray.50" }}
                                    >
                                        <Text>
                                            {formData.city && formData.state
                                                ? `${formData.city}, ${formData.state}`
                                                : "Click to edit location"}
                                        </Text>
                                    </Box>
                                ) : (
                                    <LocationSearch
                                        mode="city"
                                        placeholder="Search for your city..."
                                        onSelect={(locationData) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                city: locationData.city,
                                                state: locationData.state,
                                            }));
                                            setIsEditing({ ...isEditing, location: false });
                                        }}
                                    />
                                )}
                            </FormControl>
                        )}

                        {isOrganization && (
                            <>
                                <FormControl>
                                    <FormLabel>Phone Number</FormLabel>
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            phone: e.target.value
                                        })}
                                        placeholder="Enter phone number"
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Address</FormLabel>
                                    <Input
                                        value={formData.address}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            address: e.target.value
                                        })}
                                        placeholder="Enter full address"
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Mission Statement</FormLabel>
                                    <Input
                                        value={formData.mission_statement}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            mission_statement: e.target.value
                                        })}
                                        placeholder="Enter your organization's mission"
                                    />
                                </FormControl>
                            </>
                        )}

                        {volunteerData && !isOrganization && (
                            <>
                                <Divider />

                                <FormControl>
                                    <FormLabel>Skills</FormLabel>
                                    <Menu>
                                        <MenuButton
                                            as={IconButton}
                                            icon={<AddIcon />}
                                            size="sm"
                                            mb={2}
                                        >
                                        </MenuButton>
                                        <MenuList>
                                            {STANDARD_SKILLS
                                                .filter(skill => !skills.includes(skill))
                                                .map((skill) => (
                                                    <MenuItem
                                                        key={skill}
                                                        onClick={() => handleAddSkill(skill)}
                                                    >
                                                        {skill}
                                                    </MenuItem>
                                                ))}
                                        </MenuList>
                                    </Menu>
                                    <Wrap spacing={2}>
                                        {skills.map((skill) => (
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
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Availability</FormLabel>
                                    <Menu>
                                        <MenuButton
                                            as={IconButton}
                                            icon={<AddIcon />}
                                            size="sm"
                                            mb={2}
                                        >
                                        </MenuButton>
                                        <MenuList>
                                            {AVAILABILITY_OPTIONS
                                                .filter(option => !availability.includes(option))
                                                .map((option) => (
                                                    <MenuItem
                                                        key={option}
                                                        onClick={() => handleAddAvailability(option)}
                                                    >
                                                        {option}
                                                    </MenuItem>
                                                ))}
                                        </MenuList>
                                    </Menu>
                                    <Wrap spacing={2}>
                                        {availability.map((option) => (
                                            <WrapItem key={option}>
                                                <Tag
                                                    size="md"
                                                    borderRadius="full"
                                                    variant="solid"
                                                    colorScheme="green"
                                                >
                                                    <TagLabel>{option}</TagLabel>
                                                    <TagCloseButton
                                                        onClick={() => handleRemoveAvailability(option)}
                                                    />
                                                </Tag>
                                            </WrapItem>
                                        ))}
                                    </Wrap>
                                </FormControl>
                            </>
                        )}
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose} size={{ base: "sm", md: "md" }}>
                        Cancel
                    </Button>
                    <Button
                        colorScheme="blue"
                        onClick={handleSubmit}
                        isLoading={loading}
                        size={{ base: "sm", md: "md" }}
                    >
                        Save Changes
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}