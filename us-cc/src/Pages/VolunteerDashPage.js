import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Heading,
    Text,
    Button,
    Badge,
    Tag,
    TagLabel,
    useToast,
    Flex,
    Icon,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    VStack,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    Select,
    useDisclosure,
    Wrap,
    WrapItem,
    HStack,
    TagCloseButton,
    FormErrorMessage,
} from '@chakra-ui/react';
import { FaBuilding, FaCheckCircle } from 'react-icons/fa';
import { supabase } from '../supabaseClient';
import { STANDARD_SKILLS, AVAILABILITY_OPTIONS } from '../constants/incidentTypes';
import VolunteerMessages from '../Components/VolunteerMessages';
import LocationSearch from '../Components/LocationSearch';
import LocationMapPreview from '../Components/LocationMapPreview';

const VolunteerRegistrationModal = ({ isOpen, onClose, onRegister }) => {
    const [formData, setFormData] = useState({
        skills: [],
        availability: [],
        location: null
    });
    const [errors, setErrors] = useState({});
    const [newSkill, setNewSkill] = useState('');
    const [newAvailability, setNewAvailability] = useState('');
    const toast = useToast();

    const handleAddSkill = () => {
        if (newSkill && !formData.skills.includes(newSkill)) {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, newSkill]
            }));
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (skill) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(s => s !== skill)
        }));
    };

    const handleAddAvailability = () => {
        if (newAvailability && !formData.availability.includes(newAvailability)) {
            setFormData(prev => ({
                ...prev,
                availability: [...prev.availability, newAvailability]
            }));
            setNewAvailability('');
        }
    };

    const handleRemoveAvailability = (availability) => {
        setFormData(prev => ({
            ...prev,
            availability: prev.availability.filter(a => a !== availability)
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.location) {
            newErrors.location = "Please select your city";
        }
        if (formData.skills.length === 0) {
            newErrors.skills = "Please select at least one skill";
        }
        if (formData.availability.length === 0) {
            newErrors.availability = "Please select at least one availability option";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields",
                status: "error",
                duration: 5000,
            });
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { error } = await supabase
                .from('volunteer_signups')
                .insert([{
                    user_id: user.id,
                    skills: formData.skills,
                    availability: formData.availability,
                    location_lat: formData.location.lat,
                    location_lng: formData.location.lng,
                    city: formData.location.city,
                    state: formData.location.state,
                    country: formData.location.country
                }]);

            if (error) throw error;

            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    city: formData.location.city,
                    state: formData.location.state
                });

            if (profileError) throw profileError;

            toast({
                title: "Success!",
                description: "You're now registered as a volunteer",
                status: "success",
                duration: 5000,
            });
            onRegister();
            onClose();
        } catch (error) {
            toast({
                title: "Error",
                description: error.message,
                status: "error",
                duration: 5000,
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Register as Volunteer</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} pb={6}>
                        <FormControl isRequired isInvalid={errors.location}>
                            <FormLabel>Your City</FormLabel>
                            <LocationSearch
                                mode="city"
                                placeholder="Enter your city..."
                                onSelect={(locationData) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        location: locationData
                                    }));
                                    setErrors(prev => ({ ...prev, location: undefined }));
                                }}
                            />
                            {errors.location && (
                                <FormErrorMessage>{errors.location}</FormErrorMessage>
                            )}
                        </FormControl>

                        <FormControl isRequired isInvalid={errors.skills}>
                            <FormLabel>Skills</FormLabel>
                            <Wrap mb={2}>
                                {formData.skills.map(skill => (
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
                                        .filter(skill => !formData.skills.includes(skill))
                                        .map(skill => (
                                            <option key={skill} value={skill}>
                                                {skill}
                                            </option>
                                        ))}
                                </Select>
                                <Button onClick={handleAddSkill}>Add</Button>
                            </HStack>
                            {errors.skills && (
                                <FormErrorMessage>{errors.skills}</FormErrorMessage>
                            )}
                        </FormControl>

                        <FormControl isRequired isInvalid={errors.availability}>
                            <FormLabel>Availability</FormLabel>
                            <Wrap mb={2}>
                                {formData.availability.map(time => (
                                    <WrapItem key={time}>
                                        <Tag
                                            size="md"
                                            borderRadius="full"
                                            variant="solid"
                                            colorScheme="green"
                                        >
                                            <TagLabel>{time}</TagLabel>
                                            <TagCloseButton
                                                onClick={() => handleRemoveAvailability(time)}
                                            />
                                        </Tag>
                                    </WrapItem>
                                ))}
                            </Wrap>
                            <HStack>
                                <Select
                                    value={newAvailability}
                                    onChange={(e) => setNewAvailability(e.target.value)}
                                    placeholder="Select availability"
                                >
                                    {AVAILABILITY_OPTIONS
                                        .filter(time => !formData.availability.includes(time))
                                        .map(time => (
                                            <option key={time} value={time}>
                                                {time}
                                            </option>
                                        ))}
                                </Select>
                                <Button onClick={handleAddAvailability}>Add</Button>
                            </HStack>
                            {errors.availability && (
                                <FormErrorMessage>{errors.availability}</FormErrorMessage>
                            )}
                        </FormControl>

                        <Button colorScheme="blue" onClick={handleSubmit} width="100%">
                            Register
                        </Button>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

const OpportunityCard = ({ opportunity, userSkills, isDemoMode, isResponseTab = false, onRefresh }) => {
    const [isResponding, setIsResponding] = useState(false);
    const [hasResponded, setHasResponded] = useState(false);
    const toast = useToast();

    useEffect(() => {
        checkIfResponded();
    }, [opportunity.id]);

    const checkIfResponded = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { data, error } = await supabase
                .from('opportunity_responses')
                .select('*')
                .eq('opportunity_id', opportunity.id)
                .eq('volunteer_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            setHasResponded(!!data);
        } catch (error) {
            console.error('Error checking response status:', error);
        }
    };

    const matchedSkills = userSkills.filter(skill =>
        opportunity.required_skills.includes(skill)
    );
    const hasRequiredSkills = matchedSkills.length > 0;

    const handleVolunteerClick = async () => {
        if (hasResponded) return;

        setIsResponding(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { error } = await supabase
                .from('opportunity_responses')
                .insert([{
                    opportunity_id: opportunity.id,
                    volunteer_id: user.id,
                    status: 'accepted'
                }]);

            if (error) throw error;

            setHasResponded(true);
            toast({
                title: isDemoMode ? "Demo: Response Sent!" : "Response Sent!",
                description: isDemoMode ?
                    "In demo mode, all responses are automatically accepted." :
                    "The organization will review your application.",
                status: "success",
                duration: 5000
            });

            if (onRefresh) {
                onRefresh();
            }

        } catch (error) {
            toast({
                title: "Error",
                description: error.message,
                status: "error",
                duration: 5000
            });
        } finally {
            setIsResponding(false);
        }
    };

    return (
        <Box
            bg="white"
            borderRadius="lg"
            boxShadow="sm"
            p={6}
            border="1px solid"
            borderColor="gray.100"
            position="relative"
            transition="transform 0.2s"
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
        >
            {(isResponseTab || hasResponded) && (
                <Badge
                    position="absolute"
                    top={2}
                    right={2}
                    colorScheme="green"
                >
                    Responded
                </Badge>
            )}

            <Flex align="center" mb={4}>
                <Icon as={FaBuilding} mr={2} color="blue.500" />
                <Text fontWeight="bold" color="gray.700">
                    {opportunity.organization_name}
                </Text>
            </Flex>

            <Heading size="md" mb={2}>{opportunity.title}</Heading>
            <Text color="gray.600" mb={4}>{opportunity.description}</Text>

            <Box mb={4}>
                <Text fontWeight="bold" mb={2}>Required Skills:</Text>
                <Flex wrap="wrap" gap={2}>
                    {opportunity.required_skills.map(skill => (
                        <Tag
                            key={skill}
                            colorScheme={userSkills.includes(skill) ? "green" : "gray"}
                        >
                            <TagLabel>{skill}</TagLabel>
                            {userSkills.includes(skill) && (
                                <Icon as={FaCheckCircle} ml={1} />
                            )}
                        </Tag>
                    ))}
                </Flex>
            </Box>

            <Flex justify="space-between" align="center" mt={4}>
                <Text color="gray.500">
                    Location: {opportunity.location}
                </Text>
                {!isResponseTab && (
                    <Button
                        colorScheme="blue"
                        isLoading={isResponding}
                        onClick={handleVolunteerClick}
                        isDisabled={!hasRequiredSkills || hasResponded}
                        minW="140px"
                        whiteSpace="normal"
                        h="auto"
                        py={2}
                    >
                        {hasResponded ? 'Responded' : 'Volunteer'}
                    </Button>
                )}
            </Flex>
        </Box>
    );
};

export default function VolunteerDashPage() {
    const [opportunities, setOpportunities] = useState([]);
    const [responses, setResponses] = useState([]);
    const [userSkills, setUserSkills] = useState([]);
    const [isVolunteer, setIsVolunteer] = useState(false);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);

    useEffect(() => {
        checkUserStatus();
        fetchOpportunities();
        fetchResponses();
    }, []);

    const checkUserStatus = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setIsDemoMode(user?.email === 'demo@demo.com');

        // Check if user is already a volunteer
        const { data: volunteerData } = await supabase
            .from('volunteer_signups')
            .select('*')
            .eq('user_id', user.id)
            .single();

        setIsVolunteer(!!volunteerData);
        if (volunteerData) {
            setUserSkills(volunteerData.skills || []);
        }
    };

    const fetchOpportunities = async () => {
        try {
            // First get the opportunities
            const { data: opportunities, error: opportunitiesError } = await supabase
                .from('volunteer_opportunities')
                .select('*')
                .eq('status', 'open')
                .order('created_at', { ascending: false });

            if (opportunitiesError) throw opportunitiesError;

            // Then get the organization profiles for each opportunity
            const opportunitiesWithOrgs = await Promise.all(opportunities.map(async (opp) => {
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('full_name, organization_name')
                    .eq('id', opp.organization_id)
                    .single();

                return {
                    ...opp,
                    organization_name: profileData?.organization_name ||
                        profileData?.full_name ||
                        'Unknown Organization'
                };
            }));

            setOpportunities(opportunitiesWithOrgs);
        } catch (error) {
            toast({
                title: "Error loading opportunities",
                description: error.message,
                status: "error"
            });
        }
    };

    const fetchResponses = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { data: responses, error: responsesError } = await supabase
                .from('opportunity_responses')
                .select(`
                    opportunity_id,
                    opportunity:volunteer_opportunities (
                        id,
                        title,
                        description,
                        location,
                        status,
                        organization_id,
                        radius_miles,
                        required_skills
                    )
                `)
                .eq('volunteer_id', user.id)
                .eq('status', 'accepted');

            if (responsesError) throw responsesError;

            // Separately fetch organization profiles for the opportunities
            const opportunities = responses.map(r => r.opportunity).filter(Boolean);
            const orgIds = [...new Set(opportunities.map(opp => opp.organization_id))];

            const { data: orgProfiles } = await supabase
                .from('profiles')
                .select('id, organization_name, full_name')
                .in('id', orgIds);

            // Create a lookup map for org names
            const orgNameMap = {};
            orgProfiles?.forEach(profile => {
                orgNameMap[profile.id] = profile.organization_name || profile.full_name;
            });

            const processedResponses = opportunities.map(opp => ({
                ...opp,
                organization_name: orgNameMap[opp.organization_id] || 'Unknown Organization'
            }));

            setResponses(processedResponses);
        } catch (error) {
            console.error('Error fetching responses:', error);
            toast({
                title: "Error",
                description: "Failed to load responses",
                status: "error",
                duration: 5000
            });
        }
    };

    const refreshData = () => {
        fetchOpportunities();
        fetchResponses();
    };

    if (!isVolunteer) {
        return (
            <Box bg="gray.50" minH="90vh" py={8}>
                <Box maxW="7xl" mx="auto" px={4}>
                    <Alert
                        status="info"
                        variant="subtle"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        textAlign="center"
                        height="200px"
                        bg="blue.50"
                        borderRadius="lg"
                    >
                        <AlertIcon boxSize="40px" mr={0} />
                        <AlertTitle mt={4} mb={1} fontSize="lg">
                            Register as a Volunteer
                        </AlertTitle>
                        <AlertDescription maxWidth="sm">
                            Register as a volunteer to view and respond to opportunities
                            in your area that match your skills.
                        </AlertDescription>
                        <Button
                            colorScheme="blue"
                            mt={4}
                            onClick={onOpen}
                        >
                            Register Now
                        </Button>
                    </Alert>
                </Box>
                <VolunteerRegistrationModal
                    isOpen={isOpen}
                    onClose={onClose}
                    onRegister={checkUserStatus}
                />
            </Box>
        );
    }

    return (
        <Box bg="gray.50" minH="90vh" py={8}>
            <Box maxW="7xl" mx="auto" px={4}>
                <VStack spacing={8} align="stretch">
                    <Tabs colorScheme="blue" variant="enclosed">
                        <TabList>
                            <Tab>Available Opportunities</Tab>
                            <Tab>Your Responses</Tab>
                            <Tab>
                                <Flex align="center">
                                    Messages
                                    {totalUnreadMessages > 0 && (
                                        <Badge
                                            ml={2}
                                            colorScheme="red"
                                            borderRadius="full"
                                        >
                                            {totalUnreadMessages}
                                        </Badge>
                                    )}
                                </Flex>
                            </Tab>
                        </TabList>

                        <TabPanels>
                            <TabPanel>
                                <Grid
                                    templateColumns="repeat(auto-fill, minmax(350px, 1fr))"
                                    gap={6}
                                >
                                    {opportunities.map(opportunity => (
                                        <OpportunityCard
                                            key={opportunity.id}
                                            opportunity={opportunity}
                                            userSkills={userSkills}
                                            isDemoMode={isDemoMode}
                                            onRefresh={refreshData}
                                        />
                                    ))}
                                    {opportunities.length === 0 && (
                                        <Box gridColumn="1/-1" textAlign="center" py={8}>
                                            <Text color="gray.500">
                                                No opportunities available at the moment.
                                                Check back later for new opportunities!
                                            </Text>
                                        </Box>
                                    )}
                                </Grid>
                            </TabPanel>

                            <TabPanel>
                                <Grid
                                    templateColumns="repeat(auto-fill, minmax(350px, 1fr))"
                                    gap={6}
                                >
                                    {responses.map(response => (
                                        <OpportunityCard
                                            key={response.id}
                                            opportunity={response}
                                            userSkills={userSkills}
                                            isDemoMode={isDemoMode}
                                            isResponseTab={true}
                                            onRefresh={refreshData}
                                        />
                                    ))}
                                    {responses.length === 0 && (
                                        <Box gridColumn="1/-1" textAlign="center" py={8}>
                                            <Text color="gray.500">
                                                You haven't responded to any opportunities yet.
                                                Browse the Available Opportunities tab to get started!
                                            </Text>
                                        </Box>
                                    )}
                                </Grid>
                            </TabPanel>

                            <TabPanel>
                                <VolunteerMessages
                                    onUnreadCountChange={setTotalUnreadMessages}
                                />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </VStack>
            </Box>
        </Box>
    );
}