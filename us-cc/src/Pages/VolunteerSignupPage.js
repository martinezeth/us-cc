import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Input,
    VStack,
    Text,
    Container,
    Checkbox,
    Select,
    useToast,
    Tag,
    TagLabel,
    TagCloseButton,
    Wrap,
    WrapItem,
    FormControl,
    FormLabel,
} from "@chakra-ui/react";
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { STANDARD_SKILLS, AVAILABILITY_OPTIONS } from '../constants/incidentTypes';

function VolunteerPage() {
    const navigate = useNavigate();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [specialSkills, setSpecialSkills] = useState([]);
    const [selectedSkill, setSelectedSkill] = useState('');
    const [selectedAreas, setSelectedAreas] = useState([]);
    const [availability, setAvailability] = useState([]);

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

    const handleAddSkill = () => {
        if (selectedSkill && !specialSkills.includes(selectedSkill)) {
            setSpecialSkills([...specialSkills, selectedSkill]);
            setSelectedSkill(''); // Reset selection
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setSpecialSkills(specialSkills.filter(skill => skill !== skillToRemove));
    };

    const handleSubmit = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('volunteer_signups')
                .insert([{
                    user_id: user.id,
                    capabilities: selectedAreas,
                    service_areas: selectedAreas,
                    availability: availability,
                    skills: specialSkills
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
                        {selectedAreas.map(area => (
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

                <FormControl>
                    <FormLabel>Skills</FormLabel>
                    <VStack spacing={4} align="stretch">
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
                        <Box display="flex" gap={2}>
                            <Select
                                value={selectedSkill}
                                onChange={(e) => setSelectedSkill(e.target.value)}
                                placeholder="Select a skill"
                            >
                                {STANDARD_SKILLS
                                    .filter(skill => !specialSkills.includes(skill))
                                    .map(skill => (
                                        <option key={skill} value={skill}>
                                            {skill}
                                        </option>
                                    ))}
                            </Select>
                            <Button onClick={handleAddSkill} isDisabled={!selectedSkill}>
                                Add
                            </Button>
                        </Box>
                    </VStack>
                </FormControl>

                <Box>
                    <Text mb={2} fontWeight="semibold">Availability</Text>
                    <Wrap>
                        {AVAILABILITY_OPTIONS.map(option => (
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