import React from 'react';
import { Navbar, Nav, Container, Badge } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaRecycle, FaBoxOpen, FaChartBar, FaBarcode, FaUsers, FaRocket, FaCircle } from 'react-icons/fa';

const AppNavbar = () => {
  const location = useLocation();
  return (
    <Navbar expand="lg" className="mb-4 sticky-top navbar-dark">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <div className="p-2 me-2 position-relative">
            <FaRocket className="text-primary" style={{ fontSize: '1.5rem' }} />
            <FaCircle className="text-accent position-absolute" style={{ fontSize: '0.5rem', bottom: '8px', right: '8px', color: 'var(--accent-color)' }} />
          </div>
          <div>
            <span className="fw-bold" style={{ letterSpacing: '1px' }}>WASTE<span style={{ color: 'var(--primary-color)' }}>SYNC</span></span>
            <span className="d-block small" style={{ fontSize: '0.7rem', letterSpacing: '1px', opacity: '0.8' }}>ADVANCED MANAGEMENT SYSTEM</span>
          </div>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/inventory" 
              className={`mx-2 ${location.pathname === '/inventory' ? 'active' : ''}`}
            >
              <FaBoxOpen className="me-1" /> INVENTORY
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/waste-tracking" 
              className={`mx-2 ${location.pathname === '/waste-tracking' ? 'active' : ''}`}
            >
              <FaRecycle className="me-1" /> WASTE TRACKING
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/analytics" 
              className={`mx-2 ${location.pathname === '/analytics' ? 'active' : ''}`}
            >
              <FaChartBar className="me-1" /> ANALYTICS
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/scanner" 
              className={`mx-2 ${location.pathname === '/scanner' ? 'active' : ''}`}
            >
              <FaBarcode className="me-1" /> SCANNER
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/customers" 
              className={`mx-2 ${location.pathname === '/customers' ? 'active' : ''}`}
            >
              <FaUsers className="me-1" /> CUSTOMERS
            </Nav.Link>
          </Nav>
          <div className="d-flex align-items-center">
            <Badge bg="primary" className="me-2 p-2" style={{ 
              background: 'linear-gradient(45deg, var(--primary-color), var(--secondary-color))', 
              border: 'none',
              boxShadow: '0 0 10px rgba(0, 188, 212, 0.5)'
            }}>
              <span className="fw-normal" style={{ letterSpacing: '1px' }}>v1.0</span>
            </Badge>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
