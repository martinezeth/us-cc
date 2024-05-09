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
  


const VolunteerRow = ({ volunteer, regions }) => {
    const [regionName, setRegionName] = useState([]);

    useEffect(() => {
        // Find the region object corresponding to volunteer's region_id
        const selectedRegion = regions.find(region => region.region_id === volunteer.region_id);
        // If region is found, set the region name
        if (selectedRegion) {
            setRegionName(selectedRegion.region_name);
        }
    }, [volunteer, regions]);
    return(
    <Tr>
        <Td>{volunteer.volunteer_id}</Td>
        <Td>{volunteer.user_id}</Td>
        <Td>{volunteer.skills}</Td>
        <Td>{volunteer.availability}</Td>
        <Td>{regionName}</Td>
    </Tr>
);}

const VolunteersTable = ({ volunteers,regions }) => (
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
                <VolunteerRow key={volunteer.volunteer_id} volunteer={volunteer} regions={regions}/>
            ))}
        </Tbody>
    </Table>
);

const VolunteerDashboardPage = () => {
    const [volunteers, setVolunteers] = useState([]);
    const [regionChartData, setRegionChartData] = useState([]);
    const [regions, setRegions] = useState([]);
    const [skillChartData, setSkillChartData] = useState([]);
    const [skills, setSkills] = useState([]);
    const [activeChartData, setActiveChartData] = useState([]);



    const fetchVolunteersByRegion = (region) => {
        axios.get(`http://localhost:8000/api/volunteers/region?region=${region}`)
            .then(response => setVolunteers(response.data))
            .catch(error => console.error('Error fetching volunteers:', error));
    };

    const fetchVolunteersBySkills = (skill) => {
        axios.get(`http://localhost:8000/api/volunteers/skills?skill=${skill}`)
            .then(response => setVolunteers(response.data))
            .catch(error => console.error('Error fetching volunteer skills:', error));
    };




    const fetchAllRegionsForChart = async (regionsData) => {
        try {
            const response = await axios.get(`http://localhost:8000/api/volunteers/region-chart`);
            const formattedData = response.data.map(item => {
                const region = regionsData.find(region => region.region_id === item.region_id);
                return {
                    name: region ? region.region_name : 'Unknown region',
                    value: item.count
                };
            });
            setRegionChartData(formattedData);
            setActiveChartData(formattedData);
        } catch (error) {
            console.error('Error fetching chart data:', error);
        }
    };




const fetchRegions = async () => {
    try {
        const response = await axios.get(`http://localhost:8000/api/volunteers/getregions`);
        setRegions(response.data[0]); // Assuming this returns an array of regions
        return response.data[0]; // Return regions for chaining
    } catch (error) {
        console.error("Error fetching regions:", error);
    }
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
    const fetchSkills = () => {
        
        axios.get(`http://localhost:8000/api/volunteers/skills`)
            .then(response => {
                
                const skillsArray = response.data.map(skill => skill.skills);
                setSkills(skillsArray);
            })
            .catch(error => console.error('Error fetching skills:', error));
    };

    useEffect(() => {
        // Function to initialize dashboard
        const initDashboard = async () => {
            // Fetch regions and skills upon initial load
            const loadedRegions = await fetchRegions(); // Fetch and wait for regions to load
            if (loadedRegions && loadedRegions.length > 0) {
                await fetchAllRegionsForChart(loadedRegions); // Fetch chart data for regions
            }
            fetchAllSkillsForChart(); // Fetch skills data for the pie chart
            fetchVolunteersByRegion(0); // Fetch all volunteers initially or a sensible default
        };
    
        initDashboard();
    }, []);

    return (
    <ChakraProvider>
        <Flex>
            <Sidebar onSelect={() => fetchVolunteersByRegion('All')} />
            <Box flex="1" p={5}>
                <Tabs variant="enclosed" defaultIndex={1} onChange={(index) => {
                    setActiveChartData(index === 0 ? regionChartData : skillChartData);
                }}>
                    <TabList>
                        <Tab>By Region</Tab>
                        <Tab>By Skills</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <Select placeholder="Select region" onChange={(e) => fetchVolunteersByRegion(e.target.value)}>
                                {regions.map((region) => (
                                    <option key={region.region_id} value={region.region_id}>
                                        {region.region_name}
                                    </option>
                                ))}
                            </Select>
                            {regions.length > 0 && <VolunteersTable volunteers={volunteers} regions={regions} />}
                            <PieChart width={500} height={400} margin={{ top: 5, right: 30, bottom: 5, left: 30 }}>
                                <Pie
                                    data={activeChartData}
                                    cx={250}
                                    cy={200}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={false}
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
                                {skills.map((skill) => (
                                    <option key={skill} value={skill}>
                                        {skill}
                                    </option>
                                ))}
                            </Select>
                            {regions.length > 0 && <VolunteersTable volunteers={volunteers} regions={regions} />}
                            <PieChart width={400} height={400}>
                                <Pie
                                    data={activeChartData}
                                    cx={200}
                                    cy={200}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={false}
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