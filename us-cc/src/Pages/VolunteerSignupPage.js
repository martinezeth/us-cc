import React, { useState, useEffect } from "react";
import {
    Box, Button, Input, VStack, Text, Container, Checkbox, Select,
    useToast, Tag, TagLabel, TagCloseButton, Wrap, WrapItem
} from "@chakra-ui/react";
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function VolunteerPage() {
    const navigate = useNavigate();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [specialSkills, setSpecialSkills] = useState([]);
    const [newSkill, setNewSkill] = useState('');
    const [selectedAreas, setSelectedAreas] = useState([]);
    const [availability, setAvailability] = useState([]);

    // Fetch current user on mount
    useEffect(() => {
        const getCurrentUser = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) {
                toast({
                    title: "Error",
                    description: "Please login to register as a volunteer",
                    status: "error",
                    duration: 5000,
                });
                navigate('/login');
                return;
            }
            setUser(user);
        };
        getCurrentUser();
    }, []);

    const availabilityOptions = [
        "Weekdays",
        "Weekends",
        "Mornings",
        "Afternoons",
        "Evenings",
        "On-Call",
        "Emergency Only"
    ];

    const serviceAreas = [
        "Medical Support",
        "Emergency Response",
        "Transportation",
        "Shelter Operations",
        "Search and Rescue",
        "Communications",
        "Logistics",
        "Community Outreach"
    ];

    const handleAddSkill = () => {
        if (newSkill.trim() && !specialSkills.includes(newSkill.trim())) {
            setSpecialSkills([...specialSkills, newSkill.trim()]);
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setSpecialSkills(specialSkills.filter(skill => skill !== skillToRemove));
    };

    const handleSubmit = async () => {
        if (!user) return;

        setLoading(true);
        try {
            // Register as volunteer
            const { data, error } = await supabase
                .from('volunteer_signups')
                .insert([{
                    user_id: user.id,
                    capabilities: selectedAreas,
                    service_areas: selectedAreas,
                    availability: availability,
                    special_skills: specialSkills
                }]);

            if (error) throw error;

            toast({
                title: "Success!",
                description: "You've successfully registered as a volunteer",
                status: "success",
                duration: 5000,
            });

            navigate('/profile');
        } catch (error) {
            toast({
                title: "Error",
                description: error.message,
                status: "error",
                duration: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxW="container.md" py={8}>
            <VStack spacing={6} align="stretch">
                <Text fontSize="2xl" fontWeight="bold">Register as a Volunteer</Text>

                <Box>
                    <Text mb={2} fontWeight="semibold">Service Areas</Text>
                    <Wrap>
                        {serviceAreas.map(area => (
                            <WrapItem key={area}>
                                <Checkbox
                                    isChecked={selectedAreas.includes(area)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedAreas([...selectedAreas, area]);
                                        } else {
                                            setSelectedAreas(selectedAreas.filter(a => a !== area));
                                        }
                                    }}
                                >
                                    {area}
                                </Checkbox>
                            </WrapItem>
                        ))}
                    </Wrap>
                </Box>

                <Box>
                    <Text mb={2} fontWeight="semibold">Availability</Text>
                    <Wrap>
                        {availabilityOptions.map(option => (
                            <WrapItem key={option}>
                                <Checkbox
                                    isChecked={availability.includes(option)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setAvailability([...availability, option]);
                                        } else {
                                            setAvailability(availability.filter(a => a !== option));
                                        }
                                    }}
                                >
                                    {option}
                                </Checkbox>
                            </WrapItem>
                        ))}
                    </Wrap>
                </Box>

                <Box>
                    <Text mb={2} fontWeight="semibold">Special Skills</Text>
                    <Wrap mb={2}>
                        {specialSkills.map(skill => (
                            <WrapItem key={skill}>
                                <Tag size="md" borderRadius="full" variant="solid" colorScheme="blue">
                                    <TagLabel>{skill}</TagLabel>
                                    <TagCloseButton onClick={() => handleRemoveSkill(skill)} />
                                </Tag>
                            </WrapItem>
                        ))}
                    </Wrap>
                    <Box display="flex">
                        <Input
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            placeholder="Enter a special skill"
                            mr={2}
                        />
                        <Button onClick={handleAddSkill}>Add</Button>
                    </Box>
                </Box>

                <Button
                    colorScheme="blue"
                    onClick={handleSubmit}
                    isLoading={loading}
                    loadingText="Submitting"
                >
                    Register as Volunteer
                </Button>
            </VStack>
        </Container>
    );
}

export default VolunteerPage;