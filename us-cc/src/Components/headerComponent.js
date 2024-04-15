import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from '@mui/material';
import { AuthenticationPage, Login } from '../Pages/LoginRegisterPage';
// import MenuIcon from '@mui/icons-material/Menu';
import Logo from '../Images/usccLogoDraft.svg';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const HeaderComponent = () => {

  const location = useLocation();
  const navigate = useNavigate();

  // Function to handle navigation to different sections of the main page (i.e. Home, About, Features, etc.)
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
    <AppBar position="static">
      <Toolbar>
        {/* Logo */}
        <IconButton edge="start" color="inherit" aria-label="logo" component={Link} to="/">
          <img src={Logo} alt="logo" style={{ maxHeight: '50px' }} />
        </IconButton>

        {/* Title */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          US Crisis Coordination
        </Typography>

        {/* Spacer to push the rest to the right */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Navigation Links */}
    
        <Button color="inherit" onClick={() => handleNavigation('about-section')}>About</Button>
        <Button color="inherit" onClick={() => handleNavigation('features-section')}>Features</Button>

        {/* Login/Join Now Button */}
        <Button color="inherit" component={Link} to="/login">Login</Button>
        <Button color="inherit" component={Link} to="/register">Join Now</Button>
      </Toolbar>
    </AppBar>
  );
};

export default HeaderComponent;
