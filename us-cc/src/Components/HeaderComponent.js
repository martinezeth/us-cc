import React, { useState, useEffect } from 'react';
import {
  Box, Flex, Button, Image, IconButton, Spacer, Text,
  Link as ChakraLink, Stack, Avatar, Menu, MenuButton,
  MenuList, MenuItem, Drawer, DrawerBody, DrawerHeader,
  DrawerOverlay, DrawerContent, DrawerCloseButton, useDisclosure,
  Icon
} from '@chakra-ui/react';
import { HamburgerIcon, ChevronDownIcon, WarningIcon } from '@chakra-ui/icons';
import { FaUser, FaBuilding, FaSignOutAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../Images/usccLogoDraft.svg';
import DropDown from './Disasters';
import { supabase } from '../supabaseClient';
import CreateIncidentModal from './CreateIncidentModal';

const UserProfileAvatar = ({ user, isOrganization }) => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    // Set initial display name
    setDisplayName(user?.user_metadata?.name || user?.email?.split('@')[0] || '');

    // Listen for profile updates
    const handleProfileUpdate = (event) => {
      setDisplayName(event.detail?.full_name || user?.email?.split('@')[0] || '');
    };

    window.addEventListener('profileUpdate', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdate', handleProfileUpdate);
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Menu>
      <MenuButton>
        <Avatar
          name={displayName}
          size="md"
          bg={isOrganization ? "blue.500" : "gray.500"}
          cursor="pointer"
          _hover={{ transform: 'scale(1.05)' }}
          transition="all 0.2s"
        />
      </MenuButton>
      <MenuList bg="white">
        <MenuItem
          onClick={() => navigate(`/profile/${user?.email?.split('@')[0]}`)}
          icon={<Icon as={FaUser} color="gray.600" />}
          color="gray.700"
          _hover={{ bg: 'gray.100' }}
        >
          View Profile
        </MenuItem>
        {isOrganization && (
          <MenuItem
            onClick={() => navigate('/organization-dashboard')}
            icon={<Icon as={FaBuilding} color="gray.600" />}
            color="gray.700"
            _hover={{ bg: 'gray.100' }}
          >
            Dashboard
          </MenuItem>
        )}
        <MenuItem
          onClick={handleLogout}
          icon={<Icon as={FaSignOutAlt} color="red.500" />}
          color="red.500"
          _hover={{ bg: 'red.50' }}
        >
          Logout
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

const HeaderComponent = () => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [user, setUser] = useState(null);
  const [isOrganization, setIsOrganization] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [isRegisteredVolunteer, setIsRegisteredVolunteer] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setIsOrganization(session.user.user_metadata?.is_organization || false);
      }
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsOrganization(session?.user?.user_metadata?.is_organization || false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleProfileUpdate = (event) => {
      setProfileData(event.detail);
    };

    window.addEventListener('profileUpdate', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdate', handleProfileUpdate);
    };
  }, []);

  useEffect(() => {
    const checkVolunteerStatus = async () => {
        if (user && !isOrganization) {
            const { data, error } = await supabase
                .from('volunteer_signups')
                .select('id')
                .eq('user_id', user.id)
                .single();
                
            setIsRegisteredVolunteer(!!data);
        }
    };
    
    checkVolunteerStatus();
  }, [user, isOrganization]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      localStorage.removeItem('guestMode');
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Box as="nav" bg="blue.600" color="white" paddingY="2" paddingX="4">
      <Flex align="center" justify="space-between">
        {/* Mobile menu toggle */}
        <IconButton
          icon={<HamburgerIcon />}
          onClick={onOpen}
          variant="outline"
          aria-label="Open Menu"
          display={{ base: 'block', md: 'none' }}
        />

        {/* Logo */}
        <ChakraLink as={Link} to="/" display="flex" alignItems="center">
          <Image src={Logo} alt="logo" boxSize="50px" />
          <Text marginLeft="2" fontWeight="bold">Crisis Companion</Text>
        </ChakraLink>

        {/* Desktop menu */}
        <Spacer />
        <Box display={{ base: 'none', md: 'flex' }} alignItems="center">
          <Stack direction="row" spacing={4} alignItems="center">
            <DropDown />
            <Button as={Link} to="/posts" variant="ghost">Posts</Button>
            <Button as={Link} to="/about" variant="ghost">About</Button>

            {user ? (
              <>
                {isOrganization && (
                  <Menu>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />} variant="ghost">
                      Organization
                    </MenuButton>
                    <MenuList bg="blue.600">
                      <MenuItem as={Link} to="/organization-dashboard" bg="blue.600" color="white" _hover={{ bg: 'blue.700' }}>
                        Dashboard
                      </MenuItem>
                    </MenuList>
                  </Menu>
                )}
                {!isOrganization && (
                  <Button 
                    as={Link} 
                    to={isRegisteredVolunteer ? "/volunteering" : "/volunteer-signup"}
                    variant="ghost"
                  >
                    {isRegisteredVolunteer ? "Volunteer Dashboard" : "Become a Volunteer"}
                  </Button>
                )}
                <Button variant="ghost" colorScheme="red" leftIcon={<WarningIcon />} onClick={() => setIsIncidentModalOpen(true)}>
                  Report Incident
                </Button>
                <UserProfileAvatar user={user} isOrganization={isOrganization} />
              </>
            ) : (
              <Button as={Link} to="/login" variant="ghost">Login</Button>
            )}
          </Stack>
        </Box>
      </Flex>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg="blue.700" color="white">
          <DrawerCloseButton />
          <DrawerHeader>Crisis Companion</DrawerHeader>
          <DrawerBody>
            <Stack spacing={4}>
              <DropDown />
              <Button as={Link} to="/posts" variant="ghost" onClick={onClose}>Posts</Button>
              <Button as={Link} to="/about" variant="ghost" onClick={onClose}>About</Button>

              {user ? (
                <>
                  {isOrganization && (
                    <Button as={Link} to="/organization-dashboard" variant="ghost" onClick={onClose}>Dashboard</Button>
                  )}
                  {!isOrganization && (
                    <Button 
                      as={Link} 
                      to={isRegisteredVolunteer ? "/volunteering" : "/volunteer-signup"}
                      variant="ghost"
                    >
                      {isRegisteredVolunteer ? "Volunteer Dashboard" : "Become a Volunteer"}
                    </Button>
                  )}
                  <Button variant="ghost" colorScheme="red" onClick={() => { setIsIncidentModalOpen(true); onClose(); }}>
                    Report Incident
                  </Button>
                  <UserProfileAvatar user={user} isOrganization={isOrganization} />
                  <Button variant="ghost" onClick={() => { handleLogout(); onClose(); }}>Logout</Button>
                </>
              ) : (
                <Button as={Link} to="/login" variant="ghost" onClick={onClose}>Login</Button>
              )}
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <CreateIncidentModal isOpen={isIncidentModalOpen} onClose={() => setIsIncidentModalOpen(false)} />
    </Box>
  );
};

export default HeaderComponent;