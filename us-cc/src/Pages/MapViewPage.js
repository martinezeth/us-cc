import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Box, ChakraProvider } from '@chakra-ui/react'

const BaseIcon = L.Icon.extend({
  options: {
    iconSize: [25, 41], 
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }
});

const mapIcons = {
  accident: new BaseIcon({iconUrl: 'Images/Icons/accidentEventIcon.svg'}),
  earthquake: new BaseIcon({iconUrl: 'Images/Icons/earthquakeEventIcon.svg'}),
  fire: new BaseIcon({iconUrl: 'Images/Icons/fireEventIcon.svg'}),
  firstAid: new BaseIcon({iconUrl: 'Images/Icons/firstAidEventIcon.svg'}),
  flood: new BaseIcon({iconUrl: 'Images/Icons/floodEventIcon.svg'}),
};

function LocationMarker() {
  const [position, setPosition] = useState(null);
  const map = useMap();

  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    });
  }, [map]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>You are here</Popup>
    </Marker>
  );
}

function MapPage() {
  const [zoom, setZoom] = useState(13); // Default zoom level
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.leafletElement.setZoom(zoom);
    }
  }, [zoom]);

  return (
    <ChakraProvider>
      <Box position="relative" height="100vh" width="100%">
        <MapContainer center={[51.505, -0.09]} zoom={zoom} style={{ height: '100%', width: '100%' }} ref={mapRef}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <LocationMarker />
        </MapContainer>
        <Box position="absolute" right="20px" bottom="20px" width="200px" zIndex="10" bgColor="whiteAlpha.600" p="2" borderRadius="md">
        </Box>
      </Box>
    </ChakraProvider>
  );
}

export default MapPage;