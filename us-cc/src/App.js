import React from 'react';

import './Styles/styles.css'
import HeaderComponent from './Components/HeaderComponent';
import BodyComponent from './Components/BodyComponent'; 
import FooterComponent from './Components/FooterComponent';

function App() {
  return (
    <div className="window">
      
      <div className="headerContainer">
        <HeaderComponent />
      </div>
      
      <div className="bodyContainer">
        <BodyComponent />
      </div>
      
      <div className="footerContainer">
        <FooterComponent />
      </div>      
    
    </div>
  );
}

export default App;
