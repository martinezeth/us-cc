import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from "@chakra-ui/react";

import HeaderComponent from './Components/HeaderComponent';
import FooterComponent from './Components/FooterComponent';
import LandingPage from './Pages/LandingPage';
import NewReportPage from './Pages/NewReportPage';
import NotFoundPage from './Pages/NotFoundPage';
import MapPage from './Pages/MapViewPage';
import { AuthenticationPage } from './Pages/LoginRegisterPage';
import Posts from './Pages/Posts';
import Profile from './Pages/Profile';
import Wildfire from './Pages/WildFire';
import Flood from './Pages/Flood';
import Hurricane from './Pages/Hurricane';
import Covid from './Pages/Covid';
import Earthquake from './Pages/Earthquake';
import { CookiesProvider, useCookies } from 'react-cookie';

import theme from './Styles/theme';
import ResourcesPage from './Pages/ResourcesPage';

function App() {


  return (

      <ChakraProvider theme={theme}>
        <Router>
          <div className="App">
            <HeaderComponent />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path='*' element={<NotFoundPage />} />
                <Route path="/login" element={<AuthenticationPage RegoOrLogin="Login" />} />
                <Route path="/register" element={<AuthenticationPage RegoOrLogin="Register" />} />
                <Route path="/newreport" element={<NewReportPage />} />
                <Route path="/posts" element={<Posts/>}/>
                <Route path="/profile/:username" element={<Profile/>} />
                <Route path='/mapview' element={<MapPage />} />
                <Route path="/wildfire" element={<Wildfire/>} />
                <Route path="/flood" element={<Flood/>} />
                <Route path="/earthquake" element={<Earthquake/>} />
                <Route path="/hurricane" element={<Hurricane/>} />
                <Route path="/resources" element={<ResourcesPage />} />
              </Routes>
            <FooterComponent />
          </div>
        </Router>
      </ChakraProvider>
  );
}

export default App;
