import React, { useState, useEffect } from 'react';
import { Box, Flex, Button, Image, useDisclosure, IconButton, Spacer, Text, Link as ChakraLink , Stack, Avatar} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon} from '@chakra-ui/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import Logo from '../Images/usccLogoDraft.svg';
import DropDown from './Disasters';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const UserProfileAvatar = ({ username }) => {
  const initials = username.substring(1,2).toUpperCase();

  return (
    <Link to={`/profile/${username}`}>
      <Avatar name={username} size="md">
        {initials}
      </Avatar>
    </Link>
  );
};

const HeaderComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [cookies, removeCookie] = useCookies(['authToken']);
  const [username, setUsername] = useState('');
  
  useEffect(() => {
    // Decode the JWT token to get user data
    if (cookies.authToken) {
      const decodedToken = jwtDecode(cookies.authToken);
      setUsername(decodedToken.username);
    }
    else {
      setUsername(null);
    }
  }, [cookies.authToken]);


  const handleNavigation = (sectionId) => {
    if (location.pathname === '/') {
      scrollToSection(sectionId);
    } else {
      navigate("/", { state: { sectionId: sectionId } });
    }
  };

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLogout = () => {
    axios.post('http://localhost:8000/api/logout')
      .then((response) => {
        // console.log(response.data); 
        // Remove the authToken cookie
        document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'; 
      })
      .catch((error) => {
        console.error('Logout failed:', error);
      });
  };

  return (
    <Box as="nav" bg="blue.600" color="white" paddingY="2" paddingX="4">
      <Flex align="center" justify="space-between">
        <IconButton
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          onClick={isOpen ? onClose : onOpen}
          variant="outline"
          aria-label="Open Menu"
          display={{ md: 'none' }}
        />
        <ChakraLink as={Link} to="/" display="flex" alignItems="center">
          <Image src={Logo} alt="logo" boxSize="50px" />
          <Text marginLeft="2" fontWeight="bold">Crisis Companion</Text>
        </ChakraLink>
        
        {/* Spacer */}
        <Spacer />

        {/* Navigation Links */}
        <Box display={{ base: isOpen ? "block" : "none", md: "flex" }} alignItems="center">
          <Stack direction="row" spacing={4} justifyContent="left">
            <DropDown/>
            <Button  padding="8px 16px" variant="ghost" as={Link} to="/posts">Posts</Button>
            {/* <Button  padding="8px 16px" variant="ghost" onClick={() => handleNavigation('about-section')}>About</Button> */}
            {username ? (
              
              <>
                <UserProfileAvatar username={username} />
                <Button padding={"8px 16px"} variant="ghost" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Button padding="8px 16px" variant="ghost" as={Link} to="/login">Login</Button>
              </>
            )}
          </Stack>
        </Box>
      </Flex>
    </Box>
  );
};

export default HeaderComponent;
