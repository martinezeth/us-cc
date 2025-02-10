import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Box, ChakraProvider, VStack, Text, Button, Select, HStack, Badge } from '@chakra-ui/react';
import { supabase } from '../supabaseClient';
import earthquakeIconUrl from '../Images/Icons/earthquakeEventIcon.svg';
import fireIconUrl from '../Images/Icons/fireEventIcon.svg';
import aidIconUrl from '../Images/Icons/aidEventIcon.svg';
import floodIconUrl from '../Images/Icons/floodEventIcon.svg';
import hailIconUrl from '../Images/Icons/hailEventIcon.svg';
import windyIconUrl from '../Images/Icons/windyEventIcon.svg';
import blizzardIconUrl from '../Images/Icons/blizzardEventIcon.svg';
import lightningIconUrl from '../Images/Icons/lightningEventIcon.svg';
import mapCurrentLocation from '../Images/Icons/mapCurrentLocation.svg';
import { INCIDENT_TYPES } from '../constants/incidentTypes';
import VerifiedBadge from '../Components/VerifiedBadge';
import { useNavigate } from 'react-router-dom';
import { getProfileUsername } from '../Components/ProfileHelpers';
import { handleProfileClick } from '../utils/navigationHelpers';

const baseIcon = L.Icon.extend({
  options: {
    iconSize: [40, 40],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  }
});

const currentLocationIcon = new L.Icon({
  iconUrl: mapCurrentLocation,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

const mapIcons = {
  earthquake: new baseIcon({ iconUrl: earthquakeIconUrl }),
  fire: new baseIcon({ iconUrl: fireIconUrl }),
  firstAid: new baseIcon({ iconUrl: aidIconUrl }),
  flood: new baseIcon({ iconUrl: floodIconUrl }),
  hail: new baseIcon({ iconUrl: hailIconUrl }),
  windy: new baseIcon({ iconUrl: windyIconUrl }),
  blizzard: new baseIcon({ iconUrl: blizzardIconUrl }),
  lightning: new baseIcon({ iconUrl: lightningIconUrl }),
};

const MILES_TO_METERS = 1609.34;

const ListView = ({ incidents }) => {
  const navigate = useNavigate();

  const getLocationDisplay = (incident) => {
    if (incident.city && incident.state) {
      return `${incident.city}, ${incident.state}`;
    } else if (incident.city) {
      return incident.city;
    } else {
      return `(${incident.location_lat.toFixed(2)}, ${incident.location_lng.toFixed(2)})`;
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      {incidents.map(incident => (
        <Box
          key={incident.id}
          p={5}
          shadow="md"
          borderWidth="1px"
          borderRadius="md"
          bg="white"
          _hover={{ shadow: 'lg' }}
        >
          <HStack spacing={3} align="flex-start">
            <Box>
              <img
                src={mapIcons[incident.incident_type]?.options?.iconUrl || earthquakeIconUrl}
                alt={incident.incident_type}
                style={{ width: '30px', height: '30px' }}
              />
            </Box>
            <Box flex="1">
              <Text fontSize="xl" fontWeight="bold">
                {INCIDENT_TYPES[incident.incident_type] || incident.incident_type}
              </Text>
              {incident.created_by_user && (
                <HStack spacing={2} mt={1}>
                  <Text
                    fontSize="sm"
                    color="blue.500"
                    cursor="pointer"
                    onClick={(e) => handleProfileClick(e, incident.created_by_user, navigate)}
                    _hover={{ textDecoration: 'underline' }}
                  >
                    {incident.created_by_user.display_name}
                  </Text>
                  {incident.created_by_user?.is_organization && (
                    <VerifiedBadge size="14px" />
                  )}
                </HStack>
              )}
              <Text mt={2}>{incident.description}</Text>
              <HStack spacing={4} mt={4}>
                <Text fontSize="sm" color="gray.600">
                  Reported at: {new Date(incident.timestamp).toLocaleString()}
                </Text>
                <Badge colorScheme="blue">
                  📍 {getLocationDisplay(incident)}
                </Badge>
              </HStack>
            </Box>
          </HStack>
        </Box>
      ))}
    </VStack>
  );
};

function LocationMarker() {
  const [position, setPosition] = useState(null);
  const map = useMapEvents({
    locationfound: (e) => {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    }
  });

  useEffect(() => {
    map.locate();
  }, [map]);

  return position === null ? null : (
    <Marker position={position} icon={currentLocationIcon}>
      <Popup>You are here</Popup>
    </Marker>
  );
}

const ReturnToLocationButton = () => {
  const map = useMap();

  const handleClick = () => {
    map.locate().on('locationfound', function (e) {
      map.flyTo(e.latlng, map.getZoom());
    });
  };

  return (
    <div className="leaflet-bottom leaflet-right"
      style={{
        marginBottom: window.matchMedia("(max-width: 768px)").matches ? "60px" : "20px",
        marginRight: window.matchMedia("(max-width: 768px)").matches ? "5px" : "10px"
      }}>
      <Button
        onClick={handleClick}
        className="leaflet-control"
        leftIcon={<img src={mapCurrentLocation} alt="" style={{ width: '20px', height: '20px' }} />}
        colorScheme="blue"
        size={{ base: "sm", md: "md" }}
        px={{ base: 2, md: 4 }}
      >
        {window.matchMedia("(max-width: 768px)").matches ? "" : "My Location"}
      </Button>
    </div>
  );
};

function MapEvents({ setIncidents, radius }) {
  const map = useMapEvents({
    moveend: async () => {
      const bounds = map.getBounds();
      const { swLat, swLng, neLat, neLng } = {
        swLat: bounds.getSouthWest().lat,
        swLng: bounds.getSouthWest().lng,
        neLat: bounds.getNorthEast().lat,
        neLng: bounds.getNorthEast().lng
      };

      try {
        // Fetch regular incidents
        const { data: incidentsData, error } = await supabase
          .from('incidents')
          .select('*')
          .gte('location_lat', swLat)
          .lte('location_lat', neLat)
          .gte('location_lng', swLng)
          .lte('location_lng', neLng);

        if (error) throw error;

        // Fetch major incidents - add status filter and is_deleted check
        const { data: majorIncidentsData, error: majorError } = await supabase
          .from('major_incidents')
          .select('*')
          .gte('location_lat', swLat)
          .lte('location_lat', neLat)
          .gte('location_lng', swLng)
          .lte('location_lng', neLng)
          .eq('status', 'active')
          .eq('is_deleted', false);

        if (majorError) throw majorError;

        // Filter out any incidents without valid IDs
        const validIncidentsData = incidentsData.filter(incident => incident && incident.id);
        const validMajorIncidentsData = majorIncidentsData.filter(incident => incident && incident.id);

        // Get unique user IDs from both types of incidents
        const userIds = [
          ...new Set([
            ...validIncidentsData.map(incident => incident.created_by),
            ...validMajorIncidentsData.map(incident => incident.created_by)
          ])
        ].filter(Boolean); // Filter out any null/undefined user IDs

        // Fetch profiles for these users
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, organization_name')
          .in('id', userIds);

        // Create a map of user profiles
        const userProfiles = {};
        profiles?.forEach(profile => {
          userProfiles[profile.id] = {
            ...profile,
            is_organization: !!profile.organization_name,
            display_name: profile.organization_name || profile.full_name,
            username: getProfileUsername(profile)
          };
        });

        // Combine regular incidents with user profiles
        const enrichedIncidents = validIncidentsData.map(incident => ({
          ...incident,
          created_by_user: userProfiles[incident.created_by] || null,
          isMajorIncident: false
        }));

        // Add major incidents with user profiles
        const enrichedMajorIncidents = validMajorIncidentsData.map(incident => ({
          ...incident,
          created_by_user: userProfiles[incident.created_by] || null,
          isMajorIncident: true,
          incident_type: 'major_incident'
        }));

        // Combine both types of incidents
        setIncidents([...enrichedIncidents, ...enrichedMajorIncidents]);

      } catch (error) {
        console.error("Error fetching incidents:", error);
      }
    }
  });

  return null;
}

const MajorIncidentCircle = ({ incident }) => {
  const map = useMap();

  return (
    <Circle
      center={[incident.location_lat, incident.location_lng]}
      radius={incident.radius_miles * MILES_TO_METERS}
      color="red"
      fillColor="red"
      fillOpacity={0.2}
      eventHandlers={{
        click: () => {
          const popup = L.popup()
            .setLatLng([incident.location_lat, incident.location_lng])
            .setContent(`
              <div style="min-width: 200px;">
                <h3 style="font-weight: bold; margin-bottom: 8px;">
                  Major Incident: ${incident.title}
                </h3>
                <p style="margin-bottom: 8px;">${incident.description}</p>
                <p style="color: #666; font-size: 0.9em; margin-bottom: 8px;">
                  Impact Radius: ${incident.radius_miles} miles
                </p>
                <a href="#/major-incident/${incident.id}" 
                   style="color: #3182CE; text-decoration: underline;">
                  View Dashboard
                </a>
              </div>
            `);
          popup.openOn(map);
        }
      }}
    />
  );
};

function MapViewPage() {
  const [incidents, setIncidents] = useState([]);
  const [showList, setShowList] = useState(false);
  const [radius, setRadius] = useState('10');
  const [position, setPosition] = useState(null);
  const [key, setKey] = useState(Date.now());
  const zoom = 13;
  const navigate = useNavigate();
  const [incidentCreators, setIncidentCreators] = useState({});

  useEffect(() => {
    console.log('Requesting current position...');
    navigator.geolocation.getCurrentPosition(function (pos) {
      console.log('Position found:', pos.coords);
      setPosition({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });
    });
  }, []);

  const fetchIncidentCreator = async (userId) => {
    try {
      const { data: { user } } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      return user;
    } catch (error) {
      console.error('Error fetching incident creator:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchIncidents = async () => {
      if (position) {
        try {
          // First, fetch incidents
          const { data: incidentsData, error } = await supabase
            .from('incidents')
            .select('*')
            .gte('location_lat', position.lat - radius / 69)
            .lte('location_lat', position.lat + radius / 69)
            .gte('location_lng', position.lng - radius / (69 * Math.cos(position.lat * (Math.PI / 180))))
            .lte('location_lng', position.lng + radius / (69 * Math.cos(position.lat * (Math.PI / 180))));

          if (error) throw error;

          // Get unique user IDs from incidents
          const userIds = [...new Set(incidentsData.map(incident => incident.created_by))];

          // Fetch profiles for these users
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, organization_name')
            .in('id', userIds);

          // Create a map of user profiles
          const userProfiles = {};
          profiles?.forEach(profile => {
            userProfiles[profile.id] = {
              ...profile,
              is_organization: !!profile.organization_name,
              display_name: profile.organization_name || profile.full_name,
              username: getProfileUsername(profile)
            };
          });

          // Combine incident data with user profiles
          const enrichedIncidents = incidentsData.map(incident => ({
            ...incident,
            created_by_user: userProfiles[incident.created_by] || null
          }));

          setIncidents(enrichedIncidents);
        } catch (error) {
          console.error('Error fetching incidents:', error);
        }
      }
    };

    fetchIncidents();
  }, [radius, position]);

  const handleRadiusChange = async (newRadius) => {
    setRadius(newRadius);
    if (position) {
      try {
        const { data, error } = await supabase
          .from('incidents')
          .select('*')
          .gte('location_lat', position.lat - newRadius / 69)
          .lte('location_lat', position.lat + newRadius / 69)
          .gte('location_lng', position.lng - newRadius / (69 * Math.cos(position.lat * (Math.PI / 180))))
          .lte('location_lng', position.lng + newRadius / (69 * Math.cos(position.lat * (Math.PI / 180))));

        if (error) throw error;
        setIncidents(data);
      } catch (error) {
        console.error("Error changing radius:", error);
      }
    }
  }

  return (
    <ChakraProvider>
      <Box
        height={{ base: "calc(100vh - 140px)", md: "calc(100vh - 160px)" }}
        position="relative"
        display="flex"
        flexDirection="column"
        bg="gray.50"
        marginBottom="-1px"
      >
        {/* Responsive toggle button */}
        <Button
          position="absolute"
          top={{ base: "2", md: "4" }}
          right={{ base: "2", md: "4" }}
          zIndex="1000"
          colorScheme="blue"
          size={{ base: "xs", md: "sm" }}
          boxShadow="md"
          onClick={() => setShowList(!showList)}
        >
          {showList ? 'Show Map View' : 'Show List View'}
        </Button>

        {showList ? (
          <VStack
            spacing={4}
            p={{ base: 2, md: 4 }}
            flex="1"
            overflowY="auto"
            width="100%"
          >
            <Select
              placeholder="Select radius"
              value={radius}
              onChange={e => handleRadiusChange(e.target.value)}
              width={{ base: "150px", md: "200px" }}
              size={{ base: "sm", md: "md" }}
            >
              <option value="3">3 miles</option>
              <option value="5">5 miles</option>
              <option value="10">10 miles</option>
              <option value="20">20 miles</option>
            </Select>
            <ListView incidents={incidents} />
          </VStack>
        ) : (
          <Box flex="1" height="100%">
            <MapContainer
              key={`map-container-${key}`}
              center={position || [37.819, -122.478]}
              zoom={zoom}
              style={{ height: '100%', width: '100%' }}
              zoomControl={!window.matchMedia("(max-width: 768px)").matches}
            >
              <TileLayer
                key={`tile-layer-${key}`}
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {incidents.map(incident =>
                incident.isMajorIncident ? (
                  <MajorIncidentCircle key={`major-incident-${incident.id}`} incident={incident} />
                ) : (
                  <Marker
                    key={`regular-incident-${incident.id}`}
                    position={[incident.location_lat, incident.location_lng]}
                    icon={mapIcons[incident.incident_type] || new L.Icon.Default()}
                  >
                    <Popup>
                      <Box p={1}>
                        <Text fontWeight="bold">
                          {INCIDENT_TYPES[incident.incident_type] || incident.incident_type}
                        </Text>
                        <Text fontSize={{ base: "sm", md: "md" }}>{incident.description}</Text>
                        {incident.created_by_user && (
                          <HStack spacing={2} mt={2}>
                            <Text
                              fontSize="sm"
                              color="blue.500"
                              cursor="pointer"
                              onClick={(e) => handleProfileClick(e, incident.created_by_user, navigate)}
                              _hover={{ textDecoration: 'underline' }}
                            >
                              {incident.created_by_user.display_name}
                            </Text>
                            {incident.created_by_user?.is_organization && (
                              <VerifiedBadge size="14px" />
                            )}
                          </HStack>
                        )}
                        <Text fontSize="sm" color="gray.600">
                          Reported at: {new Date(incident.timestamp).toLocaleString()}
                        </Text>
                      </Box>
                    </Popup>
                  </Marker>
                )
              )}
              <LocationMarker key={`location-marker-${key}`} />
              <MapEvents key={`map-events-${key}`} setIncidents={setIncidents} radius={radius} />
              <ReturnToLocationButton key="return-button" />
            </MapContainer>
          </Box>
        )}
      </Box>
    </ChakraProvider>
  );
}

export default MapViewPage;