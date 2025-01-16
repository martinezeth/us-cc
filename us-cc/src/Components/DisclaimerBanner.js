import React, { useState } from 'react';
import {
    Box,
    Text,
    CloseButton,
    useColorModeValue,
    Container,
    Alert,
    AlertIcon,
} from '@chakra-ui/react';

const DisclaimerBanner = () => {
    const [isVisible, setIsVisible] = useState(true);
    const bgColor = useColorModeValue('red.50', 'red.900');
    const textColor = useColorModeValue('red.700', 'red.200');

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('disclaimerDismissed', 'true');
    };

    React.useEffect(() => {
        const isDismissed = localStorage.getItem('disclaimerDismissed');
        if (isDismissed) {
            setIsVisible(false);
        }
    }, []);

    if (!isVisible) return null;

    return (
        <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            zIndex="banner"
        >
            <Container maxW="7xl">
                <Alert 
                    status="warning"
                    bg="rgba(254, 235, 200, 0.9)"  // semi-transparent warning color
                    backdropFilter="blur(8px)"      // adds a frosted glass effect
                    borderRadius="md"
                    mt={2}                         // adds some margin from the top
                    boxShadow="md"                 // adds a subtle shadow
                >
                    <AlertIcon />
                    <Text fontSize="sm" textAlign="center" flex="1">
                        ⚠️ This is a demo project for educational purposes only. All incidents, events, people, and organizations and content are fictitious.
                        Do not use this site for real emergency information or response coordination.
                    </Text>
                    <CloseButton
                        position="absolute"
                        right={2}
                        top={2}
                        onClick={handleDismiss}
                    />
                </Alert>
            </Container>
        </Box>
    );
};

export default DisclaimerBanner;