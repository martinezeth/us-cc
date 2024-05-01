import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Box, ChakraProvider, VStack, Text, Button, Select } from '@chakra-ui/react';
import { Icons } from '@chakra-ui/icons';
import axios from 'axios';

import earthquakeIconUrl from '../Images/Icons/earthquakeEventIcon.svg';
import fireIconUrl from '../Images/Icons/fireEventIcon.svg';
import aidIconUrl from '../Images/Icons/aidEventIcon.svg';
import floodIconUrl from '../Images/Icons/floodEventIcon.svg';
import hailIconUrl from '../Images/Icons/hailEventIcon.svg';
import highWindsIconUrl from '../Images/Icons/highWindEventIcon.svg';
import blizzardIconUrl from '../Images/Icons/blizzardEventIcon.svg';
import lightningIconUrl from '../Images/Icons/lightningEventIcon.svg';
import locationIconUrl from '../Images/Icons/locationIcon.svg';

var baseIcon = L.Icon.extend({
  options: {
    iconSize: [40,40],
    iconAnchor: [12,41],
    popupAnchor: [1,-34]
  }
});

var earthquakeIcon = new baseIcon({iconUrl: earthquakeIconUrl}),
    fireIcon = new baseIcon({iconUrl: fireIconUrl}),
    aidIcon = new baseIcon({iconUrl: aidIconUrl}),
    floodIcon = new baseIcon({iconUrl: floodIconUrl}),
    hailIcon = new baseIcon({iconUrl: hailIconUrl}),
    highWindsIcon = new baseIcon({iconUrl: highWindsIconUrl}),
    blizzardIcon = new baseIcon({iconUrl: blizzardIconUrl}),
    lightningIcon = new baseIcon({iconUrl: lightningIconUrl}),
    locationIcon = new baseIcon({iconUrl: locationIconUrl});


  const mapIcons = {
    location: locationIcon,
    earthquake: earthquakeIcon,
    fire: fireIcon,
    firstAid: aidIcon,
    flood: floodIcon,
    hail: hailIcon,
    high_winds: highWindsIcon,
    blizzard: blizzardIcon,
    lightning: lightningIcon,
  };


  const ListView = ({ incidents }) => (
    <VStack spacing={4} align="stretch">
      {incidents.map(incident => (
        <Box key={incident.incident_id} p={5} shadow="md" borderWidth="1px">
          <Text fontSize="xl">{incident.incident_type}</Text>
          <Text mt={4}>{incident.description}</Text>
          <Text mt={2}>Reported at: {new Date(incident.timestamp).toLocaleString()}</Text>
          <Text mt={2}>Location: ({incident.location_lat.toFixed(2)}, {incident.location_lng.toFixed(2)})</Text>
        </Box>
      ))}
    </VStack>
  );

function LocationMarker() {
  const map = useMapEvents({
    locationfound: (e) => {
      map.flyTo(e.latlng, map.getZoom());
      L.marker(e.latlng).addTo(map).bindPopup("You are here").openPopup();
    }
  });

  useEffect(() => {
    map.locate();
  }, [map]);

  return null;
}

function MapEvents({ setIncidents }) {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      const params = {
        swLat: bounds.getSouthWest().lat,
        swLng: bounds.getSouthWest().lng,
        neLat: bounds.getNorthEast().lat,
        neLng: bounds.getNorthEast().lng,
      };
      axios.get(`http://localhost:8000/api/incident-reports`, { params })
        .then(response => setIncidents(response.data))
        .catch(error => console.error("Error fetching incidents:", error));
    }
  });

  return null;
}

function RecenterButton({ position }) {
  const map = useMapEvents({});
  const handleClick = () => {
    if (map && position) {
      map.flyTo([position.lat, position.lng], map.getZoom());
    }
  };

  return (
    <Button onClick={handleClick} position="absolute" top="10px" right="10px" zIndex="1000" background="white" p="2">
      <img src={locationIconUrl} alt="Locate me" style={{ width: '24px', height: '24px' }} />
    </Button>
  );
}

function MapPage() {
  const [incidents, setIncidents] = useState([]);
  const [showList, setShowList] = useState(false);
  const [radius, setRadius] = useState('10');
  const [position, setPosition] = useState(null);
  const zoom = 13;

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(function(pos) {
      setPosition({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });
    });
  }, []);

  return (
    <ChakraProvider>
      <Box position="relative" height="100vh" width="100%">
        <Button onClick={() => setShowList(!showList)} mb={4}>
          {showList ? 'Show Map View' : 'Show List View'}
        </Button>
        {showList ? (
          <>
            <Select placeholder="Select radius" value={radius} onChange={e => setRadius(e.target.value)} mb={4}>
              <option value="3">3 miles</option>
              <option value="5">5 miles</option>
              <option value="10">10 miles</option>
              <option value="20">20 miles</option>
            </Select>
            <ListView incidents={incidents} />
          </>
        ) : (
          <MapContainer center={[37.819, -122.478]} zoom={zoom} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <LocationMarker />
            <MapEvents setIncidents={setIncidents} />
            {position && <RecenterButton position={position} />}
            {incidents.map(incident => (
              <Marker key={incident.incident_id}
                position={[incident.location_lat, incident.location_lng]}
                icon={mapIcons[incident.incident_type.toLowerCase().replace(/ /g, '_')] || new L.Icon()}>
                <Popup>
                  <strong>{incident.incident_type}</strong><br />
                  {incident.description}<br />
                  Reported at: {new Date(incident.timestamp).toLocaleString()}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </Box>
    </ChakraProvider>
  );
}

export default MapPage;
