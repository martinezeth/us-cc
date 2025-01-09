import React, { useState, useEffect, useRef } from 'react';
import { Box, Input, VStack, Text, List, ListItem } from '@chakra-ui/react';

const LocationSearch = ({ onSelect, mode = 'city', placeholder }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const debounceTimer = useRef(null);

    const searchLocation = async (searchQuery) => {
        if (!searchQuery.trim()) {
            setSuggestions([]);
            return;
        }

        try {
            setLoading(true);
            const params = new URLSearchParams({
                format: 'json',
                q: searchQuery,
                addressdetails: 1,
                limit: 5
            });

            // Add featuretype parameter only for city search
            if (mode === 'city') {
                params.append('featuretype', 'city');
            }

            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?${params.toString()}`
            );
            const data = await response.json();

            // Format results based on search mode
            const formattedResults = data.map(result => {
                if (mode === 'city') {
                    return {
                        display: `${result.address.city || result.address.town || result.address.village || result.name}, ${result.address.state}, ${result.address.country}`,
                        lat: parseFloat(result.lat),
                        lng: parseFloat(result.lon),
                        city: result.address.city || result.address.town || result.address.village || result.name,
                        state: result.address.state,
                        country: result.address.country
                    };
                } else {
                    return {
                        display: result.display_name,
                        lat: parseFloat(result.lat),
                        lng: parseFloat(result.lon),
                        address: result.display_name,
                        city: result.address.city || result.address.town || result.address.village,
                        state: result.address.state,
                        country: result.address.country
                    };
                }
            });

            // Filter out results without city information if in city mode
            const filteredResults = mode === 'city'
                ? formattedResults.filter(result => result.city)
                : formattedResults;

            setSuggestions(filteredResults);
        } catch (error) {
            console.error('Error searching for location:', error);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, []);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            searchLocation(value);
        }, 500);
    };

    const handleSuggestionClick = (suggestion) => {
        setQuery(suggestion.display);
        setSuggestions([]);
        onSelect(suggestion);
    };

    return (
        <VStack align="stretch" spacing={2} position="relative" width="100%">
            <Input
                value={query}
                onChange={handleInputChange}
                placeholder={placeholder || (mode === 'city' ? "Start typing your city..." : "Enter an address...")}
                bg="white"
            />

            {loading && <Text fontSize="sm" color="gray.500">Searching...</Text>}

            {suggestions.length > 0 && (
                <List
                    position="absolute"
                    top="100%"
                    left={0}
                    right={0}
                    bg="white"
                    boxShadow="md"
                    borderRadius="md"
                    maxH="200px"
                    overflowY="auto"
                    zIndex={400}
                    border="1px solid"
                    borderColor="gray.200"
                >
                    {suggestions.map((suggestion, index) => (
                        <ListItem
                            key={index}
                            p={2}
                            cursor="pointer"
                            _hover={{ bg: 'gray.100' }}
                            onClick={() => handleSuggestionClick(suggestion)}
                        >
                            {suggestion.display}
                        </ListItem>
                    ))}
                </List>
            )}
        </VStack>
    );
};

export default LocationSearch;