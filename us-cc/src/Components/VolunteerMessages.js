import React, { useState, useEffect, useRef } from 'react';
import {
    VStack, Box, Text, Accordion, AccordionItem, AccordionButton,
    AccordionPanel, AccordionIcon, Avatar, Flex, Tag, useToast,
    Badge, Button, Input, IconButton, Divider, HStack, Link
} from '@chakra-ui/react';
import { ChatIcon, CheckIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { supabase } from '../supabaseClient';
import { useRealtimeMessages } from '../hooks/useRealtimeMessages';
import { getProfileUsername } from '../Components/ProfileHelpers';
import { Link as RouterLink } from 'react-router-dom';

const MessageBubble = ({ message, isOwn, sender }) => {
    const bubbleStyle = isOwn ? {
        bg: "blue.100",
        alignSelf: "flex-end",
        borderRadius: "20px 20px 5px 20px",
        ml: "20%"  // Add margin to keep messages from stretching too wide
    } : {
        bg: "gray.100",
        alignSelf: "flex-start",
        borderRadius: "20px 20px 20px 5px",
        mr: "20%"  // Add margin to keep messages from stretching too wide
    };

    return (
        <Box
            p={3}
            {...bubbleStyle}
            position="relative"
        >
            {!isOwn && (
                <Text fontSize="xs" fontWeight="bold" color="gray.600" mb={1}>
                    {sender}
                </Text>
            )}
            <Text>{message.message}</Text>
            <Text 
                fontSize="xs" 
                color="gray.500" 
                mt={1}
                textAlign={isOwn ? "right" : "left"}
            >
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

    const markMessagesAsRead = async (messageIds) => {
        console.log('Attempting to mark messages as read:', {
            messageIds,
            currentUser: currentUser?.id
        });
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Insert read status for all messages at once
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
            recipient_id,
            message,
            sent_at,
            is_group_message,
            read_status:message_read_status(
                user_id,
                read_at
            ),
            organization:profiles(organization_name),
            opportunity:volunteer_opportunities(
                id,
                title,
                organization_id,
                status
            )
        `,
        filter: currentUser ? {
            or: `recipient_id.eq.${currentUser.id},is_group_message.eq.true,volunteer_id.eq.${currentUser.id}`
        } : null,
        orderBy: { column: 'sent_at', ascending: true },
        enabled: !!currentUser,
        onSubscription: (message) => {
            console.log('Realtime message received:', message);
        }
    });

    const isMessageUnread = (message) => {
        // Add memoization
        if (!message._isUnreadCache) {
            const result = !message.read_status?.some(status => 
                status.user_id === currentUser?.id
            );
            message._isUnreadCache = {
                result,
                userId: currentUser?.id
            };
            console.log('Checking message read status:', {
                messageId: message.id,
                message: message.message,
                readStatus: message.read_status,
                currentUserId: currentUser?.id,
                isUnread: result
            });
            return result;
        }
        
        // Use cached result if user hasn't changed
        if (message._isUnreadCache.userId === currentUser?.id) {
            return message._isUnreadCache.result;
        }
        
        // Recalculate if user changed
        const result = !message.read_status?.some(status => 
            status.user_id === currentUser?.id
        );
        message._isUnreadCache = {
            result,
            userId: currentUser?.id
        };
        return result;
    };

    useEffect(() => {
        if (!messages || !currentUser) return;

        const processMessages = async () => {
            console.log('Processing messages:', {
                messageCount: messages.length,
                messages: messages.map(m => ({
                    id: m.id,
                    message: m.message,
                    readStatus: m.read_status,
                    isGroupMessage: m.is_group_message
                }))
            });
            try {
                const grouped = messages.reduce((acc, message) => {
                    const oppId = message.opportunity_id;

                    if (!acc[oppId]) {
                        acc[oppId] = {
                            opportunity: {
                                id: message.opportunity_id,
                                title: message.opportunity?.title,
                                organization_id: message.opportunity?.organization_id,
                                status: message.opportunity?.status,
                                organization_name: message.organization?.organization_name || 'Unknown Organization'
                            },
                            messages: []
                        };
                    }

                    acc[oppId].messages.push({
                        ...message,
                        organization_name: message.organization?.organization_name
                    });

                    return acc;
                }, {});

                setOpportunityMessages(grouped);

                // Add detailed logging for unread count calculation
                const totalUnread = Object.values(grouped).reduce((count, { messages: groupMessages }) => {
                    const unreadInThisGroup = groupMessages.filter(m => {
                        const shouldCount = (m.recipient_id === currentUser.id || m.is_group_message) && 
                            isMessageUnread(m);
                        
                        console.log('Checking message for unread count:', {
                            messageId: m.id,
                            message: m.message,
                            isGroupMessage: m.is_group_message,
                            recipientId: m.recipient_id,
                            currentUserId: currentUser.id,
                            isUnread: isMessageUnread(m),
                            shouldCount
                        });
                        
                        return shouldCount;
                    }).length;
                    
                    console.log('Unread in group:', {
                        opportunityId: groupMessages[0]?.opportunity_id,
                        unreadCount: unreadInThisGroup,
                        totalMessages: groupMessages.length
                    });
                    
                    return count + unreadInThisGroup;
                }, 0);

                console.log('Final total unread count:', totalUnread);
                onUnreadCountChange(totalUnread);

            } catch (error) {
                console.error('Error processing messages:', error);
            }
        };

        processMessages();
    }, [messages, currentUser, onUnreadCountChange]);

    const markAllMessagesAsRead = async (opportunityId) => {
        try {
            const messages = opportunityMessages[opportunityId]?.messages || [];
            console.log('All messages for opportunity:', messages);

            // Get IDs of unread messages (both direct and group) for this opportunity
            const unreadMessageIds = messages
                .filter(msg => {
                    const shouldMark = (
                        // Include both direct messages to this user and group messages
                        (msg.recipient_id === currentUser.id || msg.is_group_message) &&
                        isMessageUnread(msg)
                    );

                    console.log('Message filtering:', {
                        id: msg.id,
                        message: msg.message,
                        is_group_message: msg.is_group_message,
                        recipient_id: msg.recipient_id,
                        is_unread: isMessageUnread(msg),
                        shouldMark
                    });

                    return shouldMark;
                })
                .map(msg => msg.id);

            console.log('Unread message IDs:', unreadMessageIds);

            if (unreadMessageIds.length > 0) {
                console.log('Attempting to mark messages as read:', unreadMessageIds);
                await markMessagesAsRead(unreadMessageIds);
            } else {
                console.log('No unread messages to mark as read');
            }

        } catch (error) {
            console.error('Error marking messages as read:', error);
            toast({
                title: "Error marking messages as read",
                description: error.message,
                status: "error",
                duration: 5000
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
                        <Link
                            as={RouterLink}
                            to={`/profile/${getProfileUsername({ organization_name: selectedOpportunity.organization_name })}`}
                            fontSize="sm"
                            color="blue.600"
                            _hover={{ textDecoration: 'underline' }}
                        >
                            {selectedOpportunity.organization_name}
                        </Link>
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
                    // Count both unread direct messages and group messages
                    ((m.recipient_id === currentUser.id) || m.is_group_message) &&
                    isMessageUnread(m)
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
                            // Always try to mark messages as read when opening conversation
                            markAllMessagesAsRead(oppId);
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
                                        <Link
                                            as={RouterLink}
                                            to={`/profile/${getProfileUsername({ organization_name: data.opportunity.organization_name })}`}
                                            fontSize="sm"
                                            color="blue.600"
                                            _hover={{ textDecoration: 'underline' }}
                                        >
                                            {data.opportunity.organization_name}
                                        </Link>
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
