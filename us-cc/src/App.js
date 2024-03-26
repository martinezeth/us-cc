import logo from './logo.svg';

import './Styles/styles.css'
import hearderComponet from './Components/headerComponent';
import bodyComponent from '../src/Components/bodyComponent'; 
import footerComponent from './Components/footerComponent';

function App() {
  return (
    <div className="window">
      
      <div className="headerContainer">
        <headerComponet />
      </div>
      
      <div className="bodyContainer">
        <bodyComponent />
      </div>
      
      <div className="footerContainer">
        <footerComponent />
      </div>      
    
    </div>
  );
}

export default App;
