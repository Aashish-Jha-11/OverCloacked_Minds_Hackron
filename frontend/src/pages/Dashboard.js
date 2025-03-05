import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaBoxOpen, FaRecycle, FaChartBar, FaBarcode, FaUsers, FaBell, FaExclamationTriangle } from 'react-icons/fa';
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
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading dashboard data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error Loading Dashboard</Alert.Heading>
        <p>{error}</p>
        <Button variant="outline-danger" onClick={fetchDashboardData}>Retry</Button>
      </Alert>
    );
  }
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Dashboard</h1>
        <div className="d-flex">
          <Button 
            variant="outline-secondary" 
            className="me-2"
            onClick={fetchDashboardData}
          >
            <FaChartBar className="me-2" />
            Refresh Data
          </Button>
        </div>
      </div>
      
      {/* Quick Actions */}
      <Card className="mb-4 shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Quick Actions</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4} className="mb-2">
              <Button 
                variant="outline-primary" 
                className="w-100 py-3" 
                onClick={handleCheckExpiry}
              >
                <div className="d-flex flex-column align-items-center">
                  <FaExclamationTriangle className="mb-2" size={24} />
                  <span>Check Expiring Products</span>
                </div>
              </Button>
            </Col>
            <Col md={4} className="mb-2">
              <Button 
                variant="outline-danger" 
                className="w-100 py-3" 
                onClick={handleProcessExpired}
              >
                <div className="d-flex flex-column align-items-center">
                  <FaRecycle className="mb-2" size={24} />
                  <span>Process Expired Products</span>
                </div>
              </Button>
            </Col>
            <Col md={4} className="mb-2">
              <Button 
                variant="outline-success" 
                className="w-100 py-3" 
                onClick={handleProcessNotifications}
                disabled={stats.pendingNotifications === 0}
              >
                <div className="d-flex flex-column align-items-center">
                  <FaBell className="mb-2" size={24} />
                  <span>Send Notifications</span>
                  {stats.pendingNotifications > 0 && (
                    <Badge bg="danger" pill className="position-absolute top-0 end-0 mt-1 me-1">
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
          <Card className="h-100 shadow-sm dashboard-card">
            <Card.Body className="text-center">
              <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-block mb-3">
                <FaBoxOpen className="text-primary" size={30} />
              </div>
              <h2>{stats.totalProducts}</h2>
              <p className="text-muted mb-0">Total Products</p>
            </Card.Body>
            <Card.Footer className="text-center">
              <Link to="/inventory" className="btn btn-sm btn-outline-primary">View Inventory</Link>
            </Card.Footer>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100 shadow-sm dashboard-card">
            <Card.Body className="text-center">
              <div className="bg-warning bg-opacity-10 rounded-circle p-3 d-inline-block mb-3">
                <FaExclamationTriangle className="text-warning" size={30} />
              </div>
              <h2>{stats.expiringProducts}</h2>
              <p className="text-muted mb-0">Expiring Soon</p>
            </Card.Body>
            <Card.Footer className="text-center">
              <Link to="/inventory?status=active&expiry_days=7" className="btn btn-sm btn-outline-warning">View Expiring</Link>
            </Card.Footer>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100 shadow-sm dashboard-card">
            <Card.Body className="text-center">
              <div className="bg-danger bg-opacity-10 rounded-circle p-3 d-inline-block mb-3">
                <FaRecycle className="text-danger" size={30} />
              </div>
              <h2>{stats.expiredProducts}</h2>
              <p className="text-muted mb-0">Expired Products</p>
            </Card.Body>
            <Card.Footer className="text-center">
              <Link to="/inventory?status=expired" className="btn btn-sm btn-outline-danger">View Expired</Link>
            </Card.Footer>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100 shadow-sm dashboard-card">
            <Card.Body className="text-center">
              <div className="bg-success bg-opacity-10 rounded-circle p-3 d-inline-block mb-3">
                <FaBell className="text-success" size={30} />
              </div>
              <h2>{stats.discountedProducts}</h2>
              <p className="text-muted mb-0">Discounted Products</p>
            </Card.Body>
            <Card.Footer className="text-center">
              <Link to="/inventory?status=discounted" className="btn btn-sm btn-outline-success">View Discounted</Link>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
      
      {/* Waste Statistics Summary */}
      {stats.wasteStats && (
        <Row className="mb-4">
          <Col md={12}>
            <Card className="shadow-sm">
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
