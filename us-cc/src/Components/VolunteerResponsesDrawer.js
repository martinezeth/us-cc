import React, { useState, useEffect } from 'react';
import {
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    VStack,
    Box,
    Heading,
    InputGroup,
    InputLeftElement,
    Input,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    HStack,
    Avatar,
    Text,
    Badge,
    Wrap,
    WrapItem,
    Tag,
    TagLabel,
    Textarea,
    Button,
    useToast,
    Flex
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { supabase } from '../supabaseClient';
import { useRealtimeMessages } from '../hooks/useRealtimeMessages';

const VolunteerResponsesDrawer = ({ isOpen, onClose, opportunity }) => {
    const [selectedVolunteer, setSelectedVolunteer] = useState(null);
    const [directMessage, setDirectMessage] = useState('');
    const [groupMessage, setGroupMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const toast = useToast();

    const { messages: existingMessages, loading, error, refreshMessages } = useRealtimeMessages({
        table: 'messages',
        select: '*',
        filter: {
            opportunity_id: opportunity?.id
        },
        broadcastEnabled: true
    });

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
                    created_at: new Date().toISOString()
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
                    created_at: new Date().toISOString()
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
                const volunteerIds = opportunity.responses.map(r => r.volunteer_id);

                const { data: volunteerData, error } = await supabase
                    .from('volunteer_signups')
                    .select('user_id, availability')
                    .in('user_id', volunteerIds);

                if (error) throw error;

                const availabilityMap = {};
                volunteerData.forEach(v => {
                    availabilityMap[v.user_id] = v.availability;
                });

                opportunity.responses = opportunity.responses.map(response => ({
                    ...response,
                    availability: availabilityMap[response.volunteer_id] || 'Not specified'
                }));
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
                                                                            {new Date(msg.created_at).toLocaleString()}
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
                                                    {new Date(msg.created_at).toLocaleString()}
                                                </Text>
                                            </Box>
                                        ))
                                    }
                                </VStack>

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

export default VolunteerResponsesDrawer; 