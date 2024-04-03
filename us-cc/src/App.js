import React from 'react';

import './Styles/styles.css'
import HeaderComponent from './Components/HeaderComponent';
import BodyComponent from './Components/BodyComponent'; 
import FooterComponent from './Components/FooterComponent';
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
