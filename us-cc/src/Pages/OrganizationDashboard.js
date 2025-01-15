import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Container,
    Grid,
    Heading,
    Text,
    Button,
    VStack,
    HStack,
    Badge,
    Card,
    CardBody,
    CardHeader,
    Stat,
    StatLabel,
    StatNumber,
    StatGroup,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    useToast,
    Icon,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    Input,
    Avatar,
    Tag,
    TagLabel,
    Wrap,
    WrapItem,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    Flex,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    IconButton,
    Textarea,
    InputGroup,
    InputLeftElement,
} from '@chakra-ui/react';
import { AddIcon, WarningIcon, DeleteIcon, EditIcon, SearchIcon, ChatIcon } from '@chakra-ui/icons';
import { MdAssignment, MdAnnouncement } from 'react-icons/md';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { supabase } from '../supabaseClient';
import CreateVolunteerOpportunityModal from '../Components/CreateVolunteerOpportunityModal';
import CreateIncidentModal from '../Components/CreateIncidentModal';
import CreatePostModal from '../Components/CreatePostModal';
import EditVolunteerOpportunityModal from '../Components/EditVolunteerOpportunityModal';
import { INCIDENT_TYPES } from '../constants/incidentTypes';

window.debugOrganization = {
    updateMetadata: async () => {
        try {
            const { data, error } = await supabase.auth.updateUser({
                data: {
                    name: 'Ethan TestOrg',
                    organization_name: 'Test OrgEthan',
                    is_organization: true,
                    organization_type: 'ngo'
                }
            });
            console.log('Update result:', { data, error });
        } catch (error) {
            console.error('Error:', error);
        }
    },

    checkCurrentUser: async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        console.log('Current user:', user);
        console.log('User metadata:', user?.user_metadata);
    }
};

const VolunteerResponsesDrawer = ({ isOpen, onClose, opportunity }) => {
    const [selectedVolunteer, setSelectedVolunteer] = useState(null);
    const [directMessage, setDirectMessage] = useState('');
    const [groupMessage, setGroupMessage] = useState('');
    const [existingMessages, setExistingMessages] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const toast = useToast();

    const fetchMessages = async () => {
        if (!opportunity?.id) return;

        try {
            // First get messages
            const { data: messages, error: messagesError } = await supabase
                .from('messages')
                .select('*')
                .eq('opportunity_id', opportunity.id)
                .order('sent_at', { ascending: true });

            if (messagesError) throw messagesError;

            // Get unique organization IDs from messages
            const orgIds = [...new Set(messages.map(msg => msg.organization_id))];

            // Fetch profile data for these organizations
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('id, full_name, organization_name')
                .in('id', orgIds);

            if (profilesError) throw profilesError;

            // Create a lookup map for organization names
            const orgNameMap = {};
            profiles.forEach(profile => {
                orgNameMap[profile.id] = profile.organization_name || profile.full_name;
            });

            // Combine messages with organization names
            const messagesWithNames = messages.map(message => ({
                ...message,
                organization_name: orgNameMap[message.organization_id] || 'Unknown Organization'
            }));

            setExistingMessages(messagesWithNames);
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast({
                title: "Error fetching messages",
                description: error.message,
                status: "error",
                duration: 5000
            });
        }
    };

    useEffect(() => {
        fetchMessages();

        // Set up real-time subscription for new messages
        const subscription = supabase
            .channel(`messages-${opportunity?.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'messages',
                filter: `opportunity_id=eq.${opportunity?.id}`
            }, (payload) => {
                console.log('Message change received:', payload);
                fetchMessages(); // Refresh messages when changes occur
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [opportunity?.id]);

    const handleSendDirectMessage = async () => {
        if (!selectedVolunteer) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase
                .from('messages')
                .insert([{
                    organization_id: user.id,
                    volunteer_id: selectedVolunteer.volunteer_id,
                    opportunity_id: opportunity.id,
                    message: directMessage,
                    is_group_message: false,
                    sent_at: new Date().toISOString()
                }]);

            if (error) throw error;

            setDirectMessage('');
            toast({
                title: "Message sent",
                status: "success",
                duration: 3000
            });
        } catch (error) {
            toast({
                title: "Error sending message",
                description: error.message,
                status: "error",
                duration: 5000
            });
        }
    };

    const handleSendGroupMessage = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase
                .from('messages')
                .insert([{
                    organization_id: user.id,
                    volunteer_id: null,
                    opportunity_id: opportunity.id,
                    message: groupMessage,
                    is_group_message: true,
                    sent_at: new Date().toISOString()
                }]);

            if (error) throw error;

            setGroupMessage('');
            toast({
                title: "Group message sent",
                status: "success",
                duration: 3000
            });
        } catch (error) {
            toast({
                title: "Error sending group message",
                description: error.message,
                status: "error",
                duration: 5000
            });
        }
    };

    // Filter volunteers based on search query
    const filteredVolunteers = opportunity?.responses?.filter(volunteer =>
        volunteer.volunteer_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        const fetchVolunteerDetails = async () => {
            if (!opportunity?.responses) return;

            try {
                // Get volunteer IDs from responses
                const volunteerIds = opportunity.responses.map(r => r.volunteer_id);

                // Fetch volunteer details including availability
                const { data: volunteerData, error } = await supabase
                    .from('volunteer_signups')
                    .select('user_id, availability')
                    .in('user_id', volunteerIds);

                if (error) throw error;

                // Create a lookup map for volunteer availability
                const availabilityMap = {};
                volunteerData.forEach(v => {
                    availabilityMap[v.user_id] = v.availability;
                });

                // Update the responses with availability data
                const updatedResponses = opportunity.responses.map(response => ({
                    ...response,
                    availability: availabilityMap[response.volunteer_id] || 'Not specified'
                }));

                // Update the opportunity object with the new responses
                opportunity.responses = updatedResponses;
            } catch (error) {
                console.error('Error fetching volunteer details:', error);
            }
        };

        fetchVolunteerDetails();
    }, [opportunity?.id]);

    return (
        <Drawer isOpen={isOpen} onClose={onClose} size="md">
            <DrawerOverlay />
            <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader>Volunteer Responses</DrawerHeader>
                <DrawerBody>
                    <VStack spacing={4} align="stretch">
                        {/* Volunteer List Section */}
                        <Box bg="white" borderRadius="md" boxShadow="sm">
                            <Heading size="sm" p={4} borderBottom="1px" borderColor="gray.100">
                                Volunteers ({opportunity?.responses?.length || 0})
                            </Heading>

                            {/* Search Bar */}
                            <Box p={4} borderBottom="1px" borderColor="gray.100">
                                <InputGroup>
                                    <InputLeftElement pointerEvents="none">
                                        <SearchIcon color="gray.400" />
                                    </InputLeftElement>
                                    <Input
                                        placeholder="Search volunteers..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        variant="filled"
                                        bg="gray.50"
                                    />
                                </InputGroup>
                            </Box>

                            {/* Scrollable Volunteer List */}
                            <Box maxH="400px" overflowY="auto">
                                <Accordion allowMultiple>
                                    {filteredVolunteers?.map((volunteer) => (
                                        <AccordionItem key={volunteer.volunteer_id} border="none">
                                            <AccordionButton _hover={{ bg: 'gray.50' }}>
                                                <Box flex="1">
                                                    <Flex justify="space-between" align="center">
                                                        <HStack>
                                                            <Avatar
                                                                size="sm"
                                                                name={volunteer.volunteer_name}
                                                            />
                                                            <Text fontWeight="bold">
                                                                {volunteer.volunteer_name}
                                                            </Text>
                                                        </HStack>
                                                        <Badge colorScheme="blue">
                                                            {volunteer.skills?.length || 0} skills
                                                        </Badge>
                                                    </Flex>
                                                </Box>
                                                <AccordionIcon />
                                            </AccordionButton>
                                            <AccordionPanel pb={4} bg="gray.50">
                                                <VStack align="stretch" spacing={4}>
                                                    {/* Volunteer Details */}
                                                    <Box bg="white" p={4} borderRadius="md">
                                                        <Text fontWeight="bold" mb={2}>Skills:</Text>
                                                        <Wrap mb={3}>
                                                            {volunteer.skills?.map((skill, index) => (
                                                                <WrapItem key={index}>
                                                                    <Tag size="md" colorScheme="blue">
                                                                        <TagLabel>{skill}</TagLabel>
                                                                    </Tag>
                                                                </WrapItem>
                                                            ))}
                                                        </Wrap>
                                                        <Text fontWeight="bold" mb={2}>Availability:</Text>
                                                        <Wrap>
                                                            {volunteer.availability ? (
                                                                // Split the availability string into an array if it's not already
                                                                (Array.isArray(volunteer.availability) ? 
                                                                    volunteer.availability : 
                                                                    volunteer.availability.split(',')
                                                                ).map((time, index) => (
                                                                    <WrapItem key={index}>
                                                                        <Tag size="md" colorScheme="purple">
                                                                            <TagLabel>{time.trim()}</TagLabel>
                                                                        </Tag>
                                                                    </WrapItem>
                                                                ))
                                                            ) : (
                                                                <Text color="gray.500">Not specified</Text>
                                                            )}
                                                        </Wrap>
                                                    </Box>

                                                    {/* Direct Messages */}
                                                    <Box bg="white" p={4} borderRadius="md">
                                                        <Heading size="sm" mb={3}>Direct Messages</Heading>
                                                        <VStack spacing={2} align="stretch" maxH="200px" overflowY="auto">
                                                            {existingMessages
                                                                .filter(msg => msg.volunteer_id === volunteer.volunteer_id)
                                                                .map((msg, idx) => (
                                                                    <Box
                                                                        key={idx}
                                                                        p={3}
                                                                        bg="blue.50"
                                                                        borderRadius="md"
                                                                    >
                                                                        <Text>{msg.message}</Text>
                                                                        <Text fontSize="xs" color="gray.500" mt={1}>
                                                                            {new Date(msg.sent_at).toLocaleString()}
                                                                        </Text>
                                                                    </Box>
                                                                ))
                                                            }
                                                        </VStack>
                                                        <Textarea
                                                            mt={3}
                                                            value={selectedVolunteer?.volunteer_id === volunteer.volunteer_id ? directMessage : ''}
                                                            onChange={(e) => {
                                                                setSelectedVolunteer(volunteer);
                                                                setDirectMessage(e.target.value);
                                                            }}
                                                            placeholder={`Message ${volunteer.volunteer_name}...`}
                                                        />
                                                        <Button
                                                            mt={2}
                                                            colorScheme="blue"
                                                            onClick={() => {
                                                                setSelectedVolunteer(volunteer);
                                                                handleSendDirectMessage();
                                                            }}
                                                            isDisabled={!directMessage.trim() || selectedVolunteer?.volunteer_id !== volunteer.volunteer_id}
                                                            width="full"
                                                        >
                                                            Send Message
                                                        </Button>
                                                    </Box>
                                                </VStack>
                                            </AccordionPanel>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </Box>
                        </Box>

                        {/* Group Messages Section */}
                        <Box bg="white" borderRadius="md" boxShadow="sm">
                            <Heading size="sm" p={4} borderBottom="1px" borderColor="gray.100">
                                Group Messages
                            </Heading>
                            <Box p={4}>
                                {/* Display Group Messages */}
                                <VStack spacing={2} align="stretch" maxH="200px" overflowY="auto" mb={4}>
                                    {existingMessages
                                        .filter(msg => msg.is_group_message)
                                        .map((msg, idx) => (
                                            <Box
                                                key={idx}
                                                p={3}
                                                bg="purple.50"
                                                borderRadius="md"
                                            >
                                                <Text>{msg.message}</Text>
                                                <Text fontSize="xs" color="gray.500" mt={1}>
                                                    {new Date(msg.sent_at).toLocaleString()}
                                                </Text>
                                            </Box>
                                        ))
                                    }
                                </VStack>

                                {/* Send Group Message */}
                                <Textarea
                                    value={groupMessage}
                                    onChange={(e) => setGroupMessage(e.target.value)}
                                    placeholder="Type a message to all volunteers..."
                                />
                                <Button
                                    mt={2}
                                    colorScheme="purple"
                                    onClick={handleSendGroupMessage}
                                    isDisabled={!groupMessage.trim()}
                                    width="full"
                                >
                                    Send Group Message
                                </Button>
                            </Box>
                        </Box>
                    </VStack>
                </DrawerBody>
            </DrawerContent>
        </Drawer>
    );
};

const DashboardCard = ({ children, title }) => (
    <Card>
        <CardHeader>
            <Text fontSize="lg" fontWeight="semibold">{title}</Text>
        </CardHeader>
        <CardBody>{children}</CardBody>
    </Card>
);

const ContentCard = ({ item, type, onDelete, onViewResponses, onArchive, onEdit }) => {
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const cancelRef = useRef();
    const toast = useToast();

    const handleDelete = async () => {
        try {
            const table = type === 'opportunity' ? 'volunteer_opportunities' :
                type === 'post' ? 'posts' : 'incidents';

            if (type === 'opportunity') {
                // Check if there are responses
                const { data: responses } = await supabase
                    .from('opportunity_responses')
                    .select('id')
                    .eq('opportunity_id', item.id);

                if (responses && responses.length > 0) {
                    // If there are volunteer responses, archive instead of deleting
                    const { error: archiveError } = await supabase
                        .from('volunteer_opportunities')
                        .update({
                            status: 'archived',
                            archived_at: new Date().toISOString()
                        })
                        .eq('id', item.id);

                    if (archiveError) throw archiveError;

                    toast({
                        title: "Opportunity Archived",
                        description: "This opportunity has responses and has been archived instead of deleted",
                        status: "info",
                        duration: 5000
                    });
                } else {
                    // If no responses, proceed with deletion
                    const { error: deleteError } = await supabase
                        .from(table)
                        .delete()
                        .eq('id', item.id);

                    if (deleteError) throw deleteError;

                    toast({
                        title: "Deleted Successfully",
                        status: "success",
                        duration: 3000
                    });
                }
            } else {
                // For non-opportunity items, proceed with normal deletion
                const { error } = await supabase
                    .from(table)
                    .delete()
                    .eq('id', item.id);

                if (error) throw error;

                toast({
                    title: "Deleted Successfully",
                    status: "success",
                    duration: 3000
                });
            }

            if (onDelete) onDelete(item.id);
        } catch (error) {
            toast({
                title: "Error",
                description: error.message,
                status: "error",
                duration: 5000
            });
        }
        setIsDeleteAlertOpen(false);
    };

    const getFormattedDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const isArchived = item.status === 'archived';

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
            {/* Header with Menu */}
            <Flex justify="space-between" align="start" mb={2}>
                <Heading size="md" noOfLines={2}>
                    {item.title || item.incident_type}
                </Heading>
                <HStack spacing={2}>
                    {type === 'opportunity' && (
                        <Badge colorScheme={isArchived ? 'gray' : 'green'}>
                            {isArchived ? 'Archived' : 'Active'}
                        </Badge>
                    )}
                    <Menu>
                        <MenuButton
                            as={IconButton}
                            icon={<BsThreeDotsVertical />}
                            variant="ghost"
                            size="sm"
                            aria-label="More options"
                        />
                        <MenuList>
                            {type === 'opportunity' && !isArchived && (
                                <>
                                    <MenuItem
                                        icon={<EditIcon />}
                                        onClick={() => onEdit(item)}
                                    >
                                        Edit
                                    </MenuItem>
                                    <MenuItem
                                        icon={<WarningIcon />}
                                        onClick={() => onArchive(item.id, 'archived')}
                                    >
                                        Archive
                                    </MenuItem>
                                </>
                            )}
                            {type === 'opportunity' && isArchived && (
                                <MenuItem
                                    icon={<AddIcon />}
                                    onClick={() => onArchive(item.id, 'open')}
                                >
                                    Reopen
                                </MenuItem>
                            )}
                            <MenuItem
                                icon={<DeleteIcon />}
                                color="red.500"
                                onClick={() => setIsDeleteAlertOpen(true)}
                            >
                                Delete
                            </MenuItem>
                        </MenuList>
                    </Menu>
                </HStack>
            </Flex>

            {/* Content */}
            <Text color="gray.600" fontSize="sm">
                Created {getFormattedDate(item.created_at || item.date_posted || item.timestamp)}
                {isArchived && item.archived_at && ` • Archived ${getFormattedDate(item.archived_at)}`}
            </Text>

            <Text noOfLines={3} mt={2}>
                {item.description || item.body}
            </Text>

            {type === 'opportunity' && item.location && (
                <Text fontSize="sm" color="gray.600">
                    Location: {item.location}
                    {item.radius_miles && ` (${item.radius_miles} mile radius)`}
                </Text>
            )}

            {type === 'opportunity' && (
                <Flex mt={4} justify="flex-start">
                    <Button
                        size="sm"
                        colorScheme="blue"
                        leftIcon={<ChatIcon />}
                        onClick={() => onViewResponses(item)}
                        minW="140px"
                    >
                        Responses ({item.response_count || 0})
                    </Button>
                </Flex>
            )}

            {/* Delete Alert Dialog */}
            <AlertDialog
                isOpen={isDeleteAlertOpen}
                leastDestructiveRef={cancelRef}
                onClose={() => setIsDeleteAlertOpen(false)}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader>Delete {type}</AlertDialogHeader>
                        <AlertDialogBody>
                            Are you sure? This will permanently delete this {type}
                            {type === 'opportunity' && ' and all associated volunteer responses'}.
                            This action cannot be undone.
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={() => setIsDeleteAlertOpen(false)}>
                                Cancel
                            </Button>
                            <Button colorScheme="red" onClick={handleDelete} ml={3}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
};

export default function OrganizationDashboard() {
    const [activeOpportunities, setActiveOpportunities] = useState([]);
    const [archivedOpportunities, setArchivedOpportunities] = useState([]);
    const [posts, setPosts] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [stats, setStats] = useState({
        activeOpportunities: 0,
        totalResponses: 0,
        volunteersEngaged: 0
    });
    const [selectedOpportunity, setSelectedOpportunity] = useState(null);
    const [isResponsesDrawerOpen, setIsResponsesDrawerOpen] = useState(false);
    const [isOpportunityModalOpen, setIsOpportunityModalOpen] = useState(false);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
    const [selectedOpportunityForEdit, setSelectedOpportunityForEdit] = useState(null);

    const toast = useToast();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Fetch active opportunities
            const { data: activeOpps, error: activeError } = await supabase
                .from('volunteer_opportunities')
                .select(`
                    *,
                    responses:opportunity_responses(count)
                `)
                .eq('organization_id', user.id)
                .eq('status', 'open')
                .order('created_at', { ascending: false });

            if (activeError) throw activeError;

            // Fetch archived opportunities
            const { data: archivedOpps, error: archivedError } = await supabase
                .from('volunteer_opportunities')
                .select(`
                    *,
                    responses:opportunity_responses(count)
                `)
                .eq('organization_id', user.id)
                .eq('status', 'archived')
                .order('created_at', { ascending: false });

            if (archivedError) throw archivedError;

            // Process opportunities to include response counts
            const processOpportunities = (opps) => opps.map(opp => ({
                ...opp,
                response_count: opp.responses[0]?.count || 0
            }));

            setActiveOpportunities(processOpportunities(activeOpps || []));
            setArchivedOpportunities(processOpportunities(archivedOpps || []));

            // Fetch posts
            const { data: postsData } = await supabase
                .from('posts')
                .select('*')
                .eq('user_id', user.id)
                .order('date_posted', { ascending: false });

            setPosts(postsData || []);

            // Fetch incidents
            const { data: incidentsData } = await supabase
                .from('incidents')
                .select('*')
                .eq('created_by', user.id)
                .order('timestamp', { ascending: false });

            setIncidents(incidentsData || []);

            // Calculate stats
            const { data: responsesData } = await supabase
                .from('opportunity_responses')
                .select('volunteer_id')
                .in('opportunity_id', [...(activeOpps || []), ...(archivedOpps || [])].map(opp => opp.id));

            setStats({
                activeOpportunities: activeOpps?.length || 0,
                totalResponses: responsesData?.length || 0,
                volunteersEngaged: new Set(responsesData?.map(r => r.volunteer_id))?.size || 0
            });

        } catch (error) {
            toast({
                title: "Error loading dashboard",
                description: error.message,
                status: "error",
                duration: 5000,
            });
        }
    };

    const handleViewResponses = async (opportunity) => {
        try {
            // Initially fetching responses with a simple query
            const { data: responseData, error: responsesError } = await supabase
                .from('opportunity_responses')
                .select('*')
                .eq('opportunity_id', opportunity.id);

            if (responsesError) throw responsesError;

            // Then fetch additional data for each response
            const processedResponses = await Promise.all(responseData.map(async (response) => {
                const { data: signupData } = await supabase
                    .from('volunteer_signups')
                    .select('skills, region')
                    .eq('user_id', response.volunteer_id)
                    .single();

                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('full_name, city, state')
                    .eq('id', response.volunteer_id)
                    .single();

                return {
                    id: response.id,
                    volunteer_id: response.volunteer_id,
                    volunteer_name: profileData?.full_name || 'Anonymous Volunteer',
                    city: profileData?.city || 'Unknown City',
                    state: profileData?.state || 'Unknown State',
                    skills: signupData?.skills || [],
                    status: response.status,
                    response_date: response.response_date
                };
            }));

            setSelectedOpportunity({
                ...opportunity,
                responses: processedResponses
            });
            setIsResponsesDrawerOpen(true);
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: "Error loading responses",
                description: error.message,
                status: "error",
                duration: 5000
            });
        }
    };

    const handleDelete = (type) => (id) => {
        if (type === 'opportunity') {
            setActiveOpportunities(prev => prev.filter(opp => opp.id !== id));
            setArchivedOpportunities(prev => prev.filter(opp => opp.id !== id));
        } else if (type === 'post') {
            setPosts(prev => prev.filter(post => post.id !== id));
        } else if (type === 'incident') {
            setIncidents(prev => prev.filter(inc => inc.id !== id));
        }
    };

    const handleArchive = async (id, newStatus) => {
        try {
            const { error } = await supabase
                .from('volunteer_opportunities')
                .update({
                    status: newStatus,
                    archived_at: newStatus === 'archived' ? new Date().toISOString() : null
                })
                .eq('id', id);

            if (error) throw error;

            // Update local state
            if (newStatus === 'archived') {
                const opportunity = activeOpportunities.find(opp => opp.id === id);
                setActiveOpportunities(prev => prev.filter(opp => opp.id !== id));
                setArchivedOpportunities(prev => [...prev, { ...opportunity, status: 'archived' }]);
            } else {
                const opportunity = archivedOpportunities.find(opp => opp.id === id);
                setArchivedOpportunities(prev => prev.filter(opp => opp.id !== id));
                setActiveOpportunities(prev => [...prev, { ...opportunity, status: 'open' }]);
            }

            toast({
                title: newStatus === 'archived' ? "Opportunity Archived" : "Opportunity Reopened",
                status: "success",
                duration: 3000
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error.message,
                status: "error",
                duration: 5000
            });
        }
    };

    return (
        <Box bg="gray.50" minH="90vh">
            <Container maxW="7xl" py={8}>
                <VStack spacing={8} align="stretch">
                    <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                            <Heading size="lg">Organization Dashboard</Heading>
                            <Text color="gray.600">Manage your content and opportunities</Text>
                        </VStack>
                        <HStack>
                            <Button
                                leftIcon={<Icon as={MdAssignment} />}
                                colorScheme="blue"
                                onClick={() => setIsOpportunityModalOpen(true)}
                            >
                                New Opportunity
                            </Button>
                            <Button
                                leftIcon={<Icon as={MdAnnouncement} />}
                                colorScheme="green"
                                onClick={() => setIsPostModalOpen(true)}
                            >
                                New Post
                            </Button>
                            <Button
                                leftIcon={<WarningIcon />}
                                colorScheme="red"
                                onClick={() => setIsIncidentModalOpen(true)}
                            >
                                Report Incident
                            </Button>
                        </HStack>
                    </HStack>

                    <DashboardCard>
                        <StatGroup>
                            <Stat>
                                <StatLabel>Active Opportunities</StatLabel>
                                <StatNumber>{stats.activeOpportunities}</StatNumber>
                            </Stat>
                            <Stat>
                                <StatLabel>Total Responses</StatLabel>
                                <StatNumber>{stats.totalResponses}</StatNumber>
                            </Stat>
                            <Stat>
                                <StatLabel>Volunteers Engaged</StatLabel>
                                <StatNumber>{stats.volunteersEngaged}</StatNumber>
                            </Stat>
                        </StatGroup>
                    </DashboardCard>

                    <Tabs colorScheme="blue" variant="enclosed">
                        <TabList>
                            <Tab>Active Opportunities ({activeOpportunities.length})</Tab>
                            <Tab>Archived Opportunities ({archivedOpportunities.length})</Tab>
                            <Tab>Posts ({posts.length})</Tab>
                            <Tab>Incidents ({incidents.length})</Tab>
                        </TabList>

                        <TabPanels>
                            <TabPanel>
                                <Grid templateColumns="repeat(auto-fill, minmax(350px, 1fr))" gap={6}>
                                    {activeOpportunities.map(opportunity => (
                                        <ContentCard
                                            key={`opp-${opportunity.id}`}
                                            item={opportunity}
                                            type="opportunity"
                                            onDelete={handleDelete('opportunity')}
                                            onViewResponses={handleViewResponses}
                                            onArchive={handleArchive}
                                            onEdit={(opportunity) => setSelectedOpportunityForEdit(opportunity)}
                                        />
                                    ))}
                                </Grid>
                            </TabPanel>

                            <TabPanel>
                                <Grid templateColumns="repeat(auto-fill, minmax(350px, 1fr))" gap={6}>
                                    {archivedOpportunities.map(opportunity => (
                                        <ContentCard
                                            key={`opp-${opportunity.id}`}
                                            item={opportunity}
                                            type="opportunity"
                                            onDelete={handleDelete('opportunity')}
                                            onViewResponses={handleViewResponses}
                                            onArchive={handleArchive}
                                        />
                                    ))}
                                </Grid>
                            </TabPanel>

                            <TabPanel>
                                <Grid templateColumns="repeat(auto-fill, minmax(350px, 1fr))" gap={6}>
                                    {posts.map(post => (
                                        <ContentCard
                                            key={`post-${post.id}`}
                                            item={post}
                                            type="post"
                                            onDelete={handleDelete('post')}
                                        />
                                    ))}
                                </Grid>
                            </TabPanel>

                            <TabPanel>
                                <Grid templateColumns="repeat(auto-fill, minmax(350px, 1fr))" gap={6}>
                                    {incidents.map(incident => (
                                        <ContentCard
                                            key={`incident-${incident.id}`}
                                            item={{
                                                ...incident,
                                                title: INCIDENT_TYPES[incident.incident_type] || incident.incident_type
                                            }}
                                            type="incident"
                                            onDelete={handleDelete('incident')}
                                        />
                                    ))}
                                </Grid>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </VStack>
            </Container>

            <CreateVolunteerOpportunityModal
                isOpen={isOpportunityModalOpen}
                onClose={() => setIsOpportunityModalOpen(false)}
                onCreateSuccess={fetchDashboardData}
            />
            <CreatePostModal
                isOpen={isPostModalOpen}
                onClose={() => setIsPostModalOpen(false)}
                onCreatePost={fetchDashboardData}
            />
            <CreateIncidentModal
                isOpen={isIncidentModalOpen}
                onClose={() => setIsIncidentModalOpen(false)}
                onCreateSuccess={fetchDashboardData}
            />

            <EditVolunteerOpportunityModal
                isOpen={!!selectedOpportunityForEdit}
                onClose={() => setSelectedOpportunityForEdit(null)}
                opportunity={selectedOpportunityForEdit}
                onUpdateSuccess={() => {
                    fetchDashboardData();
                    setSelectedOpportunityForEdit(null);
                    toast({
                        title: "Opportunity Updated",
                        description: "The volunteer opportunity has been successfully updated.",
                        status: "success",
                        duration: 3000
                    });
                }}
            />

            <VolunteerResponsesDrawer
                isOpen={isResponsesDrawerOpen}
                onClose={() => {
                    setIsResponsesDrawerOpen(false);
                    setSelectedOpportunity(null);
                }}
                opportunity={selectedOpportunity}
            />
        </Box>
    );
}