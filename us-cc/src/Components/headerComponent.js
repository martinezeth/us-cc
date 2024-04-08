import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from '@mui/material';
import { AuthenticationPage, Login } from './LoginRegisterPage';
// import MenuIcon from '@mui/icons-material/Menu';
import Logo from '../Styles/Images/usccLogoDraft.svg';
import {
  BrowserRouter as Router,
  Route,
  Routes} from "react-router-dom";

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
        
            {/* <Switch>
              <Route path="/login">
                <AuthenticationPage RegoOrLogin="Login" /> 
              </Route>
              <Route path="/register">
                <AuthenticationPage RegoOrLogin="Register" /> 
              </Route>
            </Switch> */}
            {/**
             * https://stackoverflow.com/questions/59520261/how-to-append-textquery-to-a-react-router-url
             */}
        <Router>
          <Routes>
            <Route path="/login" element={<AuthenticationPage RegoOrLogin={"Login"}/>}/>
            <Route path="/register" element={<AuthenticationPage RegoOrLogin={"Register"} />} />
          </Routes>
        </Router>

        {/* <Button color="inherit" >Login</Button>
        <Button color="inherit" variant="outlined" >Join Now</Button> */}
      </Toolbar>
    </AppBar>
  );
};

export default HeaderComponent;
