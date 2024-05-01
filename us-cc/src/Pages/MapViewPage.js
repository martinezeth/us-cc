import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
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
    high_winds: highWindsIcon,
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


      // console.log("Fetching incidents for bounds:", params); // Debug output for the requested coordinate bounds

      axios.get(`http://localhost:5000/api/incident-reports`, { params })
        .then(response => {
          // console.log("Incidents fetched:", response.data); // Debug output for the fetched data
          setIncidents(response.data);
        })
        .catch(error => {
          console.error("Error fetching incidents:", error);
        });
    }
  });

  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      map.flyTo(e.latlng, map.getZoom());
    });
  }, [map]);

  return null;
}

function MapPage() {
  const [incidents, setIncidents] = useState([]);
  const zoom = 13; // Default zoom level

  return (
    <ChakraProvider>
      <Box position="relative" height="100vh" width="100%">
        <MapContainer center={[37.819, -122.478]} zoom={zoom} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <LocationMarker />
          <MapEvents setIncidents={setIncidents} />
          {incidents.map(incident => (
            <Marker
              key={incident.incident_id}
              position={[incident.location_lat, incident.location_lng]}
              icon={mapIcons[incident.incident_type.toLowerCase().replace(/ /g, '_')] || new L.Icon()}
            >
              <Popup>
                <strong>{incident.incident_type}</strong><br />
                {incident.description}<br />
                Reported at: {new Date(incident.timestamp).toLocaleString()}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>
    </ChakraProvider>
  );
}

export default MapPage;