import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from "@chakra-ui/react";
import { SaasProvider } from '@saas-ui/react';

import HeaderComponent from './Components/HeaderComponent';
import FooterComponent from './Components/FooterComponent';
import LandingPage from './Pages/LandingPage';
import NewReportPage from './Pages/NewReportPage';
import { AuthenticationPage } from './Pages/LoginRegisterPage';
import Posts from './Pages/Posts';
import Profile from './Pages/Profile';
import Wildfire from './Pages/WildFire';
import Flood from './Pages/Flood';
import Hurricane from './Pages/Hurricane';
import Covid from './Pages/Covid';
import Earthquake from './Pages/Earthquake';

import { baseTheme } from '@saas-ui/react'

function App() {
  return (
    <SaasProvider theme={baseTheme}>
      <ChakraProvider>
        <Router>
          <div className="App">
            <HeaderComponent />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<AuthenticationPage RegoOrLogin="Login" />} />
                <Route path="/register" element={<AuthenticationPage RegoOrLogin="Register" />} />
                <Route path="/newreport" element={<NewReportPage />} />
                <Route path="/posts" element={<Posts/>}/>
                <Route path="/profile" element={<Profile/>} />
                <Route path="/wildfire" element={<Wildfire/>} />
                <Route path="/flood" element={<Flood/>} />
                <Route path="/earthquake" element={<Earthquake/>} />
                <Route path="/hurricane" element={<Hurricane/>} />
                <Route path="/COVID" element={<Covid/>} />
              </Routes>
            <FooterComponent />
          </div>
        </Router>
      </ChakraProvider>
    </SaasProvider>
  );
}

export default App;
