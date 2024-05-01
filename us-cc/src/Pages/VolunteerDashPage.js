import React, { useState, useEffect } from 'react';
import {
    Box, ChakraProvider, Flex, VStack, Button, Tabs, TabList, TabPanels, Tab,
    TabPanel, Select, Text, Table, Thead, Tbody, Tr, Th, Td
} from "@chakra-ui/react";
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Sidebar = ({ onSelect }) => {
    const navigate = useNavigate();  // Initialize the useNavigate hook to get the navigate function
  
    return (
      <VStack align="stretch" spacing={4} p={5} w="250px" bg="gray.100" minH="100vh">
        <Button onClick={() => onSelect('directory')}>Volunteer Directory</Button>
        <Button onClick={() => navigate('/volunteer-register')}>Sign Up as a Volunteer</Button>
      </VStack>
    );
  };
  


const VolunteerRow = ({ volunteer }) => (
    <Tr>
        <Td>{volunteer.volunteer_id}</Td>
        <Td>{volunteer.user_id}</Td>
        <Td>{volunteer.skills}</Td>
        <Td>{volunteer.availability}</Td>
        <Td>{volunteer.region}</Td>
    </Tr>
);

const VolunteersTable = ({ volunteers }) => (
    <Table variant="simple">
        <Thead>
            <Tr>
                <Th>Volunteer ID</Th>
                <Th>User ID</Th>
                <Th>Skills</Th>
                <Th>Availability</Th>
                <Th>Region</Th>
            </Tr>
        </Thead>
        <Tbody>
            {volunteers.map(volunteer => (
                <VolunteerRow key={volunteer.volunteer_id} volunteer={volunteer} />
            ))}
        </Tbody>
    </Table>
);

const VolunteerDashboardPage = () => {
    const [volunteers, setVolunteers] = useState([]);
    const [regionChartData, setRegionChartData] = useState([]);
    const [skillChartData, setSkillChartData] = useState([]);
    const [activeChartData, setActiveChartData] = useState([]);



    const fetchVolunteersByRegion = (region) => {
        axios.get(`http://localhost:8000/api/volunteers/region?region=${region}`)
            .then(response => setVolunteers(response.data))
            .catch(error => console.error('Error fetching volunteers:', error));
    };

    const fetchVolunteersBySkills = (skill) => {
        axios.get(`http://localhost:8000/api/volunteers/skills?skill=${skill}`)
            .then(response => setVolunteers(response.data))
            .catch(error => console.error('Error fetching volunteers:', error));
    };


    const fetchAllRegionsForChart = () => {
        axios.get(`http://localhost:8000/api/volunteers/region-chart`)
            .then(response => {
                const formattedData = response.data.map(item => ({
                    name: item.region,
                    value: item.count
                }));
                setRegionChartData(formattedData);
                setActiveChartData(formattedData); // Set initial chart data to regions
            })
            .catch(error => console.error('Error fetching chart data:', error));
    };

    const fetchAllSkillsForChart = () => {
        axios.get(`http://localhost:8000/api/volunteers/skill-chart`)
            .then(response => {
                const formattedData = response.data.map(item => ({
                    name: item.skills,
                    value: item.count
                }));
                setSkillChartData(formattedData);
                if (formattedData.length > 0) {  // Additional check to prevent setting empty chart data
                    setActiveChartData(formattedData); // Optionally update the active chart if needed
                }
            })
            .catch(error => console.error('Error fetching chart data:', error));
    };
    useEffect(() => {
        fetchVolunteersByRegion('All'); // Initially load all volunteers
        fetchAllRegionsForChart(); // Fetch region data for the pie chart
        fetchAllSkillsForChart(); // Fetch skills data for the pie chart
    }, []);


    return (
        <ChakraProvider>
            <Flex>
                <Sidebar onSelect={() => fetchVolunteersByRegion('All')} />
                <Box flex="1" p={5}>
                    <Tabs variant="enclosed" onChange={(index) => {
                        setActiveChartData(index === 0 ? regionChartData : skillChartData);
                    }}>
                        <TabList>
                            <Tab>By Region</Tab>
                            <Tab>By Skills</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                <Select placeholder="Select region" onChange={(e) => fetchVolunteersByRegion(e.target.value)}>
                                    <option value="North">North</option>
                                    <option value="South">South</option>
                                    <option value="East">East</option>
                                    <option value="West">West</option>
                                </Select>
                                <VolunteersTable volunteers={volunteers} />
                                <PieChart width={400} height={400}>
                                    <Pie
                                        data={activeChartData}
                                        cx={200}
                                        cy={200}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {activeChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </TabPanel>
                            <TabPanel>
                                <Select placeholder="Select skill" onChange={(e) => fetchVolunteersBySkills(e.target.value)}>
                                    <option value="Medical">Medical</option>
                                    <option value="Technical">Technical</option>
                                    <option value="Logistical">Logistical</option
                                    >
                                </Select>
                                <VolunteersTable volunteers={volunteers} />
                                <PieChart width={400} height={400}>
                                    <Pie
                                        data={activeChartData}
                                        cx={200}
                                        cy={200}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {activeChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </Box>
            </Flex>
        </ChakraProvider>
    );
};

export default VolunteerDashboardPage;