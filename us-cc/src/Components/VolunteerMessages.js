import React, { useState, useEffect, useRef } from 'react';
import {
    VStack, Box, Text, Accordion, AccordionItem, AccordionButton,
    AccordionPanel, AccordionIcon, Avatar, Flex, Tag, useToast,
    Badge, Button, Input, IconButton, Divider, HStack
} from '@chakra-ui/react';
import { ChatIcon, CheckIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { supabase } from '../supabaseClient';
import { useRealtimeMessages } from '../hooks/useRealtimeMessages';

const MessageBubble = ({ message, isOwn, sender }) => {
    const bubbleStyle = isOwn ? {
        bg: "blue.100",
        alignSelf: "flex-end",
        borderRadius: "20px 20px 5px 20px"
    } : {
        bg: "gray.100",
        alignSelf: "flex-start",
        borderRadius: "20px 20px 20px 5px"
    };

    return (

        <Box
            maxW="70%"
            p={3}
            {...bubbleStyle}
        >
            {!isOwn && (
                <Text fontSize="xs" fontWeight="bold" color="gray.600" mb={1}>
                    {sender}
                </Text>
            )}
            <Text>{message.message}</Text>
            <Text fontSize="xs" color="gray.500" textAlign="right" mt={1}>
                {new Date(message.sent_at).toLocaleString()}
            </Text>
        </Box>
    );
};

const ConversationView = ({ messages, currentUserId, onSendReply, opportunity }) => {
    const [replyText, setReplyText] = useState('');
    const messagesEndRef = useRef(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const scrollContainerRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isAtBottom) {
            scrollToBottom();
        }
    }, [messages]);

    const handleScroll = (e) => {
        const { scrollHeight, scrollTop, clientHeight } = e.target;
        const bottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 1;
        setIsAtBottom(bottom);
    };

    const handleSendMessage = () => {
        if (replyText.trim()) {
            onSendReply(null, replyText); // null because it's a new message, not a reply
            setReplyText('');
            setIsAtBottom(true);
        }
    };

    return (
        <VStack h="full" spacing={4}>
            <Box
                flex={1}
                w="full"
                overflowY="auto"
                p={4}
                ref={scrollContainerRef}
                onScroll={handleScroll}
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
                <VStack spacing={4} align="stretch">
                    {messages.map((message) => (
                        <MessageBubble
                            key={message.id}
                            message={message}
                            isOwn={message.volunteer_id === currentUserId}
                            sender={message.is_group_message ? 'Group Message' : opportunity.organization_name}
                        />
                    ))}
                    <div ref={messagesEndRef} />
                </VStack>
            </Box>

            <Box p={4} borderTop="1px" borderColor="gray.200" w="full">
                <HStack>
                    <Input
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your message..."
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                    />
                    <IconButton
                        icon={<ArrowForwardIcon />}
                        colorScheme="blue"
                        onClick={handleSendMessage}
                        isDisabled={!replyText.trim()}
                    />
                </HStack>
            </Box>
        </VStack>
    );
};

const VolunteerMessages = ({ onUnreadCountChange }) => {
    const [opportunityMessages, setOpportunityMessages] = useState({});
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedOpportunity, setSelectedOpportunity] = useState(null);
    const toast = useToast();
    const [accessibleOpportunityIds, setAccessibleOpportunityIds] = useState([]);

    useEffect(() => {
        const getCurrentUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
        };
        getCurrentUser();
    }, []);

    useEffect(() => {
        const fetchAccessibleOpportunities = async () => {
            if (!currentUser) return;

            try {
                const { data: responses, error } = await supabase
                    .from('opportunity_responses')
                    .select('opportunity_id')
                    .eq('volunteer_id', currentUser.id);

                if (error) throw error;

                const opportunityIds = responses?.map(r => r.opportunity_id) || [];
                setAccessibleOpportunityIds(opportunityIds);
            } catch (error) {
                console.error('Error fetching accessible opportunities:', error);
            }
        };

        fetchAccessibleOpportunities();
    }, [currentUser]);

    const handleSendReply = async (_, replyText) => {
        if (!selectedOpportunity) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();

            // First insert the message
            const { data: newMessage, error } = await supabase
                .from('messages')
                .insert([{
                    opportunity_id: selectedOpportunity.id,
                    volunteer_id: user.id,
                    organization_id: selectedOpportunity.organization_id,
                    message: replyText,
                    is_group_message: false
                }])
                .select(`
                    *,
                    organization:profiles(id, organization_name),
                    opportunity:volunteer_opportunities(
                        id,
                        title,
                        organization_id,
                        status
                    )
                `)
                .single();

            if (error) throw error;

            // Then broadcast it
            const channel = supabase.channel(`messages_${selectedOpportunity.id}`);
            await channel.send({
                type: 'broadcast',
                event: 'new_message',
                payload: { message: newMessage }
            });

        } catch (error) {
            console.error('Error sending message:', error);
            toast({
                title: "Error sending message",
                description: error.message,
                status: "error",
                duration: 5000
            });
        }
    };

    const { messages, loading, error, refreshMessages } = useRealtimeMessages({
        table: 'messages',
        select: `
            id,
            opportunity_id,
            organization_id,
            volunteer_id,
            message,
            sent_at,
            is_group_message,
            is_read,
            organization:profiles(organization_name),
            opportunity:volunteer_opportunities(
                id,
                title,
                organization_id,
                status
            )
        `,
        filter: currentUser && accessibleOpportunityIds.length > 0 ? {
            or: `volunteer_id.eq.${currentUser.id},and(is_group_message.eq.true,opportunity_id.in.(${accessibleOpportunityIds.join(',')}))`
        } : null,
        orderBy: { column: 'sent_at', ascending: true },
        enabled: !!currentUser && accessibleOpportunityIds.length > 0
    });

    useEffect(() => {
        if (!messages || !currentUser) return;

        const processMessages = async () => {
            try {
                const orgIds = [...new Set(messages.map(m => m.organization_id))];
                const { data: orgs } = await supabase
                    .from('profiles')
                    .select('id, organization_name')
                    .in('id', orgIds);

                const orgNameMap = Object.fromEntries(
                    orgs?.map(org => [org.id, org.organization_name]) || []
                );

                const grouped = messages.reduce((acc, message) => {
                    const oppId = message.opportunity_id;

                    if (!acc[oppId]) {
                        acc[oppId] = {
                            opportunity: {
                                id: message.opportunity_id,
                                title: message.opportunity_title,
                                organization_id: message.opportunity_organization_id,
                                status: message.opportunity_status,
                                organization_name: orgNameMap[message.opportunity_organization_id] || 'Unknown Organization'
                            },
                            messages: []
                        };
                    }

                    acc[oppId].messages.push({
                        ...message,
                        organization_name: orgNameMap[message.organization_id]
                    });

                    return acc;
                }, {});

                setOpportunityMessages(grouped);

                // Only count unread messages from organizations
                const totalUnread = Object.values(grouped).reduce((count, { messages }) =>
                    count + messages.filter(m =>
                        !m.is_read &&
                        m.organization_id &&
                        !m.volunteer_id &&
                        m.volunteer_id !== currentUser.id
                    ).length, 0);

                onUnreadCountChange?.(totalUnread);

            } catch (error) {
                console.error('Error processing messages:', error);
                toast({
                    title: "Error processing messages",
                    status: "error",
                    duration: 5000
                });
            }
        };

        processMessages();
    }, [messages, currentUser]);

    const markAllMessagesAsRead = async (opportunityId) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const messages = opportunityMessages[opportunityId]?.messages || [];

            // Only mark messages from organizations as read
            const unreadMessages = messages.filter(msg =>
                !msg.is_read &&
                msg.organization_id &&
                !msg.volunteer_id
            );

            if (unreadMessages.length === 0) {
                return;
            }

            // Handle group messages
            const groupMessages = unreadMessages.filter(msg => msg.is_group_message);
            if (groupMessages.length > 0) {
                const { error: receiptError } = await supabase
                    .from('message_read_receipts')
                    .upsert(
                        groupMessages.map(msg => ({
                            message_id: msg.id,
                            volunteer_id: user.id,
                            read_at: new Date().toISOString()
                        }))
                    );

                if (receiptError) throw receiptError;
            }

            // Handle direct messages
            const directMessages = unreadMessages.filter(msg => !msg.is_group_message);
            if (directMessages.length > 0) {
                const { error } = await supabase
                    .from('messages')
                    .update({ is_read: true })
                    .in('id', directMessages.map(msg => msg.id));

                if (error) throw error;
            }

            await refreshMessages();

        } catch (error) {
            console.error('Error marking messages as read:', error);
            toast({
                title: "Error marking messages as read",
                description: error.message,
                status: "error",
                duration: 3000
            });
        }
    };

    if (loading || !currentUser) {
        return (
            <Box p={4}>
                <Text>Loading messages...</Text>
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={4}>
                <Text color="red.500">Error loading messages: {error.message}</Text>
            </Box>
        );
    }

    if (Object.keys(opportunityMessages).length === 0) {
        return (
            <Box textAlign="center" py={8}>
                <ChatIcon boxSize={8} color="gray.400" mb={2} />
                <Text color="gray.500">No messages yet</Text>
                <Text fontSize="sm" color="gray.400" mt={2}>
                    Messages will appear here for opportunities you've responded to
                </Text>
            </Box>
        );
    }

    const sortedOpportunities = Object.entries(opportunityMessages)
        .sort(([, a], [, b]) => {
            const latestA = Math.max(...a.messages.map(m => new Date(m.sent_at)));
            const latestB = Math.max(...b.messages.map(m => new Date(m.sent_at)));
            return latestB - latestA;
        });

    if (selectedOpportunity) {
        const currentOpportunityMessages = opportunityMessages[selectedOpportunity.id]?.messages || [];

        return (
            <Box h="full" display="flex" flexDirection="column">
                <Flex
                    p={4}
                    bg="gray.50"
                    align="center"
                    borderBottom="1px"
                    borderColor="gray.200"
                >
                    <IconButton
                        icon={<ArrowForwardIcon transform="rotate(180deg)" />}
                        variant="ghost"
                        onClick={() => setSelectedOpportunity(null)}
                        mr={4}
                    />
                    <Box flex={1}>
                        <Text fontWeight="bold">{selectedOpportunity.title}</Text>
                        <Text fontSize="sm" color="gray.600">
                            {selectedOpportunity.organization_name}
                        </Text>
                    </Box>
                </Flex>
                <Box flex={1} h="0">
                    <ConversationView
                        messages={currentOpportunityMessages}
                        currentUserId={currentUser.id}
                        onSendReply={handleSendReply}
                        opportunity={selectedOpportunity}
                    />
                </Box>
            </Box>
        );
    }

    return (
        <VStack spacing={4} align="stretch" h="full">
            {sortedOpportunities.map(([oppId, data]) => {
                const unreadCount = data.messages.filter(m =>
                    !m.is_read &&
                    m.organization_id &&
                    !m.volunteer_id &&
                    m.volunteer_id !== currentUser.id
                ).length;

                const lastMessage = data.messages[data.messages.length - 1];
                const lastMessagePreview = lastMessage ?
                    (lastMessage.is_group_message ? '🔔 ' : '') + lastMessage.message :
                    'No messages';

                return (
                    <Box
                        key={oppId}
                        p={4}
                        bg="white"
                        borderRadius="lg"
                        shadow="sm"
                        cursor="pointer"
                        onClick={() => {
                            setSelectedOpportunity({
                                id: oppId,
                                ...data.opportunity
                            });
                            if (unreadCount > 0) {
                                markAllMessagesAsRead(oppId);
                            }
                        }}
                        _hover={{ bg: "gray.50" }}
                        borderWidth="1px"
                        borderColor="gray.200"
                    >
                        <Flex justify="space-between" align="center">
                            <Box flex={1}>
                                <Flex align="center" mb={1}>
                                    <Avatar
                                        size="sm"
                                        name={data.opportunity.organization_name}
                                        mr={2}
                                    />
                                    <Box>
                                        <Flex align="center">
                                            <Text fontWeight="bold">
                                                {data.opportunity.title}
                                            </Text>
                                            {unreadCount > 0 && (
                                                <Badge
                                                    ml={2}
                                                    colorScheme="red"
                                                    borderRadius="full"
                                                >
                                                    {unreadCount} new
                                                </Badge>
                                            )}
                                        </Flex>
                                        <Text fontSize="sm" color="gray.600">
                                            {data.opportunity.organization_name}
                                        </Text>
                                    </Box>
                                </Flex>
                                <Text
                                    fontSize="sm"
                                    color="gray.500"
                                    noOfLines={1}
                                    mt={2}
                                >
                                    {lastMessagePreview}
                                </Text>
                            </Box>
                            <Text fontSize="xs" color="gray.500" ml={4}>
                                {lastMessage ? new Date(lastMessage.sent_at).toLocaleString() : ''}
                            </Text>
                        </Flex>
                    </Box>
                );
            })}
        </VStack>
    );
};

export default VolunteerMessages;
