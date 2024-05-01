import React, { useState } from "react";
import { Box, Button, Input, VStack, Text, Container, Checkbox } from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

function VolunteerPage() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [region, setRegion] = useState('');
    const [skills, setSkills] = useState('');
    const [availability, setAvailability] = useState([]);
    const [error, setError] = useState('');

    const availabilityOptions = [
        "Weekdays",
        "Weekends",
        "Mornings",
        "Afternoons",
        "Evenings",
    ];

    const handleRegister = async () => {
        try {
            const response = await axios.post('/api/volunteers', {
                name,
                region,
                skills,
                availability,
            });
            console.log('Volunteer registration successful:', response.data);
            // Optionally, you can redirect the user to a different page after successful registration
            // navigate('/thank-you');
            navigate('/');
        } catch (error) {
            console.error('Error registering volunteer:', error.response.data);
            setError('An error occurred. Please try again later.');
        }
    };

    const handleAvailabilityChange = (option) => {
        if (availability.includes(option)) {
            setAvailability(availability.filter(item => item !== option));
        } else {
            setAvailability([...availability, option]);
        }
    };

    return (
        <>
            <h1>Volunteering Sign Up</h1>
            <Container centerContent>
                <VStack spacing={4}>
                    <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                    <Input placeholder="Region" focusBorderColor='blue' value={region} onChange={(e) => setRegion(e.target.value)} />
                    <Input placeholder="Skills" value={skills} onChange={(e) => setSkills(e.target.value)} />
                    <Box>
                        <Text>Availability:</Text>
                        {availabilityOptions.map(option => (
                            <Checkbox
                                key={option}
                                isChecked={availability.includes(option)}
                                onChange={() => handleAvailabilityChange(option)}
                            >
                                {option}
                            </Checkbox>
                        ))}
                    </Box>
                    {error && <Text color="red">{error}</Text>}
                    <Button colorScheme="blue" onClick={handleRegister}>Register as a volunteer</Button>
                </VStack>
            </Container>
        </>
    );
}

// export { VolunteerPage };
export default VolunteerPage;