import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaBoxOpen, FaRecycle, FaChartBar, FaBarcode, FaUsers, FaBell, FaExclamationTriangle, 
  FaRocket, FaSatellite, FaMicrochip, FaDatabase, FaNetworkWired } from 'react-icons/fa';
import { productsApi, wasteRecordsApi, inventoryApi, notificationsApi } from '../services/api';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    expiringProducts: 0,
    expiredProducts: 0,
    discountedProducts: 0,
    wasteStats: null,
    pendingNotifications: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch products
      const productsResponse = await productsApi.getAll();
      const products = productsResponse.data;
      
      // Calculate product stats
      const totalProducts = products.length;
      const expiringProducts = products.filter(p => 
        p.status === 'active' && p.days_until_expiry !== null && p.days_until_expiry <= 7 && p.days_until_expiry > 0
      ).length;
      const expiredProducts = products.filter(p => p.status === 'expired').length;
      const discountedProducts = products.filter(p => p.status === 'discounted').length;
      
      // Fetch waste statistics
      const wasteStatsResponse = await wasteRecordsApi.getStatistics();
      
      // Fetch pending notifications
      const notificationsResponse = await notificationsApi.getAll({ status: 'pending' });
      const pendingNotifications = notificationsResponse.data.length;
      
      setStats({
        totalProducts,
        expiringProducts,
        expiredProducts,
        discountedProducts,
        wasteStats: wasteStatsResponse.data,
        pendingNotifications
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCheckExpiry = async () => {
    try {
      const response = await inventoryApi.checkExpiry();
      toast.success(`Updated ${response.data.updated_count} products`);
      fetchDashboardData();
    } catch (err) {
      console.error('Error checking expiry:', err);
      toast.error('Failed to check expiry. Please try again.');
    }
  };
  
  const handleProcessExpired = async () => {
    try {
      const response = await inventoryApi.processExpired();
      toast.success(`Processed ${response.data.processed_count} expired products`);
      fetchDashboardData();
    } catch (err) {
      console.error('Error processing expired products:', err);
      toast.error('Failed to process expired products. Please try again.');
    }
  };
  
  const handleProcessNotifications = async () => {
    try {
      const response = await notificationsApi.process();
      toast.success(`Sent ${response.data.sent} notifications, ${response.data.failed} failed`);
      fetchDashboardData();
    } catch (err) {
      console.error('Error processing notifications:', err);
      toast.error('Failed to process notifications. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="position-relative" style={{ width: '80px', height: '80px', margin: '0 auto' }}>
          <div className="spinner-border text-primary" role="status" style={{ width: '80px', height: '80px' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="position-absolute" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <FaRocket className="text-primary" style={{ animation: 'pulse 1.5s infinite' }} />
          </div>
        </div>
        <p className="mt-3" style={{ color: 'var(--primary-color)', letterSpacing: '1px' }}>INITIALIZING SYSTEM...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="danger" className="sci-fi-border">
        <Alert.Heading>
          <FaExclamationTriangle className="me-2" /> SYSTEM MALFUNCTION
        </Alert.Heading>
        <p style={{ fontFamily: 'monospace' }}>{error}</p>
        <Button variant="danger" onClick={fetchDashboardData} className="glow-effect">
          <FaNetworkWired className="me-2" /> REINITIALIZE SYSTEM
        </Button>
      </Alert>
    );
  }
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 style={{ color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '2px' }}>
          COMMAND CENTER <span style={{ fontSize: '0.5em', verticalAlign: 'middle', opacity: 0.7 }}>v1.0</span>
        </h1>
        <div className="d-flex">
          <Button 
            variant="primary" 
            className="me-2 glow-effect"
            onClick={fetchDashboardData}
            style={{ borderRadius: '4px' }}
          >
            <FaDatabase className="me-2" />
            SYNC DATA
          </Button>
        </div>
      </div>
      
      {/* Quick Actions */}
      <Card className="mb-4 dashboard-card">
        <Card.Header style={{ borderBottom: '1px solid var(--primary-color)' }}>
          <h5 className="mb-0" style={{ color: 'var(--primary-color)', letterSpacing: '1px' }}>
            <FaSatellite className="me-2" /> SYSTEM OPERATIONS
          </h5>
        </Card.Header>
        <Card.Body style={{ background: 'rgba(0, 188, 212, 0.05)' }}>
          <Row>
            <Col md={4} className="mb-2">
              <Button 
                variant="primary" 
                className="w-100 py-3 sci-fi-border" 
                onClick={handleCheckExpiry}
              >
                <div className="d-flex flex-column align-items-center">
                  <FaExclamationTriangle className="mb-2" size={24} />
                  <span style={{ letterSpacing: '1px' }}>SCAN EXPIRY STATUS</span>
                </div>
              </Button>
            </Col>
            <Col md={4} className="mb-2">
              <Button 
                variant="danger" 
                className="w-100 py-3 sci-fi-border" 
                onClick={handleProcessExpired}
              >
                <div className="d-flex flex-column align-items-center">
                  <FaRecycle className="mb-2" size={24} />
                  <span style={{ letterSpacing: '1px' }}>RECYCLE EXPIRED ITEMS</span>
                </div>
              </Button>
            </Col>
            <Col md={4} className="mb-2">
              <Button 
                variant="success" 
                className="w-100 py-3 sci-fi-border" 
                onClick={handleProcessNotifications}
                disabled={stats.pendingNotifications === 0}
              >
                <div className="d-flex flex-column align-items-center position-relative">
                  <FaBell className="mb-2" size={24} />
                  <span style={{ letterSpacing: '1px' }}>BROADCAST ALERTS</span>
                  {stats.pendingNotifications > 0 && (
                    <Badge bg="danger" pill className="position-absolute top-0 end-0 mt-1 me-1"
                      style={{ boxShadow: '0 0 5px var(--danger-color)' }}>
                      {stats.pendingNotifications}
                    </Badge>
                  )}
                </div>
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100 dashboard-card">
            <Card.Body className="text-center">
              <div className="rounded-circle p-3 d-inline-block mb-3" style={{ 
                background: 'rgba(0, 188, 212, 0.1)', 
                boxShadow: '0 0 15px rgba(0, 188, 212, 0.2)' 
              }}>
                <FaBoxOpen size={30} style={{ color: 'var(--primary-color)' }} />
              </div>
              <h2 style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{stats.totalProducts}</h2>
              <p style={{ color: 'var(--light-text)', letterSpacing: '1px', fontSize: '0.8rem' }}>INVENTORY COUNT</p>
            </Card.Body>
            <Card.Footer className="text-center">
              <Link to="/inventory" className="btn btn-sm btn-primary">ACCESS INVENTORY</Link>
            </Card.Footer>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100 dashboard-card">
            <Card.Body className="text-center">
              <div className="rounded-circle p-3 d-inline-block mb-3" style={{ 
                background: 'rgba(255, 214, 0, 0.1)', 
                boxShadow: '0 0 15px rgba(255, 214, 0, 0.2)' 
              }}>
                <FaExclamationTriangle size={30} style={{ color: 'var(--warning-color)' }} />
              </div>
              <h2 style={{ color: 'var(--warning-color)', fontWeight: 'bold' }}>{stats.expiringProducts}</h2>
              <p style={{ color: 'var(--light-text)', letterSpacing: '1px', fontSize: '0.8rem' }}>CRITICAL TIMELINE</p>
            </Card.Body>
            <Card.Footer className="text-center">
              <Link to="/inventory?status=active&expiry_days=7" className="btn btn-sm btn-warning">MONITOR EXPIRING</Link>
            </Card.Footer>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100 dashboard-card">
            <Card.Body className="text-center">
              <div className="rounded-circle p-3 d-inline-block mb-3" style={{ 
                background: 'rgba(255, 23, 68, 0.1)', 
                boxShadow: '0 0 15px rgba(255, 23, 68, 0.2)' 
              }}>
                <FaRecycle size={30} style={{ color: 'var(--danger-color)' }} />
              </div>
              <h2 style={{ color: 'var(--danger-color)', fontWeight: 'bold' }}>{stats.expiredProducts}</h2>
              <p style={{ color: 'var(--light-text)', letterSpacing: '1px', fontSize: '0.8rem' }}>EXPIRED UNITS</p>
            </Card.Body>
            <Card.Footer className="text-center">
              <Link to="/inventory?status=expired" className="btn btn-sm btn-danger">PROCESS EXPIRED</Link>
            </Card.Footer>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100 dashboard-card">
            <Card.Body className="text-center">
              <div className="rounded-circle p-3 d-inline-block mb-3" style={{ 
                background: 'rgba(0, 200, 83, 0.1)', 
                boxShadow: '0 0 15px rgba(0, 200, 83, 0.2)' 
              }}>
                <FaMicrochip size={30} style={{ color: 'var(--success-color)' }} />
              </div>
              <h2 style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>{stats.discountedProducts}</h2>
              <p style={{ color: 'var(--light-text)', letterSpacing: '1px', fontSize: '0.8rem' }}>OPTIMIZED PRICING</p>
            </Card.Body>
            <Card.Footer className="text-center">
              <Link to="/inventory?status=discounted" className="btn btn-sm btn-success">ACCESS DISCOUNTS</Link>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
      
      {/* Waste Statistics Summary */}
      {stats.wasteStats && (
        <Row className="mb-4">
          <Col md={12}>
            <Card className="dashboard-card">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Waste Statistics Summary</h5>
                <Link to="/analytics" className="btn btn-sm btn-outline-primary">View Detailed Analytics</Link>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={4} className="text-center mb-3">
                    <div className="bg-info bg-opacity-10 rounded-circle p-3 d-inline-block mb-2">
                      <FaRecycle className="text-info" size={24} />
                    </div>
                    <h3>{stats.wasteStats.total_waste}</h3>
                    <p className="text-muted">Total Waste Units</p>
                  </Col>
                  <Col md={4} className="text-center mb-3">
                    <div className="bg-success bg-opacity-10 rounded-circle p-3 d-inline-block mb-2">
                      <FaRecycle className="text-success" size={24} />
                    </div>
                    <h3>{stats.wasteStats.recyclable_waste}</h3>
                    <p className="text-muted">Recyclable Units</p>
                  </Col>
                  <Col md={4} className="text-center mb-3">
                    <div className="bg-warning bg-opacity-10 rounded-circle p-3 d-inline-block mb-2">
                      <FaChartBar className="text-warning" size={24} />
                    </div>
                    <h3>{stats.wasteStats.recyclable_percentage.toFixed(1)}%</h3>
                    <p className="text-muted">Recyclable Percentage</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
      
      {/* Quick Access */}
      <Row>
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Quick Access</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={2} sm={4} xs={6} className="text-center mb-3">
                  <Link to="/inventory" className="text-decoration-none">
                    <div className="p-3 hover-lift">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-block mb-2">
                        <FaBoxOpen size={24} className="text-primary" />
                      </div>
                      <p className="mb-0">Inventory</p>
                    </div>
                  </Link>
                </Col>
                <Col md={2} sm={4} xs={6} className="text-center mb-3">
                  <Link to="/waste-tracking" className="text-decoration-none">
                    <div className="p-3 hover-lift">
                      <div className="bg-success bg-opacity-10 rounded-circle p-3 d-inline-block mb-2">
                        <FaRecycle size={24} className="text-success" />
                      </div>
                      <p className="mb-0">Waste Tracking</p>
                    </div>
                  </Link>
                </Col>
                <Col md={2} sm={4} xs={6} className="text-center mb-3">
                  <Link to="/analytics" className="text-decoration-none">
                    <div className="p-3">
                      <FaChartBar size={40} className="text-info mb-2" />
                      <p className="mb-0">Analytics</p>
                    </div>
                  </Link>
                </Col>
                <Col md={2} sm={4} xs={6} className="text-center mb-3">
                  <Link to="/scanner" className="text-decoration-none">
                    <div className="p-3">
                      <FaBarcode size={40} className="text-dark mb-2" />
                      <p className="mb-0">Scanner</p>
                    </div>
                  </Link>
                </Col>
                <Col md={2} sm={4} xs={6} className="text-center mb-3">
                  <Link to="/customers" className="text-decoration-none">
                    <div className="p-3">
                      <FaUsers size={40} className="text-secondary mb-2" />
                      <p className="mb-0">Customers</p>
                    </div>
                  </Link>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
