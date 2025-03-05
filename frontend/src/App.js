import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './styles/scifi-theme.css';

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
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <SciFiBackground />
        <AppNavbar />
        <Container className="flex-grow-1 py-3">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/inventory/add" element={<ProductForm />} />
            <Route path="/inventory/edit/:id" element={<ProductForm />} />
            <Route path="/waste-tracking" element={<WasteTracking />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Container>
        <footer className="text-center py-3" style={{ 
          background: 'rgba(10, 10, 20, 0.8)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid var(--primary-color)',
          boxShadow: '0 -4px 20px rgba(0, 188, 212, 0.2)',
          color: 'var(--light-text)'
        }}>
          <Container>
            <p className="mb-0" style={{ color: 'var(--primary-color)', letterSpacing: '1px' }}>
              <span style={{ fontWeight: 'bold' }}>WASTE MANAGEMENT</span> | AUTOMATION SYSTEM &copy; {new Date().getFullYear()}
            </p>
          </Container>
        </footer>
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
