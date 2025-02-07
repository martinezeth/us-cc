import React from 'react';
import { Box, HStack, Select, Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

const VolunteerFilterBar = ({ filters, onFilterChange, stats }) => {
    return (
        <Box bg="white" p={4} borderRadius="lg" shadow="sm">
            <HStack spacing={4}>
                <Select
                    value={filters.status}
                    onChange={(e) => onFilterChange({ status: e.target.value })}
                    maxW="200px"
                >
                    <option value="available">Available</option>
                    <option value="assigned">Currently Assigned</option>
                </Select>
                <Select
                    value={filters.skill}
                    onChange={(e) => onFilterChange({ skill: e.target.value })}
                    maxW="200px"
                >
                    {Object.entries(stats?.skillDistribution || {}).map(([skill, count]) => (
                        <option key={skill} value={skill}>
                            {skill} ({count})
                        </option>
                    ))}
                </Select>
                <InputGroup flex="1">
                    <InputLeftElement
                        pointerEvents="none"
                        children={<SearchIcon color="gray.300" />}
                    />
                    <Input
                        type="text"
                        placeholder="Search by name or skills"
                        value={filters.searchQuery}
                        onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
                    />
                </InputGroup>
            </HStack>
        </Box>
    );
};

export default VolunteerFilterBar;