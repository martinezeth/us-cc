import React from 'react';

import './Styles/styles.css'
import HeaderComponent from './Components/headerComponent';
import BodyComponent from './Components/bodyComponent'; 
import FooterComponent from './Components/footerComponent';

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
