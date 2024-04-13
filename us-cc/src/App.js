import React from 'react';


import './Styles/styles.css'
import HeaderComponent from './components/headerComponent';
import FooterComponent from './components/footerComponent';
// import LandingPage from './components/LandingPage/LandingPage';
import LandingPage from './Pages/LandingPage';

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// import theme from "assets/theme";

function App() {
  return (
    <div className="App">
      <HeaderComponent />
      <LandingPage />
      <FooterComponent />
    </div>
  );
}

export default App;
