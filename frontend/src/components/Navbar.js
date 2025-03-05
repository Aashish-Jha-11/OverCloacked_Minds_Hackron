import React from 'react';
import { Navbar, Nav, Container, Badge } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaRecycle, FaBoxOpen, FaChartBar, FaBarcode, FaUsers, FaStore } from 'react-icons/fa';

const AppNavbar = () => {
  const location = useLocation();
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 shadow-sm sticky-top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <div className="bg-success rounded-circle p-2 me-2">
            <FaStore className="text-white" />
          </div>
          <div>
            <span className="fw-bold">Dark Store</span>
            <span className="d-block small text-light">Waste Management System</span>
          </div>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/inventory" 
              className={`mx-1 ${location.pathname === '/inventory' ? 'active fw-bold' : ''}`}
            >
              <FaBoxOpen className="me-1" /> Inventory
              {location.pathname === '/inventory' && <div className="nav-indicator"></div>}
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/waste-tracking" 
              className={`mx-1 ${location.pathname === '/waste-tracking' ? 'active fw-bold' : ''}`}
            >
              <FaRecycle className="me-1" /> Waste Tracking
              {location.pathname === '/waste-tracking' && <div className="nav-indicator"></div>}
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/analytics" 
              className={`mx-1 ${location.pathname === '/analytics' ? 'active fw-bold' : ''}`}
            >
              <FaChartBar className="me-1" /> Analytics
              {location.pathname === '/analytics' && <div className="nav-indicator"></div>}
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/scanner" 
              className={`mx-1 ${location.pathname === '/scanner' ? 'active fw-bold' : ''}`}
            >
              <FaBarcode className="me-1" /> Scanner
              {location.pathname === '/scanner' && <div className="nav-indicator"></div>}
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/customers" 
              className={`mx-1 ${location.pathname === '/customers' ? 'active fw-bold' : ''}`}
            >
              <FaUsers className="me-1" /> Customers
              {location.pathname === '/customers' && <div className="nav-indicator"></div>}
            </Nav.Link>
          </Nav>
          <div className="d-flex align-items-center">
            <Badge bg="success" className="me-2 p-2">
              <span className="fw-normal">v1.0</span>
            </Badge>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
