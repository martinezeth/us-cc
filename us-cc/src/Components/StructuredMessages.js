import React from 'react';
import { Box, HStack, Text, Badge, Icon, Avatar } from '@chakra-ui/react';
import { WarningIcon, InfoIcon, ChatIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

const MESSAGE_TYPES = {
    general: {
        icon: ChatIcon,
        color: 'gray',
        label: 'General'
    },
    status_update: {
        icon: InfoIcon,
        color: 'blue',
        label: 'Status Update'
    },
    volunteer_coordination: {
        icon: ChatIcon,
        color: 'green',
        label: 'Volunteer'
    },
    emergency: {
        icon: WarningIcon,
        color: 'red',
        label: 'Emergency'
    }
};

const StructuredMessage = ({ message, organization }) => {
    const navigate = useNavigate();
    const messageType = MESSAGE_TYPES[message.message_type] || MESSAGE_TYPES.general;

    return (
        <Box
            p={4}
            bg={`${messageType.color}.50`}
            borderRadius="lg"
            borderLeft="4px"
            borderLeftColor={`${messageType.color}.500`}
        >
            <HStack spacing={3} mb={2}>
                <Avatar
                    size="sm"
                    name={organization?.organization_name}
                    cursor="pointer"
                    onClick={() => navigate(`/profile/${organization?.username}`)}
                />
                <Box flex="1">
                    <HStack>
                        <Text
                            fontWeight="bold"
                            cursor="pointer"
                            _hover={{ textDecoration: 'underline' }}
                            onClick={() => navigate(`/profile/${organization?.username}`)}
                        >
                            {organization?.organization_name}
                        </Text>
                        <Badge colorScheme={messageType.color}>
                            <Icon as={messageType.icon} mr={1} />
                            {messageType.label}
                        </Badge>
                    </HStack>
                    <Text fontSize="xs" color="gray.500">
                        {new Date(message.created_at).toLocaleString()}
                    </Text>
                </Box>
            </HStack>
            <Text mt={2}>{message.content}</Text>
        </Box>
    );
};

export default StructuredMessage;