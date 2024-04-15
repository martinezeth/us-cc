// import React from 'react';
// import { AppBar, Toolbar, Typography, Button, IconButton, Box } from '@mui/material';
// import { AuthenticationPage, Login } from '../Pages/LoginRegisterPage';
// // import MenuIcon from '@mui/icons-material/Menu';
// import Logo from '../Images/usccLogoDraft.svg';
// import { Link, useNavigate, useLocation } from 'react-router-dom';

// const HeaderComponent = () => {

//   const location = useLocation();
//   const navigate = useNavigate();

//   // Function to handle navigation to different sections of the main page (i.e. Home, About, Features, etc.)
//   const handleNavigation = (sectionId) => {
//     if (location.pathname === '/') {
//       scrollToSection(sectionId);
//     } else {
//       navigate("/", { state: { sectionId: sectionId } });
//     }
//   };
  

//   const scrollToSection = (sectionId) => {
//     const section = document.getElementById(sectionId);
//     if (section) {
//       section.scrollIntoView({ behavior: 'smooth', block: 'start' });
//     }
//   };


//   return (
//     <AppBar position="static">
//       <Toolbar>
//         {/* Logo */}
//         <IconButton edge="start" color="inherit" aria-label="logo" component={Link} to="/">
//           <img src={Logo} alt="logo" style={{ maxHeight: '50px' }} />
//         </IconButton>

//         {/* Title */}
//         <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
//           US Crisis Coordination
//         </Typography>

//         {/* Spacer to push the rest to the right */}
//         <Box sx={{ flexGrow: 1 }} />

//         {/* Navigation Links */}
    
//         <Button color="inherit" onClick={() => handleNavigation('about-section')}>About</Button>
//         <Button color="inherit" onClick={() => handleNavigation('features-section')}>Features</Button>

//         {/* Login/Join Now Button */}
//         <Button color="inherit" component={Link} to="/login">Login</Button>
//         <Button color="inherit" component={Link} to="/register">Join Now</Button>
//       </Toolbar>
//     </AppBar>
//   );
// };

// export default HeaderComponent;


import React from 'react';
import { Box, Flex, Button, Image, useDisclosure, IconButton, Spacer, Text, Link as ChakraLink } from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from '../Images/usccLogoDraft.svg';

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
          <Button variant="ghost" onClick={() => handleNavigation('about-section')}>About</Button>
          <Button variant="ghost" onClick={() => handleNavigation('features-section')}>Features</Button>
          <Button variant="ghost" as={Link} to="/login">Login</Button>
          <Button variant="ghost" as={Link} to="/register">Join Now</Button>
        </Box>
      </Flex>
    </Box>
  );
};

export default HeaderComponent;
