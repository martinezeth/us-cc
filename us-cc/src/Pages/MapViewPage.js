import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import L, { icon } from 'leaflet';
import { Box, ChakraProvider } from '@chakra-ui/react'
import axios from 'axios';

const AccidentIcon = L.Icon.extend({
  options: {
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    iconUrl: '../Images/Icons/accidentEventIcon.svg'
  }
});

const EarthquakeIcon = L.Icon.extend({
  options: {
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    iconUrl: '../Images/Icons/earthquakeEventIcon.svg'
  }
});

const FireIcon = L.Icon.extend({
  options: {
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    iconUrl: '../Images/Icons/fireEventIcon.svg'
  }
});

const FirstAidIcon = L.Icon.extend({
  options: {
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    iconUrl: '../Images/Icons/firstAidEventIcon.svg'
  }
});

const FloodIcon = L.Icon.extend({
  options: {
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    iconUrl: '../Images/Icons/floodEventIcon.svg'
  }
});

const HailIcon = L.Icon.extend({
  options: {
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    iconUrl: '../Images/US-CC-header.png'
    //iconUrl: '../Images/Icons/hailEventIcon.svg'
  }
});

const HighWindsIcon = L.Icon.extend({
  options: {
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    iconUrl: '../Images/Icons/highWindEventIcon.svg'
  }
});

const BlizzardIcon = L.Icon.extend({
  options: {
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    iconUrl: '../Images/Icons/blizzardEventIcon.svg'
  }
});

const LightningIcon = L.Icon.extend({
  options: {
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    iconUrl: '../Images/Icons/lightningEventIcon.svg'
  }
});

const mapIcons = {
  accident: new AccidentIcon(),
  earthquake: new EarthquakeIcon(),
  fire: new FireIcon(),
  firstAid: new FirstAidIcon(),
  flood: new FloodIcon(),
  hail: new HailIcon(),
  highWinds: new HighWindsIcon(),
  blizzard: new BlizzardIcon(),
  lightning: new LightningIcon(),
};
const singleIcon =
  {
    incident_type: "Type B", 
    description: "Description of Type B", 
  location_lat: 38.338075, 
  location_lng: -122.675004
  }
function SingleIconMarker({ incident }) {
  const { location_lat, location_lng, incident_type, description } = incident;

  return (

      <Marker position={[location_lat, location_lng]} icon={mapIcons['hail']}>
        <Popup>
          <strong>{incident_type}</strong>
          <br />
          {description}
          <br />
        </Popup>
      </Marker>
  );
}

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

  // useEffect(() => {
  //   axios.get('http://localhost:5000/api/incident-reports')
  //     .then(response => {
  //       console.log('Incidents fetched:', response.data); // DEBUG LINE
  //       setIncidents([...incidents, ...response.data]);
  //     })
  //     .catch(error => 
  //       console.error("Error fetching incident reports for map view:", error));
  // }, []);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.leafletElement.setZoom(zoom);
    }
  }, [zoom]);

/*   return (
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
*/
return (
  <ChakraProvider>
    <Box position="relative" height="100vh" width="100%">
      <MapContainer center={[37.819, -122.478]} zoom={zoom} style={{ height: '100%', width: '100%' }} ref={mapRef}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker />
        <SingleIconMarker incident={singleIcon} />
        {
        /*incidents.map(incident => (
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
        ))*/}

      </MapContainer>
      <Box position="absolute" right="20px" bottom="20px" width="200px" zIndex="10" bgColor="whiteAlpha.600" p="2" borderRadius="md">
      </Box>
    </Box>
  </ChakraProvider>
);
}

export default MapPage;