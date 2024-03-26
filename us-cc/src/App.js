import logo from './logo.svg';
import bodyComponent from '../src/Components/bodyComponent'; 

function App() {
  return (
    <div className="window">
      
      <div className="headerContainer">
        <div className="headerImage"></div>
        <div className="headerMenu"></div>
        <div className="accountContainer"></div>
      </div>
      
      <div className="bodyContainer">
        <bodyComponent />
      </div>
      
      <div className="footerContainer">
        <div className="footerSection"></div>
        <div className="footerSection"></div>
        <div className="footerSection"></div>
      </div>      
    
    </div>
  );
}

export default App;
