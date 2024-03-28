import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from '@mui/material';
// import MenuIcon from '@mui/icons-material/Menu';
import Logo from '../Styles/Images/usccLogoDraft.svg';

const HeaderComponent = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        {/* Logo */}
        <IconButton edge="start" color="inherit" aria-label="logo">
          <img src={Logo} alt="logo" style={{ maxHeight: '50px' }} />
        </IconButton>

        {/* Title */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          US Crisis Coordination
        </Typography>

        {/* Spacer to push the rest to the right */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Navigation Links */}
        <Button color="inherit" href="#about">About</Button>
        <Button color="inherit" href="#features">Features</Button>

        {/* Login/Join Now Button */}
        <Button color="inherit" href="#login">Login</Button>
        <Button color="inherit" variant="outlined" href="#join">Join Now</Button>
      </Toolbar>
    </AppBar>
  );
};

export default HeaderComponent;
