import React from 'react';
import { Icon, Box } from '@chakra-ui/react';
import { ReactComponent as VerifiedBadgeIcon } from '../Images/Icons/verified-badge.svg';

const VerifiedBadge = ({ size = "16px" }) => (
    <Box as="span" display="inline-block" verticalAlign="middle" ml={1}>
        <Icon as={VerifiedBadgeIcon} w={size} h={size} />
    </Box>
);

export default VerifiedBadge;