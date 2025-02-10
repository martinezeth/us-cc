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
    Flex,
    Circle
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { supabase } from '../supabaseClient';
import { useRealtimeMessages } from '../hooks/useRealtimeMessages';
import { useNavigate } from 'react-router-dom';
import { handleProfileClick } from '../utils/navigationHelpers';

const VolunteerResponsesDrawer = ({ isOpen, onClose, opportunity }) => {
    const [selectedVolunteer, setSelectedVolunteer] = useState(null);
    const [directMessage, setDirectMessage] = useState('');
    const [groupMessage, setGroupMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const toast = useToast();
    const navigate = useNavigate();

    const { messages: existingMessages, loading, error, refreshMessages } = useRealtimeMessages({
        table: 'messages',
        select: `
            id,
            opportunity_id,
            organization_id,
            volunteer_id,
            recipient_id,
            message,
            sent_at,
            is_group_message,
            read_status:message_read_status(
                user_id,
                read_at
            )
        `,
        filter: opportunity?.id ? {
            opportunity_id: opportunity.id
        } : null,
        broadcastEnabled: true,
        onSubscription: (message) => {
            console.log('Drawer realtime message received:', message);
        },
        enabled: !!opportunity?.id && isOpen
    });

    useEffect(() => {
        const getCurrentUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
        };
        getCurrentUser();
    }, []);

    const handleSendDirectMessage = async () => {
        if (!selectedVolunteer) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase
                .from('messages')
                .insert([{
                    organization_id: user.id,
                    volunteer_id: null,
                    recipient_id: selectedVolunteer.volunteer_id,
                    opportunity_id: opportunity.id,
                    message: directMessage,
                    is_group_message: false
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
    const filteredVolunteers = opportunity?.responses?.filter(volunteer => {
        const searchTerm = searchQuery.toLowerCase();
        const volunteerName = volunteer?.volunteer_name || '';
        return volunteerName.toLowerCase().includes(searchTerm);
    });

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

    const isMessageUnread = (message) => {
        if (!currentUser) return false;
        
        const isUnread = !message.read_status?.some(status => 
            status.user_id === currentUser.id
        );

        console.log('Drawer checking message read status:', {
            messageId: message.id,
            message: message.message,
            readStatus: message.read_status,
            userId: currentUser?.id,
            isUnread
        });
        
        return isUnread;
    };

    const getVolunteerMessageStats = (volunteerId) => {
        if (!currentUser) return { unreadCount: 0 };

        const volunteerMessages = existingMessages.filter(msg => 
            msg.volunteer_id === volunteerId && !msg.is_group_message
        );
        
        const unreadCount = volunteerMessages.filter(msg => 
            isMessageUnread(msg)
        ).length;

        return { unreadCount };
    };

    // Add markMessagesAsRead function
    const markMessagesAsRead = async (messageIds) => {
        console.log('Attempting to mark messages as read:', {
            messageIds,
            currentUser: currentUser?.id
        });
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('message_read_status')
                .upsert(
                    messageIds.map(msgId => ({
                        message_id: msgId,
                        user_id: user.id
                    })),
                    { onConflict: 'message_id,user_id' }
                );

            if (error) {
                console.error('Error marking messages as read:', error);
                return;
            }

            await refreshMessages();
        } catch (error) {
            console.error('Error in markMessagesAsRead:', error);
        }
    };

    // Add function to mark all messages from a volunteer as read
    const markVolunteerMessagesAsRead = async (volunteerId) => {
        try {
            const unreadMessageIds = existingMessages
                .filter(msg => {
                    const shouldMark = msg.volunteer_id === volunteerId && isMessageUnread(msg);
                    
                    console.log('Message filtering:', {
                        id: msg.id,
                        message: msg.message,
                        volunteer_id: msg.volunteer_id,
                        is_unread: isMessageUnread(msg),
                        shouldMark
                    });
                    
                    return shouldMark;
                })
                .map(msg => msg.id);

            if (unreadMessageIds.length > 0) {
                await markMessagesAsRead(unreadMessageIds);
            }
        } catch (error) {
            console.error('Error marking volunteer messages as read:', error);
        }
    };

    // Helper function to format availability string
    const formatAvailability = (availability) => {
        if (!availability) return [];
        if (Array.isArray(availability)) return availability;
        
        // Handle combined string format (e.g., "MorningsWeekendsAfternoons")
        return availability
            .match(/[A-Z][a-z]+/g) // Split on capital letters and include following lowercase letters
            .map(time => time.trim())
            .filter(Boolean); // Remove any empty strings
    };

    // Add cleanup for messages when drawer closes
    useEffect(() => {
        if (!isOpen) {
            // Clear messages when drawer closes
            setDirectMessage('');
            setGroupMessage('');
            setSelectedVolunteer(null);
        }
    }, [isOpen]);

    return (
        <Drawer isOpen={isOpen} onClose={onClose} size="md">
            <DrawerOverlay />
            <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader borderBottomWidth="1px">
                    Volunteer Responses ({opportunity?.responses?.length || 0})
                </DrawerHeader>
                <DrawerBody>
                    <VStack spacing={4} align="stretch">
                        {/* Search Bar */}
                        <Box p={2}>
                            <InputGroup>
                                <InputLeftElement pointerEvents="none">
                                    <SearchIcon color="gray.400" />
                                </InputLeftElement>
                                <Input
                                    placeholder="Search volunteers..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    bg="white"
                                />
                            </InputGroup>
                        </Box>

                        {/* Volunteer List */}
                        <Accordion allowMultiple>
                            {filteredVolunteers?.map((volunteer) => {
                                const { unreadCount } = getVolunteerMessageStats(volunteer.volunteer_id);
                                
                                return (
                                    <AccordionItem key={volunteer.volunteer_id}>
                                        <AccordionButton 
                                            onClick={() => {
                                                markVolunteerMessagesAsRead(volunteer.volunteer_id);
                                            }}
                                            _hover={{ bg: 'gray.50' }}
                                            p={4}
                                        >
                                            <HStack flex="1" spacing={4}>
                                                <Avatar
                                                    size="sm"
                                                    name={volunteer.volunteer_name}
                                                />
                                                <Box flex="1">
                                                    <Flex align="center" gap={2}>
                                                        <Text 
                                                            fontWeight="bold"
                                                            cursor="pointer"
                                                            _hover={{ color: "blue.500" }}
                                                            onClick={(e) => handleProfileClick(e, {
                                                                full_name: volunteer.volunteer_name
                                                            }, navigate)}
                                                        >
                                                            {volunteer.volunteer_name}
                                                        </Text>
                                                        {unreadCount > 0 && (
                                                            <Badge 
                                                                colorScheme="red" 
                                                                borderRadius="full"
                                                            >
                                                                {unreadCount} new
                                                            </Badge>
                                                        )}
                                                    </Flex>
                                                </Box>
                                            </HStack>
                                            <AccordionIcon />
                                        </AccordionButton>

                                        <AccordionPanel pb={4} bg="gray.50">
                                            <VStack align="stretch" spacing={4}>
                                                {/* Volunteer Details */}
                                                <Box bg="white" p={4} borderRadius="md" shadow="sm">
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
                                                            formatAvailability(volunteer.availability).map((time, index) => (
                                                                <WrapItem key={index}>
                                                                    <Tag size="md" colorScheme="purple">
                                                                        <TagLabel>{time}</TagLabel>
                                                                    </Tag>
                                                                </WrapItem>
                                                            ))
                                                        ) : (
                                                            <Text color="gray.500">Not specified</Text>
                                                        )}
                                                    </Wrap>
                                                </Box>

                                                {/* Messages Section */}
                                                <Box bg="white" p={4} borderRadius="md" shadow="sm">
                                                    <Text fontWeight="bold" mb={3}>Messages</Text>
                                                    <VStack 
                                                        spacing={2} 
                                                        align="stretch" 
                                                        maxH="200px" 
                                                        overflowY="auto"
                                                        mb={4}
                                                        sx={{
                                                            '&::-webkit-scrollbar': {
                                                                width: '4px',
                                                            },
                                                            '&::-webkit-scrollbar-track': {
                                                                width: '6px',
                                                            },
                                                            '&::-webkit-scrollbar-thumb': {
                                                                background: 'gray.300',
                                                                borderRadius: '24px',
                                                            },
                                                        }}
                                                    >
                                                        {existingMessages
                                                            .filter(msg => msg.volunteer_id === volunteer.volunteer_id || 
                                                                         (msg.recipient_id === volunteer.volunteer_id && !msg.is_group_message))
                                                            .map((msg, idx) => (
                                                                <Box
                                                                    key={idx}
                                                                    p={3}
                                                                    bg={msg.volunteer_id ? "blue.50" : "gray.100"}
                                                                    borderRadius="md"
                                                                    alignSelf={msg.volunteer_id ? "flex-start" : "flex-end"}
                                                                    maxW="80%"
                                                                    position="relative"
                                                                >
                                                                    <Text>
                                                                        {msg.message}
                                                                    </Text>
                                                                    <Text 
                                                                        fontSize="xs" 
                                                                        color="gray.500" 
                                                                        mt={1}
                                                                        textAlign={msg.volunteer_id ? "left" : "right"}
                                                                    >
                                                                        {new Date(msg.sent_at).toLocaleString()}
                                                                    </Text>
                                                                </Box>
                                                            ))
                                                        }
                                                    </VStack>
                                                    <Textarea
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
                                                        width="full"
                                                        onClick={() => {
                                                            setSelectedVolunteer(volunteer);
                                                            handleSendDirectMessage();
                                                        }}
                                                        isDisabled={!directMessage.trim() || selectedVolunteer?.volunteer_id !== volunteer.volunteer_id}
                                                    >
                                                        Send Message
                                                    </Button>
                                                </Box>
                                            </VStack>
                                        </AccordionPanel>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>

                        {/* Add Group Message Section */}
                        <Box 
                            bg="white" 
                            p={4} 
                            borderRadius="md" 
                            shadow="sm"
                            borderWidth="1px"
                            borderColor="gray.200"
                            mt={4}
                        >
                            <Heading size="sm" mb={4}>
                                Send Group Message
                            </Heading>
                            <VStack 
                                spacing={2} 
                                align="stretch" 
                                maxH="200px" 
                                overflowY="auto"
                                mb={4}
                                sx={{
                                    '&::-webkit-scrollbar': {
                                        width: '4px',
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        width: '6px',
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        background: 'gray.300',
                                        borderRadius: '24px',
                                    },
                                }}
                            >
                                {existingMessages
                                    .filter(msg => msg.is_group_message && opportunity?.id && msg.opportunity_id === opportunity.id)
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
                            <Textarea
                                value={groupMessage}
                                onChange={(e) => setGroupMessage(e.target.value)}
                                placeholder="Type a message to all volunteers..."
                                mb={2}
                            />
                            <Button
                                colorScheme="purple"
                                width="full"
                                onClick={handleSendGroupMessage}
                                isDisabled={!groupMessage.trim()}
                            >
                                Send Group Message
                            </Button>
                        </Box>
                    </VStack>
                </DrawerBody>
            </DrawerContent>
        </Drawer>
    );
};

export default VolunteerResponsesDrawer; 