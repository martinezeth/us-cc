import React from 'react';

import './Styles/styles.css'
import HeaderComponent from './Components/headerComponent';
import BodyComponent from './Components/bodyComponent'; 
import FooterComponent from './Components/footerComponent';
import LandingPage from './Components/LandingPage/LandingPage';

function App() {
  return (
    <div className="App">
      <HeaderComponent />
      <LandingPage />
      <BodyComponent />
      <FooterComponent />
    </div>
  );
}

export default App;
