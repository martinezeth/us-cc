import React from 'react';

import './Styles/styles.css'
import HeaderComponent from './Components/HeaderComponent';
import FooterComponent from './Components/FooterComponent';
import LandingPage from './Pages/LandingPage';

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
