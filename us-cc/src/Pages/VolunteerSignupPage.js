import React, { useState, useEffect } from "react";
import { Box, Button, Input, VStack, Text, Container, Checkbox, Select } from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

function VolunteerPage() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [region, setRegion] = useState('');
    const [regionid, setRegionid] = useState();
    const [regions, setRegions] = useState([]);
    const [skills, setSkills] = useState('');
    const [availability, setAvailability] = useState([]);
    const [error, setError] = useState('');
    const [nameError, setNameError] = useState('');
    const [availabilityError, setAvailabilityError] = useState('');


    useEffect(() => {
        // Fetch regions when the component mounts
        const fetchRegions = () => {
            axios.get(`http://localhost:8000/api/volunteers/getregions`)
                .then(response => {
                    setRegions(response.data[0]);
                })
                .catch(error => console.error("Error fetching regions:", error));
        }

        fetchRegions();
    }, []);

    const availabilityOptions = [
        "Weekdays",
        "Weekends",
        "Mornings",
        "Afternoons",
        "Evenings",
        "Flexible"
    ];

    const handleRegister = () => {
        setNameError('');
        setAvailabilityError('');

        // Form validation
        let isValid = true;
        if (!name.trim()) {
            setNameError('Name is required');
            isValid = false;
        }
        if (availability.length === 0) {
            setAvailabilityError('Please select at least one availability option');
            isValid = false;
        }

        if(isValid) {
            axios.post('http://localhost:8000/api/volunteering/register', {
                userData: {
                    name,
                    region,
                    regionid,
                    skills,
                    availability,
                }
            }).then(response => {
                navigate('/');
            }).catch(error => {
                console.error('Error registering volunteer:', error.response.data);
                setError('An error occurred. Please try again later.');
            });
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
            <Container  my={10}>
                <VStack spacing={4}>
                    <Input 
                        placeholder="Name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        isInvalid={!!nameError} 
                    />
                    {nameError && <Text color="red">{nameError}</Text>}
                    <Box>
                        <Select
                            placeholder="Select region"
                            value={region}
                            onChange={(e) => {
                                const selectedRegionId = e.target.selectedOptions[0].id;
                                setRegion(e.target.value);
                                setRegionid(selectedRegionId);
                            }}
                        >
                            {regions.map(region => (
                                <option key={region.region_id} id={region.region_id} value={region.region_name}>
                                    {region.region_name}
                                </option>
                            ))}
                        </Select>
                    </Box>
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
                    {availabilityError && <Text color="red">{availabilityError}</Text>}
                    {error && <Text color="red">{error}</Text>}
                    <Button colorScheme="blue" onClick={handleRegister}>Register as a volunteer</Button>
                </VStack>
            </Container>
        </>
    );
}


// export { VolunteerPage };
export default VolunteerPage;