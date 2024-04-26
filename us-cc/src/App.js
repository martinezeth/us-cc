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
import { CookiesProvider, useCookies } from 'react-cookie';

import theme from './Styles/theme';

function App() {


  return (

      <ChakraProvider theme={theme}>
        <Router>
          <div className="App">
            <HeaderComponent />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<AuthenticationPage RegoOrLogin="Login" />} />
              <Route path="/register" element={<AuthenticationPage RegoOrLogin="Register" />} />
              <Route path="/newreport" element={<NewReportPage />} />
              <Route path="*" element={<NotFoundPage />} />
              <Route path="/mapview" element={<MapPage />} />
            </Routes>
            <FooterComponent />
          </div>
        </Router>
      </ChakraProvider>
  );
}

export default App;
