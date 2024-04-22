
import React from 'react';
import { Box, Flex, Button, Image, useDisclosure, IconButton, Spacer, Text, Link as ChakraLink , Stack} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon} from '@chakra-ui/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from '../Images/usccLogoDraft.svg';
import DropDown from './Disasters';

const HeaderComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Function to handle navigation to different sections of the main page
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

  return (
    <Box as="nav" bg="blue.600" color="white" paddingY="2" paddingX="4">
      <Flex align="center" justify="space-between">
        {/* Logo and Hamburger Menu */}
        <IconButton
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          onClick={isOpen ? onClose : onOpen}
          variant="outline"
          aria-label="Open Menu"
          display={{ md: 'none' }}
        />
        <ChakraLink as={Link} to="/" display="flex" alignItems="center">
          <Image src={Logo} alt="logo" boxSize="50px" />
          <Text marginLeft="2" fontWeight="bold">US Crisis Coordination</Text>
        </ChakraLink>
        
        {/* Spacer */}
        <Spacer />

        {/* Navigation Links */}
        <Box display={{ base: isOpen ? "block" : "none", md: "flex" }} alignItems="center">
          <Stack direction="row" spacing={4} justifyContent="left">
            <DropDown/>
            <Button  padding="8px 16px" variant="ghost" as={Link} to="/posts">Posts</Button>
            <Button  padding="8px 16px" variant ="ghost" as={Link} to="/profile">Profile</Button>
            <Button  padding="8px 16px" variant="ghost" onClick={() => handleNavigation('about-section')}>About</Button>
            <Button  padding="8px 16px" variant="ghost" onClick={() => handleNavigation('features-section')}>Features</Button>
            <Button  padding="8px 16px" variant="ghost" as={Link} to="/login">Login</Button>
            <Button  padding="8px 16px" variant="ghost" as={Link} to="/register">Join Now</Button>
          </Stack>
        </Box>
      </Flex>
    </Box>
  );
};

export default HeaderComponent;
