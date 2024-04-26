import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Box, ChakraProvider } from '@chakra-ui/react'
import axios from 'axios';

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
  hail: new BaseIcon({iconUrl: 'Images/Icons/hailEventIcon.svg'}),
  highWinds: new BaseIcon({iconUrl: 'Images/Icons/highWindEventIcon.svg'}),
  blizzard: new BaseIcon({iconUrl: 'Images/Icons/blizzardEventIcon.svg'}),
  lightning: new BaseIcon({iconUrl: 'Images/Icons/lightningEventIcon.svg'}),
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
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/incident-reports')
      .then(response => {
        console.log('Incidents fetched:', response.data); // DEBUG LINE
        setIncidents(response.data);
      })
      .catch(error => 
        console.error("Error fetching incident reports for map view:", error));
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.leafletElement.setZoom(zoom);
    }
  }, [zoom]);

//   return (
//     <ChakraProvider>
//       <Box position="relative" height="100vh" width="100%">
//         <MapContainer center={[37.819, -122.478]} zoom={zoom} style={{ height: '100%', width: '100%' }} ref={mapRef}>
//           <TileLayer
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//             attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//           />
//           <LocationMarker />
//         </MapContainer>
//         <Box position="absolute" right="20px" bottom="20px" width="200px" zIndex="10" bgColor="whiteAlpha.600" p="2" borderRadius="md">
//         </Box>
//       </Box>
//     </ChakraProvider>
//   );
// }

// export default MapPage;

return (
  <ChakraProvider>
    <Box position="relative" height="100vh" width="100%">
      <MapContainer center={[37.819, -122.478]} zoom={zoom} style={{ height: '100%', width: '100%' }} ref={mapRef}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker />
        {incidents.map(incident => (
          <Marker
            key={incident.incident_id}
            position={[incident.location_lat, incident.location_lng]}
            icon={mapIcons[incident.incident_type] || new L.Icon()}
          >
            <Popup>
              <strong>{incident.incident_type}</strong>
              <br />
              {incident.description}
              <br />
              Reported at: {new Date(incident.timestamp).toLocaleString()}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <Box position="absolute" right="20px" bottom="20px" width="200px" zIndex="10" bgColor="whiteAlpha.600" p="2" borderRadius="md">
      </Box>
    </Box>
  </ChakraProvider>
);
}

export default MapPage;