import React from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';


import './Styles/styles.css'
import HeaderComponent from './components/headerComponent';
import FooterComponent from './components/footerComponent';

import LandingPage from './Pages/LandingPage';
import NewReportPage from './Pages/NewReportPage';

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthenticationPage } from './Pages/LoginRegisterPage';

// import theme from "assets/theme";

function App() {
  return (
    <Router>
      <div className="App">
        <HeaderComponent />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthenticationPage RegoOrLogin="Login" />} />
          <Route path="/register" element={<AuthenticationPage RegoOrLogin="Register" />} />
          <Route path="/newreport" element={<NewReportPage />} />
        </Routes>
        {/* <LandingPage /> */}
        <FooterComponent />
      </div>
    </Router>
  );
}

// Do the routes within this file
// landing page route: just a default route
// login register route: /login and /register (both go to same page, but display different text based on route in component (Is this possible?))
// new report route:  goes to new report page (/newreport)

// 1) Do the routes within App.js file
//  Build out the pages to utilize the components 

export default App;