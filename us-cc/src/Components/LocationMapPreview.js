import React, { useEffect, useState } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import mapCurrentLocation from '../Images/Icons/mapCurrentLocation.svg';


// Marker for selecting location
const markerIcon = new L.Icon({
    iconUrl: mapCurrentLocation,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

// Component to handle map center updates
const MapController = ({ center }) => {
    const map = useMap();

    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);

    return null;
};

// Component to handle location selection
const LocationMarker = ({ position, setPosition, radius }) => {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position ? (
        <>
            <Marker
                position={position}
                icon={markerIcon}
            />
            {radius && (
                <Circle
                    center={position}
                    radius={radius * 1609.34} // Converting meters to miles
                    color="blue"
                    fillColor="blue"
                    fillOpacity={0.1}
                />
            )}
        </>
    ) : null;
};

const LocationMapPreview = ({
    position,
    setPosition,
    radius,
    height = "300px",
    isSelectable = true,
    zoom = 13
}) => {
    return (
        <Box height={height} width="100%" borderRadius="md" overflow="hidden">
            <MapContainer
                center={position || [37.7749, -122.4194]} // Default to SF if no position
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapController center={position} />
                {isSelectable && (
                    <LocationMarker
                        position={position}
                        setPosition={setPosition}
                        radius={radius}
                    />
                )}
            </MapContainer>
            {isSelectable && (
                <Text fontSize="sm" mt={2} color="gray.600">
                    Click on the map to select a location
                </Text>
            )}
        </Box>
    );
};

export default LocationMapPreview;