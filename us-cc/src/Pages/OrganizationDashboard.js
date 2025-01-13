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
    DrawerFooter,
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
    Alert,
    AlertIcon,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    IconButton
} from '@chakra-ui/react';
import { AddIcon, WarningIcon, DeleteIcon, ChatIcon, EditIcon } from '@chakra-ui/icons';
import { MdAssignment, MdAnnouncement } from 'react-icons/md';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { supabase } from '../supabaseClient';
import CreateVolunteerOpportunityModal from '../Components/CreateVolunteerOpportunityModal';
import CreateIncidentModal from '../Components/CreateIncidentModal';
import CreatePostModal from '../Components/CreatePostModal';
import EditVolunteerOpportunityModal from '../Components/EditVolunteerOpportunityModal';

const VolunteerResponsesDrawer = ({ isOpen, onClose, opportunity }) => {
    const [messages, setMessages] = useState({});
    const [existingMessages, setExistingMessages] = useState([]);
    const toast = useToast();

    useEffect(() => {
        const fetchMessages = async () => {
            if (!opportunity?.id) return;

            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('opportunity_id', opportunity.id)
                .order('sent_at', { ascending: true });

            if (error) {
                toast({
                    title: "Error fetching messages",
                    description: error.message,
                    status: "error",
                    duration: 5000
                });
                return;
            }

            setExistingMessages(data || []);
        };

        if (opportunity?.id) {
            fetchMessages();
            const subscription = supabase
                .channel('messages')
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `opportunity_id=eq.${opportunity.id}`
                }, payload => {
                    setExistingMessages(prev => [...prev, payload.new]);
                })
                .subscribe();

            return () => {
                subscription.unsubscribe();
            };
        }
    }, [opportunity?.id, toast]);

    const handleSendMessage = async (volunteerId = null) => {
        if (opportunity.status === 'archived') {
            toast({
                title: "Cannot send messages",
                description: "This opportunity is archived",
                status: "error",
                duration: 3000
            });
            return;
        }

        const message = messages[volunteerId || 'group'];
        if (!message?.trim()) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { error } = await supabase
                .from('messages')
                .insert([{
                    organization_id: user.id,
                    volunteer_id: volunteerId,
                    opportunity_id: opportunity.id,
                    message: message,
                    is_group_message: !volunteerId
                }]);

            if (error) throw error;

            setMessages({ ...messages, [volunteerId || 'group']: '' });
        } catch (error) {
            toast({
                title: "Error sending message",
                description: error.message,
                status: "error",
                duration: 5000
            });
        }
    };

    const getMessagesForVolunteer = (volunteerId) => {
        return existingMessages.filter(msg =>
            msg.volunteer_id === volunteerId ||
            (msg.is_group_message && !msg.volunteer_id)
        );
    };

    const isArchived = opportunity?.status === 'archived';

    return (
        <Drawer
            isOpen={isOpen}
            placement="right"
            onClose={onClose}
            size="md"
        >
            <DrawerOverlay />
            <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader>
                    Volunteer Responses
                    {isArchived && (
                        <Badge ml={2} colorScheme="gray">Archived</Badge>
                    )}
                </DrawerHeader>

                <DrawerBody>
                    <VStack spacing={4} align="stretch">
                        <Text fontWeight="bold">
                            Opportunity: {opportunity?.title}
                        </Text>

                        {isArchived && (
                            <Alert status="info" mb={4}>
                                <AlertIcon />
                                This opportunity is archived. Message history is viewable but new messages cannot be sent.
                            </Alert>
                        )}

                        <Accordion allowMultiple>
                            {opportunity?.responses?.map((response) => (
                                <AccordionItem key={response.id}>
                                    <AccordionButton>
                                        <HStack flex="1">
                                            <Avatar
                                                size="sm"
                                                name={response.volunteer_name}
                                            />
                                            <Text fontWeight="medium">
                                                {response.volunteer_name}
                                            </Text>
                                        </HStack>
                                        <AccordionIcon />
                                    </AccordionButton>
                                    <AccordionPanel>
                                        <VStack align="start" spacing={3}>
                                            <Box>
                                                <Text fontWeight="bold">Location:</Text>
                                                <Text>{response.city}, {response.state}</Text>
                                            </Box>
                                            <Box>
                                                <Text fontWeight="bold">Skills:</Text>
                                                <Wrap>
                                                    {response.skills?.map((skill, index) => (
                                                        <WrapItem key={index}>
                                                            <Tag size="sm" colorScheme="blue">
                                                                <TagLabel>{skill}</TagLabel>
                                                            </Tag>
                                                        </WrapItem>
                                                    ))}
                                                </Wrap>
                                            </Box>
                                            <Box w="full">
                                                <Text fontWeight="bold" mb={2}>Messages:</Text>
                                                <VStack align="stretch" mb={4} maxH="200px" overflowY="auto">
                                                    {getMessagesForVolunteer(response.volunteer_id).map((msg, idx) => (
                                                        <Box
                                                            key={idx}
                                                            bg={msg.is_group_message ? "gray.100" : "blue.100"}
                                                            p={2}
                                                            borderRadius="md"
                                                        >
                                                            <Text fontSize="xs" color="gray.600">
                                                                {msg.is_group_message ? "Group Message" : "Direct Message"}
                                                            </Text>
                                                            <Text>{msg.message}</Text>
                                                        </Box>
                                                    ))}
                                                </VStack>
                                                {!isArchived && (
                                                    <>
                                                        <Input
                                                            placeholder={`Message ${response.volunteer_name}...`}
                                                            value={messages[response.volunteer_id] || ''}
                                                            onChange={(e) => setMessages({
                                                                ...messages,
                                                                [response.volunteer_id]: e.target.value
                                                            })}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    handleSendMessage(response.volunteer_id);
                                                                }
                                                            }}
                                                        />
                                                        <Button
                                                            mt={2}
                                                            size="sm"
                                                            colorScheme="blue"
                                                            leftIcon={<ChatIcon />}
                                                            onClick={() => handleSendMessage(response.volunteer_id)}
                                                            isDisabled={!messages[response.volunteer_id]}
                                                        >
                                                            Send Message
                                                        </Button>
                                                    </>
                                                )}
                                            </Box>
                                        </VStack>
                                    </AccordionPanel>
                                </AccordionItem>
                            ))}
                        </Accordion>

                        {(!opportunity?.responses || opportunity.responses.length === 0) && (
                            <Text color="gray.500" textAlign="center">
                                No responses yet
                            </Text>
                        )}
                    </VStack>
                </DrawerBody>

                <DrawerFooter borderTopWidth="1px">
                    <VStack w="full" spacing={3}>
                        <Box w="full" maxH="150px" overflowY="auto">
                            {existingMessages
                                .filter(msg => msg.is_group_message)
                                .map((msg, idx) => (
                                    <Box
                                        key={idx}
                                        bg="gray.100"
                                        p={2}
                                        borderRadius="md"
                                        mb={2}
                                    >
                                        <Text fontSize="xs" color="gray.600">
                                            Group Message
                                        </Text>
                                        <Text>{msg.message}</Text>
                                    </Box>
                                ))}
                        </Box>
                        {!isArchived && (
                            <>
                                <Input
                                    placeholder="Type a message to all volunteers..."
                                    value={messages['group'] || ''}
                                    onChange={(e) => setMessages({
                                        ...messages,
                                        group: e.target.value
                                    })}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                />
                                <Button
                                    w="full"
                                    colorScheme="blue"
                                    leftIcon={<ChatIcon />}
                                    onClick={() => handleSendMessage()}
                                    isDisabled={!messages['group']}
                                >
                                    Message All Volunteers
                                </Button>
                            </>
                        )}
                    </VStack>
                </DrawerFooter>
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

            {/* Keeping 'Responses' button as a footer for quick access*/}
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
                                            item={incident}
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