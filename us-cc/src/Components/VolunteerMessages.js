import React, { useState, useEffect } from 'react';
import {
    VStack, Box, Text, Accordion, AccordionItem, AccordionButton,
    AccordionPanel, AccordionIcon, Avatar, Flex, Tag, useToast, 
    Spinner, Badge, Button
} from '@chakra-ui/react';
import { ChatIcon, CheckIcon } from '@chakra-ui/icons';
import { supabase } from '../supabaseClient';

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
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    const markMessagesAsRead = async (oppId) => {
        try {
            const unreadMessageIds = opportunityMessages[oppId].messages
                .filter(msg => !msg.is_read)
                .map(msg => msg.id);

            if (unreadMessageIds.length === 0) return;

            const { error } = await supabase
                .from('messages')
                .update({ is_read: true })
                .in('id', unreadMessageIds);

            if (error) throw error;

            // Update local state
            setOpportunityMessages(prev => ({
                ...prev,
                [oppId]: {
                    ...prev[oppId],
                    messages: prev[oppId].messages.map(msg => ({
                        ...msg,
                        is_read: true
                    }))
                }
            }));

            toast({
                title: "Messages marked as read",
                status: "success",
                duration: 2000,
            });
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

    const fetchMessages = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            const { data: messagesData, error: messagesError } = await supabase
                .from('messages')
                .select(`
                    *,
                    opportunity:volunteer_opportunities!opportunity_id (
                        id,
                        title,
                        organization_id,
                        status
                    )
                `)
                .or(`volunteer_id.eq.${user.id},and(is_group_message.eq.true,volunteer_id.is.null)`)
                .order('sent_at', { ascending: true });

            if (messagesError) throw messagesError;

            // Fetch organization names for the opportunities
            const orgIds = [...new Set(messagesData.map(msg => msg.opportunity.organization_id))];
            const orgNames = {};
            
            for (const orgId of orgIds) {
                const { data: { user: orgUser } } = await supabase.auth.getUser(orgId);
                orgNames[orgId] = orgUser?.user_metadata?.name || 'Unknown Organization';
            }

            // Group messages by opportunity
            const grouped = messagesData.reduce((acc, message) => {
                const oppId = message.opportunity_id;
                if (!acc[oppId]) {
                    acc[oppId] = {
                        opportunity: {
                            ...message.opportunity,
                            organization_name: orgNames[message.opportunity.organization_id]
                        },
                        messages: []
                    };
                }
                acc[oppId].messages.push(message);
                return acc;
            }, {});

            setOpportunityMessages(grouped);
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast({
                title: "Error loading messages",
                description: error.message,
                status: "error",
                duration: 5000
            });
        } finally {
            setLoading(false);
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

    // Calculate total unread messages and notify parent component
    useEffect(() => {
        const unreadCount = Object.values(opportunityMessages).reduce(
            (total, { messages }) => 
                total + messages.filter(m => !m.is_read).length,
            0
        );
        onUnreadCountChange?.(unreadCount);
    }, [opportunityMessages, onUnreadCountChange]);

    if (loading) {
        return (
            <Box textAlign="center" py={10}>
                <Spinner />
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
                                    onClick={() => markMessagesAsRead(oppId)}
                                    isDisabled={unreadCount === 0}
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