import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
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
import LocationSearch from '../Components/LocationSearch';
import LocationMapPreview from '../Components/LocationMapPreview';

function VolunteerPage() {
    const navigate = useNavigate();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [specialSkills, setSpecialSkills] = useState([]);
    const [selectedSkill, setSelectedSkill] = useState('');
    const [selectedAreas, setSelectedAreas] = useState([]);
    const [availability, setAvailability] = useState([]);
    const [location, setLocation] = useState(null);

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
        if (!location) {
            toast({
                title: "Error",
                description: "Please select your location",
                status: "error",
                duration: 5000,
            });
            return;
        }

        setLoading(true);
        try {
            // Check if user already has a signup
            const { data: existingSignup } = await supabase
                .from('volunteer_signups')
                .select('*')
                .eq('user_id', user.id)
                .limit(1);

            if (existingSignup && existingSignup.length > 0) {
                // Update existing signup
                const { error: updateError } = await supabase
                    .from('volunteer_signups')
                    .update({
                        skills: specialSkills,
                        availability: availability,
                        location_lat: location.lat,
                        location_lng: location.lng,
                        city: location.city,
                        state: location.state,
                        country: location.country
                    })
                    .eq('user_id', user.id);

                if (updateError) throw updateError;
            } else {
                // Create new signup
                const { error } = await supabase
                    .from('volunteer_signups')
                    .insert([{
                        user_id: user.id,
                        skills: specialSkills,
                        availability: availability,
                        location_lat: location.lat,
                        location_lng: location.lng,
                        city: location.city,
                        state: location.state,
                        country: location.country
                    }]);

                if (error) throw error;
            }

            // Update user profile with location
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    city: location.city,
                    state: location.state
                });

            if (profileError) throw profileError;

            toast({
                title: "Success!",
                description: "Volunteer profile updated successfully",
                status: "success",
                duration: 5000,
            });

            navigate('/volunteering');
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

                <FormControl isRequired>
                    <FormLabel>Your Location</FormLabel>
                    <LocationSearch
                        mode="address"
                        placeholder="Enter your address..."
                        onSelect={(locationData) => setLocation(locationData)}
                    />
                    {location && (
                        <LocationMapPreview
                            position={{ lat: location.lat, lng: location.lng }}
                            setPosition={(pos) => {
                                setLocation(prev => ({
                                    ...prev,
                                    lat: pos.lat,
                                    lng: pos.lng
                                }));
                            }}
                            height="200px"
                        />
                    )}
                </FormControl>

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