import React, { useState, useEffect } from 'react';
import {
  Box,
  ChakraProvider,
  Flex,
  VStack,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  useColorModeValue
} from "@chakra-ui/react";
import axios from 'axios';

// Sidebar Component
const Sidebar = ({ onSelect }) => (
  <VStack align="stretch" spacing={4} p={5} w="250px" bg="gray.100" minH="100vh">
    <Button onClick={() => onSelect('directory')}>Volunteer Directory</Button>
    <Button onClick={() => onSelect('signup')}>Sign Up as a Volunteer</Button>
  </VStack>
);

// Table Row Component
const VolunteerRow = ({ volunteer }) => (
  <Tr>
    <Td>{volunteer.volunteer_id}</Td>
    <Td>{volunteer.user_id}</Td>
    <Td>{volunteer.skills}</Td>
    <Td>{volunteer.availability}</Td>
    <Td>{volunteer.region}</Td>
  </Tr>
);

// Volunteers Table Component
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
      {volunteers.map((volunteer) => (
        <VolunteerRow key={volunteer.volunteer_id} volunteer={volunteer} />
      ))}
    </Tbody>
  </Table>
);

// Main Dashboard Page Component
const VolunteerDashboardPage = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [view, setView] = useState('directory'); // 'directory' or 'signup'

  // Fetch volunteers by region
  const fetchVolunteersByRegion = (region) => {
    axios.get(`http://localhost:5000/api/volunteers/region?region=${region}`)
      .then(response => setVolunteers(response.data))
      .catch(error => console.error('Error fetching volunteers:', error));
  };

  // Fetch volunteers by skills
  const fetchVolunteersBySkills = (skill) => {
    axios.get(`http://localhost:5000/api/volunteers/skills?skill=${skill}`)
      .then(response => setVolunteers(response.data))
      .catch(error => console.error('Error fetching volunteers:', error));
  };

  // Handle sidebar selection
  const handleSelect = (selection) => {
    setView(selection);
    if (selection === 'directory') {
      fetchVolunteersByRegion('All'); // Example default region
    }
  };

  useEffect(() => {
    fetchVolunteersByRegion('All'); // Fetch all on initial load
  }, []);

  return (
    <ChakraProvider>
      <Flex>
        <Sidebar onSelect={handleSelect} />
        <Box flex="1" p={5}>
          {view === 'directory' && (
            <Tabs variant="enclosed">
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
                </TabPanel>
                <TabPanel>
                  <Select placeholder="Select skill" onChange={(e) => fetchVolunteersBySkills(e.target.value)}>
                    <option value="Medical">Medical</option>
                    <option value="Technical">Technical</option>
                    <option value="Logistical">Logistical</option>
                  </Select>
                  <VolunteersTable volunteers={volunteers} />
                </TabPanel>
              </TabPanels>
            </Tabs>
          )}
          {view === 'signup' && (
            <Text>Signup form will be implemented here.</Text>
          )}
        </Box>
      </Flex>
    </ChakraProvider>
  );
};

export default VolunteerDashboardPage;
