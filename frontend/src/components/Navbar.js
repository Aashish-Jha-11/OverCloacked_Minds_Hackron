import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Badge, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaRecycle, FaBoxOpen, FaChartBar, FaBarcode, FaUsers, 
  FaRocket, FaCircle, FaTags, FaVolumeUp, FaVolumeMute 
} from 'react-icons/fa';
import soundEffects from '../utils/soundEffects';
import SoundSettingsControl from './SoundSettingsControl';
import '../styles/animations.css';

const AppNavbar = () => {
  const location = useLocation();
  const [activeNavItem, setActiveNavItem] = useState(location.pathname);

  // Detect route changes and update active nav item with animation
  useEffect(() => {
    setActiveNavItem(location.pathname);
  }, [location.pathname]);

  const handleNavClick = (path) => {
    soundEffects.playClick();
    setActiveNavItem(path);
  };

  const handleNavHover = () => {
    soundEffects.playHover();
  };

  // Function to render tooltip for nav items
  const renderTooltip = (text) => (props) => (
    <Tooltip id={`tooltip-${text.toLowerCase()}`} {...props}>
      {text}
    </Tooltip>
  );

  return (
    <Navbar expand="lg" className="mb-4 sticky-top navbar-dark">
      <Container>
        <Navbar.Brand 
          as={Link} 
          to="/" 
          className="d-flex align-items-center hover-scale"
          onClick={() => handleNavClick('/')}
          onMouseEnter={handleNavHover}
        >
          <div className="p-2 me-2 position-relative float">
            <FaRocket className="text-primary" style={{ fontSize: '1.5rem' }} />
            <FaCircle 
              className="text-accent position-absolute highlight-glow" 
              style={{ 
                fontSize: '0.5rem', 
                bottom: '8px', 
                right: '8px', 
                color: 'var(--accent-color)'
              }} 
            />
          </div>
          <div>
            <span className="fw-bold" style={{ letterSpacing: '1px' }}>
              WASTE<span style={{ color: 'var(--primary-color)' }}>SYNC</span>
            </span>
            <span 
              className="d-block small" 
              style={{ 
                fontSize: '0.7rem', 
                letterSpacing: '1px', 
                opacity: '0.8' 
              }}
            >
              ADVANCED MANAGEMENT SYSTEM
            </span>
          </div>
        </Navbar.Brand>
        <Navbar.Toggle 
          aria-controls="basic-navbar-nav" 
          onClick={() => soundEffects.play('toggle')}
        />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {[
              { path: '/inventory', icon: FaBoxOpen, label: 'INVENTORY' },
              { path: '/waste-tracking', icon: FaRecycle, label: 'WASTE TRACKING' },
              { path: '/analytics', icon: FaChartBar, label: 'ANALYTICS' },
              { path: '/scanner', icon: FaBarcode, label: 'SCANNER' },
              { path: '/customers', icon: FaUsers, label: 'CUSTOMERS' },
              { path: '/categories', icon: FaTags, label: 'CATEGORIES' }
            ].map((item) => (
              <OverlayTrigger
                key={item.path}
                placement="bottom"
                delay={{ show: 250, hide: 150 }}
                overlay={renderTooltip(item.label)}
              >
                <Nav.Link 
                  as={Link} 
                  to={item.path} 
                  className={`mx-2 position-relative ${activeNavItem === item.path ? 'active' : ''}`}
                  onClick={() => handleNavClick(item.path)}
                  onMouseEnter={handleNavHover}
                >
                  <item.icon className={`me-1 ${activeNavItem === item.path ? 'bounce' : ''}`} /> 
                  {item.label}
                  {activeNavItem === item.path && (
                    <div 
                      className="nav-indicator pulse-border"
                      style={{
                        transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                      }}
                    />
                  )}
                </Nav.Link>
              </OverlayTrigger>
            ))}
          </Nav>
          <div className="d-flex align-items-center">
            <Badge bg="primary" className="me-2 p-2 hover-bright" style={{ 
              background: 'linear-gradient(45deg, var(--primary-color), var(--secondary-color))', 
              border: 'none',
              boxShadow: '0 0 10px rgba(0, 188, 212, 0.5)'
            }}>
              <span className="fw-normal" style={{ letterSpacing: '1px' }}>OverClockminds</span>
            </Badge>
            
            {/* Sound Settings Control Component */}
            <div className="ms-3">
              <SoundSettingsControl />
            </div>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
