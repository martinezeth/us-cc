import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from "@chakra-ui/react";
import { SaasProvider } from '@saas-ui/react';

import HeaderComponent from './Components/headerComponent';
import FooterComponent from './Components/footerComponent';
import LandingPage from './Pages/LandingPage';
import NewReportPage from './Pages/NewReportPage';
import { AuthenticationPage } from './Pages/LoginRegisterPage';

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
            </Routes>
            <FooterComponent />
          </div>
        </Router>
      </ChakraProvider>
    </SaasProvider>
  );
}

export default App;
