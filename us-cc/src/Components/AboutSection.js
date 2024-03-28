import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const AboutSection = () => {
    return (
        <Box sx={{mt: 4}}>
            <Typography variant="h4" gutterBottom>
                About Us
            </Typography>
            <Typography variant="body1">
                US Crisis Coordination (USCC) is a web-based platform designed to empower communities and local authorities to coordinate and respond to disasters. Our platform provides a centralized hub for information sharing, resource allocation, and communication during times of crisis. By connecting individuals, organizations, and government agencies, USCC aims to streamline disaster response efforts and improve outcomes for those affected by emergencies.
            </Typography>
        </Box>
    );
};

export default AboutSection;
