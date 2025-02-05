import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from "@chakra-ui/react";
import HeaderComponent from './Components/HeaderComponent';
import FooterComponent from './Components/FooterComponent';
import LandingPage from './Pages/LandingPage';
import NewReportPage from './Pages/NewReportPage';
import MapPage from './Pages/MapViewPage';
import { AuthenticationPage } from './Pages/LoginRegisterPage';
import VolunteerSignupPage from './Pages/VolunteerSignupPage';
import VolunteerDashPage from './Pages/VolunteerDashPage';
import Posts from './Pages/Posts';
import Profile from './Pages/Profile';
import Wildfire from './Pages/WildFire';
import Flood from './Pages/Flood';
import Hurricane from './Pages/Hurricane';
import Earthquake from './Pages/Earthquake';
import AboutPage from './Pages/About';
import OrganizationDashboard from './Pages/OrganizationDashboard';
import MajorIncidentDashboard from './Pages/MajorIncidentDashboard';
import theme from './Styles/theme';
import './Styles/styles.css';
import ResourcesPage from './Pages/ResourcesPage';

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
            <Route path="/about" element={<AboutPage />} />
            <Route path="/newreport" element={<NewReportPage />} />
            <Route path="/posts" element={<Posts />} />
            <Route path='/posts/:username' element={<Posts />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/wildfire" element={<Wildfire />} />
            <Route path="/flood" element={<Flood />} />
            <Route path="/earthquake" element={<Earthquake />} />
            <Route path="/hurricane" element={<Hurricane />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/mapview" element={<MapPage />} />
            <Route path="/volunteering" element={<VolunteerDashPage />} />
            <Route path="/organization-dashboard" element={<OrganizationDashboard />} />
            <Route path="/volunteer-signup" element={<VolunteerSignupPage />} />
            <Route path="/major-incident/:id" element={<MajorIncidentDashboard />} />
          </Routes>
          <div className="footerSpacer"> </div>
          <FooterComponent />
        </div>
      </Router>
    </ChakraProvider>
  );
}

export default App;