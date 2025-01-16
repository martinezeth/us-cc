import React, { useState, useEffect } from 'react';
import { Box, Heading, Text, Icon, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const ProtectedFeatureCard = ({ title, description, icon, path, requiredRole }) => {
    const [user, setUser] = useState(null);
    const [isOrganization, setIsOrganization] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                setIsOrganization(user.user_metadata?.is_organization || false);
            }
        };
        checkAuth();
    }, []);

    const handleClick = () => {
        // For features that don't require authentication (requiredRole is null), navigate directly
        if (!requiredRole) {
            navigate(path);
            return;
        }

        // For protected features, check authentication
        if (!user) {
            toast({
                title: "Authentication Required",
                description: requiredRole === 'organization'
                    ? "Please log in as an organization to access this feature. Try the Demo Organization account!"
                    : "Please log in to access this feature. Try the Demo Volunteer account!",
                status: "info",
                duration: 5000,
                isClosable: true,
            });
            navigate('/login');
            return;
        }

        if (requiredRole === 'organization' && !isOrganization) {
            toast({
                title: "Organization Access Only",
                description: "This feature is only available for organization accounts. Try the demo organization account!",
                status: "warning",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        if (requiredRole === 'volunteer' && isOrganization) {
            toast({
                title: "Volunteer Access Only",
                description: "This feature is only available for volunteer accounts. Try the demo volunteer account!",
                status: "warning",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        navigate(path);
    };

    return (
        <Box
            bg="white"
            p={6}
            rounded="lg"
            shadow="md"
            border="1px"
            borderColor="gray.100"
            transition="all 0.3s"
            cursor="pointer"
            onClick={handleClick}
            _hover={{ transform: 'translateY(-5px)', shadow: 'lg' }}
            position="relative"
        >
            <Icon as={icon} w={10} h={10} color="blue.500" mb={4} />
            <Heading size="md" mb={2}>{title}</Heading>
            <Text color="gray.600">{description}</Text>
        </Box>
    );
};

export default ProtectedFeatureCard;