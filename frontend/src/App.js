import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

// Components
import AppNavbar from './components/Navbar';

// Pages
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import WasteTracking from './pages/WasteTracking';
import Analytics from './pages/Analytics';
import Scanner from './pages/Scanner';
import Customers from './pages/Customers';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <AppNavbar />
        <Container className="flex-grow-1 py-3">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/waste-tracking" element={<WasteTracking />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Container>
        <footer className="bg-dark text-white text-center py-3">
          <Container>
            <p className="mb-0">Waste Management Automation System &copy; {new Date().getFullYear()}</p>
          </Container>
        </footer>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;
