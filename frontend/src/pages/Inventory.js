import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Alert, Badge, Spinner } from 'react-bootstrap';
import { 
  FaFilter, FaPlus, FaSync, FaLayerGroup, FaChartLine, 
  FaClipboardCheck, FaDownload, FaBarcode, FaUpload, FaSearch
} from 'react-icons/fa';
import { toast } from 'react-toastify';

// Components
import InventoryTable from '../components/InventoryTable';
import SciFiBackground from '../components/SciFiBackground';

// API Services
import { productsApi, categoriesApi, inventoryApi } from '../services/api';

// CSS
import '../styles/scifi-theme.css';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [inventoryStats, setInventoryStats] = useState({
    total: 0,
    active: 0,
    discounted: 0,
    expiring: 0,
    expired: 0
  });
  const [processingExpiry, setProcessingExpiry] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    expiry_days: '',
    location: ''
  });
  
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Parse query parameters
    const searchParams = new URLSearchParams(location.search);
    const queryFilters = {
      status: searchParams.get('status') || '',
      category: searchParams.get('category') || '',
      expiry_days: searchParams.get('expiry_days') || '',
      location: searchParams.get('location') || ''
    };
    
    setFilters(queryFilters);
    setShowFilters(Object.values(queryFilters).some(value => value !== ''));
    
    // Fetch categories
    fetchCategories();
    
    // Fetch products with filters
    fetchProducts(queryFilters);
    
    // Title animation
    const title = document.title;
    document.title = "⚡ Inventory Management System";
    
    return () => {
      document.title = title;
    };
  }, [location.search]);
  
  const fetchCategories = async () => {
    try {
      const response = await categoriesApi.getAll();
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error('Failed to load categories');
    }
  };
  
  const fetchProducts = async (filterParams = filters) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await productsApi.getAll(filterParams);
      setProducts(response.data);
      
      // Calculate inventory statistics
      const stats = {
        total: response.data.length,
        active: response.data.filter(p => p.status === 'active').length,
        discounted: response.data.filter(p => p.status === 'discounted').length,
        expiring: response.data.filter(p => p.days_until_expiry !== null && p.days_until_expiry <= 7 && p.days_until_expiry > 0).length,
        expired: response.data.filter(p => p.status === 'expired').length
      };
      setInventoryStats(stats);
      
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const applyFilters = () => {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        queryParams.set(key, value);
      }
    });
    
    // Update URL with filters
    navigate({
      pathname: location.pathname,
      search: queryParams.toString()
    });
  };
  
  const clearFilters = () => {
    setFilters({
      status: '',
      category: '',
      expiry_days: '',
      location: ''
    });
    
    navigate(location.pathname);
  };
  
  const handleProductUpdate = (updatedProduct) => {
    setProducts(products.map(p => 
      p.id === updatedProduct.id ? updatedProduct : p
    ));
    toast.success(`Product "${updatedProduct.name}" updated successfully`);
  };
  
  const handleProductDelete = (productId) => {
    setProducts(products.filter(p => p.id !== productId));
    toast.success('Product deleted successfully');
  };
  
  const handleEditProduct = (product) => {
    navigate(`/inventory/edit/${product.id}`);
  };
  
  const handleViewBarcode = (product) => {
    // Open a modal or navigate to barcode view
    navigate(`/scanner?barcode=${product.barcode}`);
  };
  
  const checkExpiry = async () => {
    setProcessingExpiry(true);
    
    try {
      const response = await inventoryApi.checkExpiry();
      
      if (response.data.updated_count > 0) {
        toast.info(`Updated status of ${response.data.updated_count} products`);
        fetchProducts(filters); // Refresh product list
      } else {
        toast.info('No products needed status updates');
      }
    } catch (err) {
      console.error('Error checking product expiry:', err);
      toast.error('Failed to check product expiry status');
    } finally {
      setProcessingExpiry(false);
    }
  };
  
  const downloadInventoryReport = () => {
    // In a real app, this would generate a CSV/PDF report
    toast.info('Generating inventory report...');
    setTimeout(() => {
      toast.success('Report generated successfully!');
    }, 1500);
  };
  
  const getFEFOInventory = async () => {
    setLoading(true);
    
    try {
      const response = await inventoryApi.getFefoInventory();
      setProducts(Object.values(response.data).flat());
      toast.info('Products sorted by First-Expiry-First-Out principle');
    } catch (err) {
      console.error('Error getting FEFO inventory:', err);
      toast.error('Failed to load FEFO inventory');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <SciFiBackground />
      <div className="inventory-page position-relative">
        {/* Header Section with Stats */}
        <div className="glass-panel mb-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div>
              <h1 className="tech-title">
                <FaLayerGroup className="me-2" />
                Inventory Management
              </h1>
              <p className="text-muted mb-0">Optimize your stock with advanced tracking and analytics</p>
            </div>
            <div className="d-flex gap-2">
              <Button 
                variant="outline-primary" 
                className="tech-btn"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter className="me-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
              <Button 
                variant="primary"
                className="tech-btn pulse-btn"
                onClick={() => navigate('/inventory/add')}
              >
                <FaPlus className="me-2" />
                Add Product
              </Button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <Row className="mt-4">
            <Col lg={10} className="mx-auto">
              <div className="d-flex flex-wrap justify-content-between">
                <div className="stat-card">
                  <div className="stat-icon">
                    <FaLayerGroup />
                  </div>
                  <div>
                    <h3>{inventoryStats.total}</h3>
                    <p>Total Products</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon active-icon">
                    <FaClipboardCheck />
                  </div>
                  <div>
                    <h3>{inventoryStats.active}</h3>
                    <p>Active</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon warning-icon">
                    <FaChartLine />
                  </div>
                  <div>
                    <h3>{inventoryStats.discounted}</h3>
                    <p>Discounted</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon danger-icon">
                    <FaSync />
                  </div>
                  <div>
                    <h3>{inventoryStats.expiring}</h3>
                    <p>Expiring Soon</p>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
        
        {/* Action Buttons */}
        <div className="mb-4 d-flex flex-wrap gap-2">
          <Button 
            variant="outline-info" 
            className="tech-btn-sm"
            onClick={checkExpiry}
            disabled={processingExpiry}
          >
            {processingExpiry ? <Spinner size="sm" animation="border" className="me-2"/> : <FaSync className="me-2" />}
            Check Expiry Status
          </Button>
          <Button 
            variant="outline-success" 
            className="tech-btn-sm"
            onClick={getFEFOInventory}
          >
            <FaClipboardCheck className="me-2" />
            Sort by FEFO
          </Button>
          <Button 
            variant="outline-primary" 
            className="tech-btn-sm"
            onClick={() => navigate('/scanner')}
          >
            <FaBarcode className="me-2" />
            Scan Products
          </Button>
          <Button 
            variant="outline-secondary" 
            className="tech-btn-sm ms-auto"
            onClick={downloadInventoryReport}
          >
            <FaDownload className="me-2" />
            Export Report
          </Button>
        </div>
        
        {/* Filters Panel */}
        {showFilters && (
          <Card className="glass-card mb-4">
            <Card.Header className="d-flex align-items-center">
              <h5 className="mb-0 flex-grow-1">Advanced Filters</h5>
              <Button 
                variant="link" 
                className="p-0 text-decoration-none"
                onClick={() => setShowFilters(false)}
              >
                <small>Hide</small>
              </Button>
            </Card.Header>
            <Card.Body>
              <Form>
                <Row>
                  <Col md={3} className="mb-3">
                    <Form.Group>
                      <Form.Label>Status</Form.Label>
                      <Form.Select 
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="tech-select"
                      >
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="discounted">Discounted</option>
                        <option value="expired">Expired</option>
                        <option value="disposed">Disposed</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3} className="mb-3">
                    <Form.Group>
                      <Form.Label>Category</Form.Label>
                      <Form.Select 
                        name="category"
                        value={filters.category}
                        onChange={handleFilterChange}
                        className="tech-select"
                      >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3} className="mb-3">
                    <Form.Group>
                      <Form.Label>Expiring Within (Days)</Form.Label>
                      <Form.Control 
                        type="number" 
                        name="expiry_days"
                        value={filters.expiry_days}
                        onChange={handleFilterChange}
                        placeholder="e.g., 7"
                        className="tech-input"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3} className="mb-3">
                    <Form.Group>
                      <Form.Label>Location</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="location"
                        value={filters.location}
                        onChange={handleFilterChange}
                        placeholder="e.g., Shelf A"
                        className="tech-input"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <div className="d-flex justify-content-end">
                  <Button 
                    variant="outline-secondary" 
                    className="me-2 tech-btn-sm"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </Button>
                  <Button 
                    variant="primary"
                    className="tech-btn-sm"
                    onClick={applyFilters}
                  >
                    Apply Filters
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        )}
        
        {/* Data Table */}
        {error ? (
          <Alert variant="danger" className="glass-alert">
            <Alert.Heading>Error Loading Products</Alert.Heading>
            <p>{error}</p>
            <Button 
              variant="outline-danger" 
              className="tech-btn-sm"
              onClick={() => fetchProducts()}
            >
              <FaSync className="me-2" />
              Retry
            </Button>
          </Alert>
        ) : (
          <Card className="glass-card">
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3">Loading inventory data...</p>
                </div>
              ) : (
                <InventoryTable 
                  products={products} 
                  loading={loading}
                  onEdit={handleEditProduct}
                  onDelete={handleProductDelete}
                  onViewBarcode={handleViewBarcode}
                  categories={categories}
                />
              )}
            </Card.Body>
          </Card>
        )}
      </div>
      
      {/* CSS for enhanced styling */}
      <style jsx="true">{`
        .inventory-page {
          padding: 1.5rem;
          position: relative;
          z-index: 1;
        }
        
        .glass-panel {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          padding: 1.5rem;
          box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border-radius: 10px;
          box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.18);
          transition: all 0.3s ease;
        }
        
        .glass-card:hover {
          box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
        }
        
        .glass-alert {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border-radius: 10px;
        }
        
        .tech-title {
          font-weight: 700;
          background: linear-gradient(45deg, #0d6efd, #0dcaf0);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-size: 2.2rem;
        }
        
        .tech-btn {
          border-radius: 8px;
          padding: 0.6rem 1.2rem;
          transition: all 0.3s ease;
          font-weight: 500;
        }
        
        .tech-btn-sm {
          border-radius: 8px;
          padding: 0.4rem 0.8rem;
          transition: all 0.3s ease;
          font-weight: 500;
        }
        
        .tech-btn:hover, .tech-btn-sm:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(13, 110, 253, 0.3);
        }
        
        .tech-input, .tech-select {
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(0, 0, 0, 0.1);
          padding: 0.6rem 1rem;
        }
        
        .tech-input:focus, .tech-select:focus {
          box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.25);
          border-color: #0d6efd;
        }
        
        .stat-card {
          background: rgba(255, 255, 255, 0.8);
          padding: 1rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          min-width: 200px;
          margin-bottom: 1rem;
          border-left: 4px solid #0d6efd;
          transition: all 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }
        
        .stat-icon {
          width: 50px;
          height: 50px;
          background: rgba(13, 110, 253, 0.1);
          color: #0d6efd;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          border-radius: 10px;
          margin-right: 1rem;
        }
        
        .active-icon {
          background: rgba(25, 135, 84, 0.1);
          color: #198754;
        }
        
        .warning-icon {
          background: rgba(255, 193, 7, 0.1);
          color: #ffc107;
        }
        
        .danger-icon {
          background: rgba(220, 53, 69, 0.1);
          color: #dc3545;
        }
        
        .stat-card h3 {
          margin: 0;
          font-weight: 700;
          font-size: 1.8rem;
          line-height: 1;
        }
        
        .stat-card p {
          margin: 0;
          color: #6c757d;
          font-size: 0.9rem;
          font-weight: 500;
        }
        
        .pulse-btn {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(13, 110, 253, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(13, 110, 253, 0);
          }
        }
      `}</style>
    </>
  );
};

export default Inventory;
