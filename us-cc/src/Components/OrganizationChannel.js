import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    VStack,
    HStack,
    Input,
    Button,
    Text,
    Avatar,
    Divider,
    Select,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    useToast,
    Flex,
    Badge,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Textarea,
    Portal
} from '@chakra-ui/react';
import { AttachmentIcon, AddIcon, ChatIcon } from '@chakra-ui/icons';
import { supabase } from '../supabaseClient';
import VerifiedBadge from './VerifiedBadge';

// Reuse the message display component pattern from VolunteerMessages
const MessageDisplay = ({ message, currentOrganization }) => {
    const isOwnMessage = message.organization_id === currentOrganization;

    return (
        <Box
            bg={isOwnMessage ? "blue.50" : "gray.50"}
            p={3}
            borderRadius="lg"
            maxW="80%"
            alignSelf={isOwnMessage ? "flex-end" : "flex-start"}
        >
            <HStack spacing={2} mb={1}>
                <Avatar
                    size="sm"
                    name={message.organization?.organization_name}
                />
                <VStack align="start" spacing={0}>
                    <HStack>
                        <Text fontWeight="bold" fontSize="sm">
                            {message.organization?.organization_name}
                        </Text>
                        <VerifiedBadge size="12px" />
                    </HStack>
                    <Text fontSize="xs" color="gray.500">
                        {new Date(message.created_at).toLocaleString()}
                    </Text>
                </VStack>
            </HStack>
            <Text mt={2}>{message.content}</Text>
            {message.attachment_url && (
                <Button
                    size="sm"
                    leftIcon={<AttachmentIcon />}
                    variant="ghost"
                    mt={2}
                    onClick={() => window.open(message.attachment_url)}
                >
                    View Attachment
                </Button>
            )}
        </Box>
    );
};

const OrganizationChannel = ({ majorIncidentId, channelId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [channels, setChannels] = useState([]);
    const [currentChannel, setCurrentChannel] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [isCreatingChannel, setIsCreatingChannel] = useState(false);
    const [newChannelName, setNewChannelName] = useState('');
    const messageEndRef = useRef(null);
    const toast = useToast();
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const getCurrentUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
        };
        getCurrentUser();
        fetchChannels();
        fetchParticipants();
    }, [majorIncidentId]);

    // Update the useEffect for real-time subscription
    useEffect(() => {
        if (!currentChannel) return;

        // Fetch initial messages
        fetchMessages(currentChannel);

        // Create a channel for both broadcast and postgres changes
        const channel = supabase.channel(`room_${currentChannel}`, {
            config: {
                broadcast: { self: true },
                presence: { key: currentUser?.id },
            },
        });

        // Handle broadcast messages
        channel
            .on('broadcast', { event: 'new_message' }, ({ payload }) => {
                console.log('Received broadcast message:', payload);
                // Update messages immediately for better real-time feel
                setMessages(prev => [...prev, payload.message]);
                setTimeout(() => {
                    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            })
            // Handle postgres changes as backup
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'coordination_messages',
                    filter: `channel_id=eq.${currentChannel}`
                },
                async (payload) => {
                    console.log('Received postgres change:', payload);
                    // Refresh messages to ensure consistency
                    const { data, error } = await supabase
                        .from('coordination_messages')
                        .select(`
                            *,
                            organization:profiles(id, organization_name)
                        `)
                        .eq('channel_id', currentChannel)
                        .order('created_at', { ascending: true });

                    if (!error && data) {
                        setMessages(data);
                    }
                }
            )
            .subscribe(async (status) => {
                console.log(`Channel status:`, status);
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        user: currentUser?.id,
                        online_at: new Date().toISOString(),
                    });
                }
            });

        return () => {
            channel.unsubscribe();
            supabase.removeChannel(channel);
        };
    }, [currentChannel, currentUser]);

    // Add this useEffect to handle channel changes
    useEffect(() => {
        if (channelId && !currentChannel) {
            setCurrentChannel(channelId);
        }
    }, [channelId, currentChannel]);

    const fetchChannels = async () => {
        try {
            const { data, error } = await supabase
                .from('coordination_channels')
                .select('*')
                .eq('major_incident_id', majorIncidentId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setChannels(data || []);
            if (data?.length > 0 && !currentChannel) {
                setCurrentChannel(data[0].id);
            }
        } catch (error) {
            console.error('Error fetching channels:', error);
        }
    };

    const fetchParticipants = async () => {
        try {
            const { data, error } = await supabase
                .from('major_incident_organizations')
                .select(`
                    *,
                    organization:profiles(id, organization_name)
                `)
                .eq('major_incident_id', majorIncidentId);

            if (error) throw error;
            setParticipants(data || []);
        } catch (error) {
            console.error('Error fetching participants:', error);
        }
    };

    const fetchMessages = async (channelId) => {
        try {
            setMessages([]); // Clear messages when switching channels
            const { data, error } = await supabase
                .from('coordination_messages')
                .select(`
                    *,
                    organization:profiles(id, organization_name)
                `)
                .eq('channel_id', channelId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMessages(data || []);
            scrollToBottom();
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    // Update sendMessage function to use broadcast
    const sendMessage = async (messageContent) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            const newMessage = {
                channel_id: currentChannel,
                organization_id: user.id,
                content: messageContent,
                created_at: new Date().toISOString()
            };

            // First, insert the message into the database
            const { data, error } = await supabase
                .from('coordination_messages')
                .insert([newMessage])
                .select(`
                    *,
                    organization:profiles(id, organization_name)
                `)
                .single();

            if (error) throw error;

            // Then broadcast the message to all clients
            const channel = supabase.channel(`room_${currentChannel}`);
            await channel.send({
                type: 'broadcast',
                event: 'new_message',
                payload: { message: data }
            });

            setNewMessage(''); // Clear input field
            
        } catch (error) {
            toast({
                title: "Error sending message",
                description: error.message,
                status: "error",
                duration: 5000
            });
        }
    };

    const handleCreateChannel = async () => {
        if (!newChannelName.trim()) return;

        try {
            const { error } = await supabase
                .from('coordination_channels')
                .insert([{
                    major_incident_id: majorIncidentId,
                    name: newChannelName,
                    description: `Coordination channel for ${newChannelName}`,
                    channel_type: 'custom'
                }]);

            if (error) throw error;
            setNewChannelName('');
            setIsCreatingChannel(false);
            fetchChannels();
            toast({
                title: "Channel created",
                status: "success",
                duration: 2000
            });
        } catch (error) {
            toast({
                title: "Error creating channel",
                description: error.message,
                status: "error",
                duration: 3000
            });
        }
    };

    return (
        <Box h="full" display="flex" flexDirection="column">
            {/* Channel Header */}
            <HStack p={4} bg="gray.50" borderBottom="1px" borderColor="gray.200" spacing={4}>
                <Select
                    value={currentChannel || ''}
                    onChange={(e) => setCurrentChannel(e.target.value)}
                    maxW="200px"
                >
                    {channels.map(channel => (
                        <option key={channel.id} value={channel.id}>
                            {channel.name}
                        </option>
                    ))}
                </Select>
                <Button
                    leftIcon={<AddIcon />}
                    size="sm"
                    onClick={() => setIsCreatingChannel(true)}
                >
                    New Channel
                </Button>
            </HStack>

            {/* Messages Area */}
            <Box flex="1" overflowY="auto" p={4}>
                <VStack spacing={4} align="stretch">
                    {messages.map((message) => (
                        <MessageDisplay
                            key={message.id}
                            message={message}
                            currentOrganization={currentUser?.id}
                        />
                    ))}
                    <div ref={messageEndRef} />
                </VStack>
            </Box>

            {/* Message Input */}
            <Box p={4} borderTop="1px" borderColor="gray.200">
                <HStack spacing={2}>
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage(newMessage);
                            }
                        }}
                    />
                    <IconButton
                        icon={<AttachmentIcon />}
                        aria-label="Add attachment"
                    />
                    <Button
                        colorScheme="blue"
                        onClick={() => sendMessage(newMessage)}
                        isDisabled={!newMessage.trim()}
                    >
                        Send
                    </Button>
                </HStack>
            </Box>

            {/* Create Channel Modal - Reuse Modal pattern from VolunteerMessages */}
            <Portal>
                <Menu
                    isOpen={isCreatingChannel}
                    onClose={() => setIsCreatingChannel(false)}
                >
                    <MenuList p={4}>
                        <VStack spacing={4}>
                            <Text fontWeight="bold">Create New Channel</Text>
                            <Input
                                value={newChannelName}
                                onChange={(e) => setNewChannelName(e.target.value)}
                                placeholder="Channel name"
                            />
                            <HStack spacing={2}>
                                <Button
                                    size="sm"
                                    onClick={() => setIsCreatingChannel(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    colorScheme="blue"
                                    onClick={handleCreateChannel}
                                    isDisabled={!newChannelName.trim()}
                                >
                                    Create
                                </Button>
                            </HStack>
                        </VStack>
                    </MenuList>
                </Menu>
            </Portal>
        </Box>
    );
};

export default OrganizationChannel;