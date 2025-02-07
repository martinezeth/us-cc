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
    Portal,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    FormControl,
    FormLabel,
    FormHelperText,
    CheckboxGroup,
    Checkbox,
    Tooltip
} from '@chakra-ui/react';
import { AddIcon, AttachmentIcon, EditIcon } from '@chakra-ui/icons';
import { supabase } from '../supabaseClient';
import VerifiedBadge from './VerifiedBadge';
import { useNavigate } from 'react-router-dom';
import { getProfileUsername } from '../Components/ProfileHelpers';
import { handleProfileClick } from '../utils/navigationHelpers';
import { BsThreeDotsVertical } from 'react-icons/bs';

// Reuse the message display component pattern from VolunteerMessages
const MessageDisplay = ({ message, currentOrganization }) => {
    const navigate = useNavigate();
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
                    cursor="pointer"
                    onClick={(e) => handleProfileClick(e, message.organization, navigate)}
                />
                <VStack align="start" spacing={0}>
                    <HStack>
                        <Text
                            fontWeight="bold"
                            fontSize="sm"
                            cursor="pointer"
                            color="blue.500"
                            _hover={{ textDecoration: 'underline' }}
                            onClick={(e) => handleProfileClick(e, message.organization, navigate)}
                        >
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
    const [selectedOrgs, setSelectedOrgs] = useState([]);
    const [formData, setFormData] = useState({ description: '' });
    const [channelMembers, setChannelMembers] = useState({});
    const [isManagingChannel, setIsManagingChannel] = useState(false);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [isEditingChannel, setIsEditingChannel] = useState(false);
    const [editChannelForm, setEditChannelForm] = useState({
        name: '',
        description: ''
    });

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

        // Handle broadcast messages with Supabase Realtime
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

    //  useEffect to handle channel changes
    useEffect(() => {
        if (channelId && !currentChannel) {
            setCurrentChannel(channelId);
        }
    }, [channelId, currentChannel]);

    const fetchChannels = async () => {
        try {
            const { data, error } = await supabase
                .from('coordination_channels')
                .select(`
                    *,
                    creator:profiles!created_by(id, organization_name)
                `)
                .eq('major_incident_id', majorIncidentId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setChannels(data || []);
            if (data?.length > 0 && !currentChannel) {
                setCurrentChannel(data[0].id);
                // Fetch members for the first channel
                fetchChannelMembers(data[0].id);
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

    const fetchChannelMembers = async (channelId) => {
        try {
            const { data, error } = await supabase
                .from('channel_members')
                .select(`
                    *,
                    organization:profiles(id, organization_name)
                `)
                .eq('channel_id', channelId);

            if (error) throw error;
            
            const membersMap = {};
            data.forEach(member => {
                membersMap[member.organization_id] = member;
            });
            setChannelMembers(prev => ({...prev, [channelId]: membersMap}));
        } catch (error) {
            console.error('Error fetching channel members:', error);
        }
    };

    const handleCreateChannel = async () => {
        if (!newChannelName.trim()) return;

        try {
            // Start a Supabase transaction
            const { data: { user } } = await supabase.auth.getUser();
            
            // Create the channel
            const { data: channel, error: channelError } = await supabase
                .from('coordination_channels')
                .insert([{
                    major_incident_id: majorIncidentId,
                    name: newChannelName,
                    description: formData.description || `Coordination channel for ${newChannelName}`,
                    channel_type: 'custom',
                    created_by: user.id
                }])
                .select()
                .single();

            if (channelError) throw channelError;

            // Add creator as owner
            const { error: ownerError } = await supabase
                .from('channel_members')
                .insert([{
                    channel_id: channel.id,
                    organization_id: user.id,
                    role: 'owner'
                }]);

            if (ownerError) throw ownerError;

            // Add selected organizations as members (excluding the creator)
            if (selectedOrgs.length > 0) {
                const memberInserts = selectedOrgs
                    .filter(orgId => orgId !== user.id) // Exclude creator who is already owner
                    .map(orgId => ({
                        channel_id: channel.id,
                        organization_id: orgId,
                        role: 'member'
                    }));

                if (memberInserts.length > 0) {
                    const { error: membersError } = await supabase
                        .from('channel_members')
                        .insert(memberInserts);

                    if (membersError) throw membersError;
                }
            }

            // Reset form and refresh
            setNewChannelName('');
            setFormData({ description: '' });
            setSelectedOrgs([]);
            setIsCreatingChannel(false);
            fetchChannels();
            
            toast({
                title: "Channel created",
                description: "New coordination channel has been created successfully",
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

    const handleOrgSelection = (orgId) => {
        setSelectedOrgs(prev => {
            if (prev.includes(orgId)) {
                return prev.filter(id => id !== orgId);
            }
            return [...prev, orgId];
        });
    };

    const handleUpdateMembers = async (channelId, updatedMembers) => {
        try {
            const currentMembers = channelMembers[channelId] || {};
            
            // Handle removals one at a time instead of in bulk
            for (const orgId of Object.keys(currentMembers)) {
                if (!updatedMembers.includes(orgId) && currentMembers[orgId].role !== 'owner') {
                    const { error: removeError } = await supabase
                        .from('channel_members')
                        .delete()
                        .eq('channel_id', channelId)
                        .eq('organization_id', orgId)  // Change from .in() to .eq()
                        .eq('role', 'member');        // Only delete members, not owners

                    if (removeError) throw removeError;
                }
            }

            // Add new members
            const existingMemberIds = Object.keys(currentMembers);
            const membersToAdd = updatedMembers
                .filter(orgId => !existingMemberIds.includes(orgId))
                .map(orgId => ({
                    channel_id: channelId,
                    organization_id: orgId,
                    role: 'member'
                }));

            if (membersToAdd.length > 0) {
                const { error: addError } = await supabase
                    .from('channel_members')
                    .insert(membersToAdd);

                if (addError) throw addError;
            }

            fetchChannelMembers(channelId);
            toast({
                title: "Channel updated",
                description: "Member list has been updated successfully",
                status: "success",
                duration: 2000
            });
        } catch (error) {
            toast({
                title: "Error updating members",
                description: error.message,
                status: "error",
                duration: 3000
            });
        }
    };

    const handleUpdateChannelInfo = async () => {
        try {
            const { error } = await supabase
                .from('coordination_channels')
                .update({
                    name: editChannelForm.name,
                    description: editChannelForm.description
                })
                .eq('id', selectedChannel);

            if (error) throw error;

            // Refresh channels
            fetchChannels();
            setIsEditingChannel(false);
            
            toast({
                title: "Channel updated",
                description: "Channel information has been updated successfully",
                status: "success",
                duration: 2000
            });
        } catch (error) {
            toast({
                title: "Error updating channel",
                description: error.message,
                status: "error",
                duration: 3000
            });
        }
    };

    return (
        <Box h="full" display="flex" flexDirection="column">
            {/* Channel Header */}
            <HStack 
                p={4} 
                bg="gray.50" 
                borderBottom="1px" 
                borderColor="gray.200" 
                spacing={4}
                width="100%"  // Add full width
                justify="space-between"  // Better spacing distribution
            >
                <Box flex="1">
                    <Select
                        value={currentChannel || ''}
                        onChange={(e) => {
                            setCurrentChannel(e.target.value);
                            fetchChannelMembers(e.target.value);
                        }}
                        size="sm"
                        width="100%"  // Take full width of container
                        maxW="300px"  // Increased from 200px
                        textOverflow="ellipsis"  // Handle text overflow
                        title={channels.find(c => c.id === currentChannel)?.name}  // Add tooltip on hover
                    >
                        {channels.map(channel => (
                            <Tooltip 
                                key={channel.id}
                                label={channel.description || 'No description provided'}
                                placement="bottom"
                                hasArrow
                            >
                                <option 
                                    value={channel.id}
                                    style={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {channel.name} {channel.creator && `(by ${channel.creator.organization_name})`}
                                </option>
                            </Tooltip>
                        ))}
                    </Select>
                </Box>
                <HStack spacing={2}>  {/* Group action buttons together */}
                    <Button
                        leftIcon={<AddIcon />}
                        size="sm"
                        onClick={() => setIsCreatingChannel(true)}
                        minW="120px"
                        whiteSpace="nowrap"
                    >
                        New Channel
                    </Button>
                    {currentChannel && (
                        <Menu>
                            <MenuButton
                                as={IconButton}
                                icon={<BsThreeDotsVertical />}
                                variant="ghost"
                                size="sm"
                            />
                            <MenuList>
                                <MenuItem onClick={() => {
                                    setSelectedChannel(currentChannel);
                                    setIsManagingChannel(true);
                                }}>
                                    Manage Channel
                                </MenuItem>
                            </MenuList>
                        </Menu>
                    )}
                </HStack>
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
                <HStack spacing={4}>
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        size="md"
                        flex="1"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage(newMessage);
                            }
                        }}
                    />
                    <Button
                        colorScheme="blue"
                        onClick={() => sendMessage(newMessage)}
                        isDisabled={!newMessage.trim()}
                        minW="80px"
                        size="md"
                    >
                        Send
                    </Button>
                </HStack>
            </Box>

            {/* Create Channel Modal */}
            <Modal isOpen={isCreatingChannel} onClose={() => setIsCreatingChannel(false)} size="md">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Create New Channel</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Channel Name</FormLabel>
                                <Input
                                    value={newChannelName}
                                    onChange={(e) => setNewChannelName(e.target.value)}
                                    placeholder="e.g., Resource Coordination"
                                />
                                <FormHelperText>
                                    Create a channel for specific coordination needs
                                </FormHelperText>
                            </FormControl>

                            <FormControl>
                                <FormLabel>Channel Description</FormLabel>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        description: e.target.value
                                    }))}
                                    placeholder="Describe the purpose of this channel..."
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Add Organizations</FormLabel>
                                <CheckboxGroup>
                                    <VStack align="start" maxH="200px" overflowY="auto">
                                        {participants.map((participant) => (
                                            <Checkbox
                                                key={participant.organization_id}
                                                value={participant.organization_id}
                                                isChecked={selectedOrgs.includes(participant.organization_id)}
                                                onChange={(e) => handleOrgSelection(participant.organization_id)}
                                            >
                                                {participant.organization?.organization_name}
                                            </Checkbox>
                                        ))}
                                    </VStack>
                                </CheckboxGroup>
                                <FormHelperText>
                                    Select organizations to add to this channel. All participating organizations will be able to join later.
                                </FormHelperText>
                            </FormControl>
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={() => setIsCreatingChannel(false)}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="blue"
                            onClick={handleCreateChannel}
                            isDisabled={!newChannelName.trim()}
                        >
                            Create Channel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Manage Channel Modal */}
            <Modal isOpen={isManagingChannel} onClose={() => setIsManagingChannel(false)} size="md">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Manage Channel Members</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            {/* Add channel info section */}
                            <Box width="100%" p={4} bg="gray.50" borderRadius="md">
                                <HStack justify="space-between" mb={2}>
                                    <Text fontWeight="bold">Channel Information</Text>
                                    {channelMembers[selectedChannel]?.[currentUser?.id]?.role === 'owner' && (
                                        <IconButton
                                            icon={<EditIcon />}
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                const channel = channels.find(c => c.id === selectedChannel);
                                                setEditChannelForm({
                                                    name: channel.name,
                                                    description: channel.description || ''
                                                });
                                                setIsEditingChannel(true);
                                            }}
                                        />
                                    )}
                                </HStack>
                                {isEditingChannel ? (
                                    <VStack spacing={3} align="stretch">
                                        <FormControl>
                                            <FormLabel fontSize="sm">Channel Name</FormLabel>
                                            <Input
                                                size="sm"
                                                value={editChannelForm.name}
                                                onChange={(e) => setEditChannelForm(prev => ({
                                                    ...prev,
                                                    name: e.target.value
                                                }))}
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel fontSize="sm">Description</FormLabel>
                                            <Textarea
                                                size="sm"
                                                value={editChannelForm.description}
                                                onChange={(e) => setEditChannelForm(prev => ({
                                                    ...prev,
                                                    description: e.target.value
                                                }))}
                                            />
                                        </FormControl>
                                        <HStack spacing={2}>
                                            <Button
                                                size="sm"
                                                onClick={() => setIsEditingChannel(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                colorScheme="blue"
                                                onClick={handleUpdateChannelInfo}
                                                isDisabled={!editChannelForm.name.trim()}
                                            >
                                                Save
                                            </Button>
                                        </HStack>
                                    </VStack>
                                ) : (
                                    <>
                                        <Text fontSize="sm" color="gray.600">
                                            Name: {channels.find(c => c.id === selectedChannel)?.name}
                                        </Text>
                                        <Text fontSize="sm" color="gray.600">
                                            Description: {channels.find(c => c.id === selectedChannel)?.description || 'No description provided'}
                                        </Text>
                                        <Text fontSize="sm" color="gray.600" mt={1}>
                                            Created by: {channels.find(c => c.id === selectedChannel)?.creator?.organization_name}
                                        </Text>
                                    </>
                                )}
                            </Box>

                            <FormControl>
                                <FormLabel>Channel Members</FormLabel>
                                <CheckboxGroup
                                    value={Object.keys(channelMembers[selectedChannel] || {})}
                                    onChange={(values) => handleUpdateMembers(selectedChannel, values)}
                                >
                                    <VStack align="start" maxH="300px" overflowY="auto">
                                        {participants.map((participant) => {
                                            const member = channelMembers[selectedChannel]?.[participant.organization_id];
                                            const isOwner = member?.role === 'owner';
                                            return (
                                                <HStack key={participant.organization_id} width="100%" justify="space-between">
                                                    <Checkbox
                                                        value={participant.organization_id}
                                                        isDisabled={isOwner}
                                                    >
                                                        {participant.organization?.organization_name}
                                                    </Checkbox>
                                                    {isOwner && (
                                                        <Badge colorScheme="purple">Owner</Badge>
                                                    )}
                                                </HStack>
                                            );
                                        })}
                                    </VStack>
                                </CheckboxGroup>
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={() => setIsManagingChannel(false)}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default OrganizationChannel;