import logo from './logo.svg';
import './App.css';
import Navrbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Footer from './components/layout/Footer';
function App() {
  return (
  <div className='app'>
    <Navrbar/>
   <div className=''>
      <Landing/>
    </div>
    <Footer/>
  </div>
  );
}

export default App;
