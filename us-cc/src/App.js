import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from "@chakra-ui/react";
import { SaasProvider } from '@saas-ui/react';

import HeaderComponent from './Components/HeaderComponent';
import FooterComponent from './Components/FooterComponent';
import LandingPage from './Pages/LandingPage';
import NewReportPage from './Pages/NewReportPage';
import NotFoundPage from './Pages/NotFoundPage';
import { AuthenticationPage } from './Pages/LoginRegisterPage';
import { CookiesProvider, useCookies } from 'react-cookie';

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
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <FooterComponent />
          </div>
        </Router>
      </ChakraProvider>
    </SaasProvider>
  );
}

export default App;
