import React, { useState, useEffect } from 'react';
import {
    VStack, Box, Text, Badge, Accordion, AccordionItem, AccordionButton,
    AccordionPanel, AccordionIcon, Avatar, Flex, Tag, Button, Input,
    InputGroup, InputRightElement, useToast
} from '@chakra-ui/react';
import { ChatIcon } from '@chakra-ui/icons';
import { supabase } from '../supabaseClient';

const MessageGroup = ({ messages, opportunity }) => {
    const firstMessage = messages[0];
    
    return (
        <Box mb={4}>
            <Flex align="center" mb={2}>
                <Avatar
                    size="sm"
                    name={opportunity?.organization_name}
                    bg={firstMessage.is_group_message ? "purple.500" : "blue.500"}
                    mr={2}
                />
                <Box>
                    <Text fontWeight="bold">{opportunity?.organization_name}</Text>
                    <Text fontSize="xs" color="gray.500">
                        {new Date(firstMessage.sent_at).toLocaleString()}
                    </Text>
                </Box>
                <Tag
                    size="sm"
                    colorScheme={firstMessage.is_group_message ? "purple" : "blue"}
                    borderRadius="full"
                    ml={2}
                >
                    {firstMessage.is_group_message ? "Group Message" : "Direct Message"}
                </Tag>
            </Flex>

            <VStack
                align="flex-start"
                spacing={2}
                ml="40px"
            >
                {messages.map((message) => (
                    <Box
                        key={message.id}
                        bg={message.is_group_message ? "purple.50" : "blue.50"}
                        p={3}
                        borderRadius="lg"
                        maxW="80%"
                    >
                        <Text>{message.message}</Text>
                        <Text fontSize="xs" color="gray.500" textAlign="right" mt={1}>
                            {new Date(message.sent_at).toLocaleTimeString()}
                        </Text>
                    </Box>
                ))}
            </VStack>
        </Box>
    );
};

const VolunteerMessages = () => {
    const [opportunities, setOpportunities] = useState([]);
    const [messages, setMessages] = useState({});
    const [currentUserId, setCurrentUserId] = useState(null);
    const toast = useToast();

    const fetchMessages = async (opportunityId) => {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: messagesData, error } = await supabase
            .from('messages')
            .select('*')
            .eq('opportunity_id', opportunityId)
            .or(`volunteer_id.eq.${user.id},and(is_group_message.eq.true,volunteer_id.is.null)`)
            .order('sent_at', { ascending: true });

        if (error) {
            console.error('Error fetching messages:', error);
            return [];
        }
        return messagesData || [];
    };

    const handleSendReply = async (originalMessage, replyText) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { error } = await supabase
                .from('messages')
                .insert([{
                    volunteer_id: user.id,
                    organization_id: null,
                    opportunity_id: originalMessage.opportunity_id,
                    message: replyText,
                    is_group_message: false
                }]);

            if (error) throw error;

            const updatedMessages = await fetchMessages(originalMessage.opportunity_id);
            setMessages(prev => ({
                ...prev,
                [originalMessage.opportunity_id]: updatedMessages
            }));

            toast({
                title: "Reply sent",
                status: "success",
                duration: 3000
            });
        } catch (error) {
            toast({
                title: "Error sending reply",
                description: error.message,
                status: "error",
                duration: 5000
            });
        }
    };

    useEffect(() => {
        const setupMessages = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUserId(user.id);

            const { data: responses, error: responsesError } = await supabase
                .from('opportunity_responses')
                .select(`
                    opportunity:opportunity_id (
                        id,
                        title,
                        description,
                        status,
                        organization_id
                    )
                `)
                .eq('volunteer_id', user.id)
                .eq('status', 'accepted');

            if (responsesError) {
                console.error('Error fetching responses:', responsesError);
                return;
            }

            const messagesPromises = responses.map(async (response) => {
                const messagesData = await fetchMessages(response.opportunity.id);
                return [response.opportunity.id, messagesData];
            });

            const messageResults = await Promise.all(messagesPromises);
            const messagesMap = Object.fromEntries(messageResults);
            setMessages(messagesMap);

            const opportunitiesWithOrgs = await Promise.all(
                responses.map(async (response) => {
                    const { data: { user: orgUser } } = await supabase.auth.getUser(
                        response.opportunity.organization_id
                    );
                    return {
                        ...response.opportunity,
                        organization_name: orgUser?.user_metadata?.name || 'Unknown Organization'
                    };
                })
            );

            setOpportunities(opportunitiesWithOrgs);
        };

        setupMessages();

        const subscription = supabase
            .channel('messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages'
            }, async (payload) => {
                const opportunityId = payload.new.opportunity_id;
                const updatedMessages = await fetchMessages(opportunityId);
                setMessages(prev => ({
                    ...prev,
                    [opportunityId]: updatedMessages
                }));
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <VStack spacing={4} align="stretch">
            <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                Messages from Organizations
            </Text>

            <Accordion allowMultiple>
                {opportunities.map((opportunity) => (
                    <AccordionItem
                        key={opportunity.id}
                        border="1px"
                        borderColor="gray.200"
                        borderRadius="md"
                        mb={2}
                    >
                        <AccordionButton py={3} _hover={{ bg: 'gray.50' }}>
                            <Box flex="1" textAlign="left">
                                <Text fontWeight="semibold">
                                    {opportunity.title}
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                    {opportunity.organization_name}
                                </Text>
                            </Box>
                            <Badge
                                colorScheme={opportunity.status === 'archived' ? 'gray' : 'green'}
                                mr={2}
                            >
                                {opportunity.status}
                            </Badge>
                            <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4} px={0}>
                            <VStack spacing={4} align="stretch">
                                {messages[opportunity.id]?.length > 0 ? (
                                    messages[opportunity.id]
                                        .reduce((groups, message) => {
                                            const lastGroup = groups[groups.length - 1];
                                            if (lastGroup &&
                                                lastGroup[0].volunteer_id === message.volunteer_id &&
                                                lastGroup[0].organization_id === message.organization_id &&
                                                lastGroup[0].is_group_message === message.is_group_message) {
                                                lastGroup.push(message);
                                            } else {
                                                groups.push([message]);
                                            }
                                            return groups;
                                        }, [])
                                        .map((messageGroup) => (
                                            <MessageGroup
                                                key={messageGroup[0].id}
                                                messages={messageGroup}
                                                opportunity={opportunity}
                                            />
                                        ))
                                ) : (
                                    <Box
                                        textAlign="center"
                                        py={8}
                                        bg="gray.50"
                                        borderRadius="md"
                                        borderStyle="dashed"
                                        borderWidth="1px"
                                    >
                                        <ChatIcon boxSize={8} color="gray.400" mb={2} />
                                        <Text color="gray.500">
                                            No messages yet for this opportunity
                                        </Text>
                                    </Box>
                                )}
                            </VStack>
                        </AccordionPanel>
                    </AccordionItem>
                ))}
            </Accordion>

            {opportunities.length === 0 && (
                <Box
                    textAlign="center"
                    py={8}
                    bg="gray.50"
                    borderRadius="lg"
                    borderWidth="1px"
                    borderStyle="dashed"
                >
                    <ChatIcon boxSize={10} color="gray.400" mb={3} />
                    <Text color="gray.600" fontSize="lg" fontWeight="medium">
                        No Message History
                    </Text>
                    <Text color="gray.500">
                        Messages will appear here once you've responded to opportunities
                    </Text>
                </Box>
            )}
        </VStack>
    );
};

export default VolunteerMessages;