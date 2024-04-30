import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Box, ChakraProvider } from '@chakra-ui/react';
import axios from 'axios';

import earthquakeIconUrl from '../Images/Icons/earthquakeEventIcon.svg';
import fireIconUrl from '../Images/Icons/fireEventIcon.svg';
import aidIconUrl from '../Images/Icons/aidEventIcon.svg';
import floodIconUrl from '../Images/Icons/floodEventIcon.svg';
import hailIconUrl from '../Images/Icons/hailEventIcon.svg';
import highWindsIconUrl from '../Images/Icons/highWindEventIcon.svg';
import blizzardIconUrl from '../Images/Icons/blizzardEventIcon.svg';
import lightningIconUrl from '../Images/Icons/lightningEventIcon.svg';

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
    lightningIcon = new baseIcon({iconUrl: lightningIconUrl});


  const mapIcons = {
    earthquake: earthquakeIcon,
    fire: fireIcon,
    firstAid: aidIcon,
    flood: floodIcon,
    hail: hailIcon,
    highWinds: highWindsIcon,
    blizzard: blizzardIcon,
    lightning: lightningIcon,
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

function normalizeIncidentType(type) {
  return type.toLowerCase().replace(/ /g, ''); // Convert to lowercase and remove spaces
}

function MapPage() {
  const [zoom, setZoom] = useState(13); // Default zoom level
  const mapRef = useRef(null);
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/incident-reports')
      .then(response => {
        console.log('Incidents fetched:', response.data); // DEBUG LINE
        response.data.forEach(incident => {
          const normalizedType = normalizeIncidentType(incident.incident_type);
          if (!mapIcons[normalizedType]) {
            console.error("No icon found for incident type:", incident.incident_type);
          }
        });
        setIncidents(response.data);
      })
      .catch(error => 
        console.error("Error fetching incident reports for map view:", error));
  }, []);

  return (
    <ChakraProvider>
      <Box position="relative" height="100vh" width="100%">
        <MapContainer center={[37.819, -122.478]} zoom={zoom} style={{ height: '100%', width: '100%' }} ref={mapRef}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <LocationMarker />
          {incidents.map(incident => {
            const iconType = normalizeIncidentType(incident.incident_type);
            const icon = mapIcons[iconType] || new L.Icon({
              iconUrl: 'path/to/default/icon.svg', // Specifying default icon (Need to do this later)
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34]
            });
            return (
              <Marker
                key={incident.incident_id}
                position={[incident.location_lat, incident.location_lng]}
                icon={icon}
              >
                <Popup>
                  <strong>{incident.incident_type}</strong>
                  <br />
                  {incident.description}
                  <br />
                  Reported at: {new Date(incident.timestamp).toLocaleString()}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
        <Box position="absolute" right="20px" bottom="20px" width="200px" zIndex="10" bgColor="whiteAlpha.600" p="2" borderRadius="md">
        </Box>
      </Box>
    </ChakraProvider>
  );
}


export default MapPage;