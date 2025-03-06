import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './styles/scifi-theme.css';
import './styles/animations.css';

// Custom Components
import SciFiBackground from './components/SciFiBackground';

// Components
import AppNavbar from './components/Navbar';

// Pages
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import ProductForm from './pages/ProductForm';
import WasteTracking from './pages/WasteTracking';
import Analytics from './pages/Analytics';
import Scanner from './pages/Scanner';
import Customers from './pages/Customers';
import Categories from './pages/Categories';
import NotFound from './pages/NotFound';

// Sound Effects
import soundEffects from './utils/soundEffects';

// Wrapper component for animated page transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  
  // Play sound effect on route change
  useEffect(() => {
    soundEffects.play('click');
  }, [location.pathname]);

  return (
    <div className="route-container">
      <Routes location={location}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/inventory/add" element={<ProductForm />} />
        <Route path="/inventory/edit/:id" element={<ProductForm />} />
        <Route path="/waste-tracking" element={<WasteTracking />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

// Main Application Component
function App() {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial loading for animation
  useEffect(() => {
    // Play startup sound
    soundEffects.play('notification');
    
    // Custom welcome toast with sci-fi styling
    setTimeout(() => {
      toast.info('System initialized. Welcome back, Commander.', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: 'bg-dark text-light',
        bodyClassName: 'text-light',
        progressClassName: 'bg-info',
        icon: "🚀"
      });
    }, 1500);
    
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <SciFiBackground />
        
        {isLoading ? (
          // Loading Animation
          <div className="loading-screen d-flex flex-column justify-content-center align-items-center min-vh-100">
            <div 
              className="text-center text-light mb-4 fade-in"
              style={{ 
                fontSize: '2rem', 
                letterSpacing: '3px',
                fontFamily: "'Orbitron', sans-serif" 
              }}
            >
              WASTE<span style={{ color: 'var(--primary-color)' }}>SYNC</span>
            </div>
            <div className="loading-bar-container">
              <div className="loading-bar"></div>
            </div>
            <div 
              className="text-light mt-3 fade-in" 
              style={{ 
                animationDelay: '0.3s',
                fontSize: '0.8rem',
                opacity: 0.7
              }}
            >
              INITIALIZING SYSTEM...
            </div>
          </div>
        ) : (
          // Main Application Content
          <>
            <AppNavbar />
            <Container className="flex-grow-1 py-3">
              <AnimatedRoutes />
            </Container>
            <footer className="text-center py-3 slide-up-animation" style={{ 
              background: 'rgba(10, 10, 20, 0.8)',
              backdropFilter: 'blur(10px)',
              borderTop: '1px solid var(--primary-color)',
              boxShadow: '0 -4px 20px rgba(0, 188, 212, 0.2)',
              color: 'var(--light-text)'
            }}>
              <Container>
                <div className="d-flex justify-content-center align-items-center">
                  <p className="mb-0" style={{ color: 'var(--primary-color)', letterSpacing: '1px' }}>
                    <span style={{ fontWeight: 'bold' }}>WASTE MANAGEMENT</span> | AUTOMATION SYSTEM &copy; {new Date().getFullYear()}
                  </p>
                  
                  {/* Sound effect toggle icon */}
                  <div 
                    className="ms-3 small cursor-pointer" 
                    onClick={() => {
                      const newState = soundEffects.toggleMute();
                      toast.info(newState ? '🔇 Sound effects muted' : '🔊 Sound effects enabled', {
                        autoClose: 1000,
                        position: "bottom-center"
                      });
                    }}
                    style={{ opacity: 0.7 }}
                  >
                    <span className="badge bg-dark hover-scale">
                      {localStorage.getItem('soundEffects') === 'muted' ? '🔇' : '🔊'}
                    </span>
                  </div>
                </div>
              </Container>
            </footer>
          </>
        )}
      </div>

      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        theme="dark"
        toastClassName="bg-dark text-light"
        progressClassName="bg-info"
      />
    </Router>
  );
}

export default App;
