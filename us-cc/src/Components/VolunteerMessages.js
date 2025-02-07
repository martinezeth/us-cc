import React, { useState, useEffect } from 'react';
import {
    VStack, Box, Text, Accordion, AccordionItem, AccordionButton,
    AccordionPanel, AccordionIcon, Avatar, Flex, Tag, useToast,
    Spinner, Badge, Button
} from '@chakra-ui/react';
import { ChatIcon, CheckIcon } from '@chakra-ui/icons';
import { supabase } from '../supabaseClient';
import { useRealtimeMessages } from '../hooks/useRealtimeMessages';

const MessageList = ({ messages }) => {
    // Sort messages in reverse chronological order
    const sortedMessages = [...messages].sort((a, b) =>
        new Date(b.sent_at) - new Date(a.sent_at)
    );

    return (
        <VStack align="flex-start" spacing={2} w="100%">
            {sortedMessages.map((message) => (
                <Box
                    key={message.id}
                    bg={message.is_group_message ? "purple.50" : "blue.50"}
                    p={3}
                    borderRadius="lg"
                    w="100%"
                >
                    <Flex justify="space-between" align="center" mb={1}>
                        <Tag
                            size="sm"
                            colorScheme={message.is_group_message ? "purple" : "blue"}
                            borderRadius="full"
                        >
                            {message.is_group_message ? "Group Message" : "Direct Message"}
                        </Tag>
                        <Text fontSize="xs" color="gray.500">
                            {new Date(message.sent_at).toLocaleString()}
                        </Text>
                    </Flex>
                    <Text>{message.message}</Text>
                </Box>
            ))}
        </VStack>
    );
};

const VolunteerMessages = ({ onUnreadCountChange }) => {
    const [opportunityMessages, setOpportunityMessages] = useState({});
    const [currentUser, setCurrentUser] = useState(null);
    const toast = useToast();

    // Get current user on component mount
    useEffect(() => {
        const getCurrentUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
        };
        getCurrentUser();
    }, []);

    // Only set up real-time messages once we have the current user
    const { messages, loading, error, refreshMessages } = useRealtimeMessages({
        table: 'messages',
        select: `
            *,
            opportunity:volunteer_opportunities (
                id,
                title,
                organization_id,
                status
            ),
            read_receipts:message_read_receipts!message_id (
                volunteer_id,
                read_at
            )
        `,
        filter: currentUser ? {
            volunteer_id: currentUser.id,
        } : null,
        orderBy: { column: 'sent_at', ascending: false },
        enabled: !!currentUser
    });

    const fetchMessages = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // First get the opportunities this volunteer has responded to
            const { data: responses } = await supabase
                .from('opportunity_responses')
                .select('opportunity_id')
                .eq('volunteer_id', user.id)
                .eq('status', 'accepted');

            // Get the opportunity IDs the volunteer has access to
            const accessibleOpportunityIds = responses?.map(r => r.opportunity_id) || [];

            // Get messages with opportunity data and read receipts
            const { data: messagesData, error: messagesError } = await supabase
                .from('messages')
                .select(`
                    *,
                    opportunity:volunteer_opportunities (
                        id,
                        title,
                        organization_id,
                        status
                    ),
                    read_receipts:message_read_receipts!message_id (
                        volunteer_id,
                        read_at
                    )
                `)
                .or(
                    `and(volunteer_id.eq.${user.id},is_group_message.eq.false),` +
                    `and(is_group_message.eq.true,opportunity_id.in.(${accessibleOpportunityIds.join(',')}))`
                )
                .order('sent_at', { ascending: false });

            if (messagesError) throw messagesError;

            // Get unique organization IDs
            const orgIds = [...new Set(messagesData
                .map(msg => msg.opportunity?.organization_id)
                .filter(Boolean))];

            // Fetch organization profiles
            const { data: orgProfiles } = await supabase
                .from('profiles')
                .select('id, organization_name, full_name')
                .in('id', orgIds);

            // Create a lookup map for org names
            const orgNameMap = {};
            orgProfiles?.forEach(profile => {
                orgNameMap[profile.id] = profile.organization_name || profile.full_name;
            });

            // Group messages by opportunity
            const grouped = messagesData.reduce((acc, message) => {
                const oppId = message.opportunity_id;
                if (!acc[oppId]) {
                    acc[oppId] = {
                        opportunity: {
                            ...message.opportunity,
                            organization_name: orgNameMap[message.opportunity?.organization_id] || 'Unknown Organization'
                        },
                        messages: []
                    };
                }

                // Check if message is read
                const isRead = message.volunteer_id === user.id ?
                    message.is_read :
                    message.read_receipts?.some(receipt =>
                        receipt.volunteer_id === user.id
                    );

                acc[oppId].messages.push({
                    ...message,
                    is_read: isRead
                });
                return acc;
            }, {});

            setOpportunityMessages(grouped);

            // Calculate and update unread count
            const totalUnread = Object.values(grouped).reduce((count, { messages }) =>
                count + messages.filter(m => !m.is_read).length
                , 0);
            onUnreadCountChange?.(totalUnread);

        } catch (error) {
            console.error('Error in fetchMessages:', error);
            toast({
                title: "Error fetching messages",
                description: error.message,
                status: "error",
                duration: 5000
            });
        }
    };

    const markMessageAsRead = async (messageId) => {
        try {
            const { error } = await supabase
                .from('messages')
                .update({ is_read: true })
                .eq('id', messageId);

            if (error) throw error;

            // Update local state
            setOpportunityMessages(prev => {
                const updated = { ...prev };
                Object.keys(updated).forEach(oppId => {
                    updated[oppId].messages = updated[oppId].messages.map(msg =>
                        msg.id === messageId ? { ...msg, is_read: true } : msg
                    );
                });
                return updated;
            });
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    };

    const markAllMessagesAsRead = async (opportunityId) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Get all unread messages for this opportunity
            const messages = opportunityMessages[opportunityId]?.messages || [];
            const unreadMessages = messages.filter(msg => !msg.is_read);

            if (unreadMessages.length === 0) {
                toast({
                    title: "No unread messages",
                    status: "info",
                    duration: 2000
                });
                return;
            }

            // Handle group messages
            const groupMessages = unreadMessages.filter(msg => !msg.volunteer_id);
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
            const directMessages = unreadMessages.filter(msg => msg.volunteer_id === user.id);
            if (directMessages.length > 0) {
                const { error } = await supabase
                    .from('messages')
                    .update({ is_read: true })
                    .in('id', directMessages.map(msg => msg.id));

                if (error) throw error;
            }

            // Refresh messages
            await fetchMessages();

            toast({
                title: `${unreadMessages.length} messages marked as read`,
                status: "success",
                duration: 2000
            });

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

    const fetchUserMetadata = async () => {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) throw error;
            return user.user_metadata;
        } catch (error) {
            console.error('Error fetching user metadata:', error);
            return null;
        }
    };

    useEffect(() => {
        fetchMessages();

        // Set up real-time subscription for new messages
        const subscription = supabase
            .channel('messages_changes')
            .on('postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'messages'
                },
                (payload) => {
                    console.log('New message received:', payload);
                    fetchMessages(); // Refresh messages when changes occur
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Calculate total unread messages and notify parent component (for the 'Messages' tab display)
    useEffect(() => {
        const calculateUnreadCount = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                const unreadCount = Object.values(opportunityMessages).reduce(
                    (total, { messages }) =>
                        total + messages.filter(m =>
                            !m.is_read && (m.volunteer_id === null || m.volunteer_id === user.id)
                        ).length,
                    0
                );
                onUnreadCountChange?.(unreadCount);
            } catch (error) {
                console.error('Error calculating unread count:', error);
            }
        };

        calculateUnreadCount();
    }, [opportunityMessages, onUnreadCountChange]);

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
            </Box>
        );
    }

    // Sort opportunities by most recent message
    const sortedOpportunities = Object.entries(opportunityMessages)
        .sort(([, a], [, b]) => {
            const latestA = Math.max(...a.messages.map(m => new Date(m.sent_at)));
            const latestB = Math.max(...b.messages.map(m => new Date(m.sent_at)));
            return latestB - latestA;
        });

    return (
        <Accordion allowMultiple defaultIndex={[0]} w="100%">
            {sortedOpportunities.map(([oppId, data]) => {
                const unreadCount = data.messages.filter(m => !m.is_read).length;

                return (
                    <AccordionItem key={oppId}>
                        <AccordionButton>
                            <Box flex="1">
                                <Flex align="center" justify="space-between">
                                    <Flex align="center">
                                        <Avatar
                                            size="sm"
                                            name={data.opportunity.organization_name}
                                            mr={2}
                                        />
                                        <Box textAlign="left">
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
                                    <Flex align="center">
                                        <Badge
                                            colorScheme={data.opportunity.status === 'archived' ? 'gray' : 'green'}
                                            mr={2}
                                        >
                                            {data.opportunity.status}
                                        </Badge>
                                        <Badge colorScheme="blue">
                                            {data.messages.length} messages
                                        </Badge>
                                    </Flex>
                                </Flex>
                            </Box>
                            <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                            <Flex justify="flex-end" mb={2}>
                                <Button
                                    size="sm"
                                    leftIcon={<CheckIcon />}
                                    colorScheme="blue"
                                    variant="outline"
                                    onClick={() => markAllMessagesAsRead(oppId)}
                                    isDisabled={!data.messages.some(msg => !msg.is_read)}
                                >
                                    Mark as Read
                                </Button>
                            </Flex>
                            <MessageList messages={data.messages} />
                        </AccordionPanel>
                    </AccordionItem>

                );
            })}
        </Accordion>
    );
};

export default VolunteerMessages;