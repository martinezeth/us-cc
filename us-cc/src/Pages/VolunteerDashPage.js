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
} from '@chakra-ui/react';
import { FaBuilding, FaCheckCircle } from 'react-icons/fa';
import { supabase } from '../supabaseClient';
import { STANDARD_SKILLS, AVAILABILITY_OPTIONS } from '../constants/incidentTypes';

const VolunteerRegistrationModal = ({ isOpen, onClose, onRegister }) => {
    const [formData, setFormData] = useState({
        skills: [],
        availability: [],
        region: ''
    });
    const toast = useToast();

    const handleSubmit = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { error } = await supabase
                .from('volunteer_signups')
                .insert([{
                    user_id: user.id,
                    skills: formData.skills,
                    availability: formData.availability,
                    region: formData.region
                }]);

            if (error) throw error;

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
                        <FormControl isRequired>
                            <FormLabel>Region</FormLabel>
                            <Input
                                value={formData.region}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    region: e.target.value
                                })}
                                placeholder="e.g., Sacramento County"
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Skills</FormLabel>
                            <Select
                                isMulti
                                value={formData.skills}
                                onChange={(e) => {
                                    const values = Array.from(e.target.selectedOptions, option => option.value);
                                    setFormData({
                                        ...formData,
                                        skills: values
                                    });
                                }}
                                multiple
                            >
                                {STANDARD_SKILLS.map(skill => (
                                    <option key={skill} value={skill}>
                                        {skill}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Availability</FormLabel>
                            <Select
                                isMulti
                                value={formData.availability}
                                onChange={(e) => {
                                    const values = Array.from(e.target.selectedOptions, option => option.value);
                                    setFormData({
                                        ...formData,
                                        availability: values
                                    });
                                }}
                                multiple
                            >
                                {AVAILABILITY_OPTIONS.map(option => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

                        <Button colorScheme="blue" onClick={handleSubmit}>
                            Register
                        </Button>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

const OpportunityCard = ({ opportunity, userSkills, isDemoMode, isResponseTab = false }) => {
    const [isResponding, setIsResponding] = useState(false);
    const toast = useToast();
    const matchedSkills = userSkills.filter(skill =>
        opportunity.required_skills.includes(skill)
    );
    const hasRequiredSkills = matchedSkills.length > 0;

    const handleVolunteerClick = async () => {
        setIsResponding(true);
        try {
            if (isDemoMode) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                toast({
                    title: "Demo: Response Sent!",
                    description: "In demo mode, all responses are automatically accepted.",
                    status: "success",
                    duration: 5000
                });
            } else {
                const { data: { user } } = await supabase.auth.getUser();
                const { error } = await supabase
                    .from('opportunity_responses')
                    .insert([{
                        opportunity_id: opportunity.id,
                        volunteer_id: user.id
                    }]);
                if (error) throw error;
                toast({
                    title: "Response Sent!",
                    description: "The organization will review your application.",
                    status: "success"
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error.message,
                status: "error"
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
            {isResponseTab && (
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
                        isDisabled={!hasRequiredSkills}
                    >
                        Volunteer
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
            const { data: opportunities, error: opportunitiesError } = await supabase
                .from('volunteer_opportunities')
                .select('*')
                .eq('status', 'open')
                .order('created_at', { ascending: false });

            if (opportunitiesError) throw opportunitiesError;

            const opportunitiesWithOrgs = await Promise.all(opportunities.map(async (opp) => {
                const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(opp.organization_id);
                return {
                    ...opp,
                    organization_name: user?.user_metadata?.name || 'Unknown Organization'
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
                    *,
                    opportunity:opportunity_id (*)
                `)
                .eq('volunteer_id', user.id)
                .eq('status', 'accepted');

            if (responsesError) throw responsesError;

            const responsesWithOrgs = await Promise.all(responses.map(async (response) => {
                const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(response.opportunity.organization_id);
                return {
                    ...response.opportunity,
                    organization_name: user?.user_metadata?.name || 'Unknown Organization'
                };
            }));

            setResponses(responsesWithOrgs);
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
                                        />
                                    ))}
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
                                        />
                                    ))}
                                </Grid>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </VStack>
            </Box>
        </Box>
    );
}