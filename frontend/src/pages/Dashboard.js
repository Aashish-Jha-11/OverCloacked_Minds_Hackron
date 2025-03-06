import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Alert, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaBoxOpen, FaRecycle, FaChartBar, FaBarcode, FaUsers, FaBell, FaExclamationTriangle, 
  FaRocket, FaSatellite, FaMicrochip, FaDatabase, FaNetworkWired, FaTags, FaLink,
  FaArrowUp, FaArrowDown, FaPercent, FaServer, FaRegClock, FaSyncAlt
} from 'react-icons/fa';
import { productsApi, wasteRecordsApi, inventoryApi, notificationsApi } from '../services/api';
import { toast } from 'react-toastify';
import soundEffects from '../utils/soundEffects';
import '../styles/animations.css';

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
  const [refreshAnimation, setRefreshAnimation] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  // Sequentially reveal elements for a more dynamic loading experience
  useEffect(() => {
    if (!loading) {
      setTimeout(() => setShowStats(true), 300);
    }
  }, [loading]);
  
  useEffect(() => {
    fetchDashboardData();
    
    // Play startup sound when dashboard loads
    soundEffects.play('notification');
    
    // Success message on initial load
    setTimeout(() => {
      toast.info('System online. Monitoring waste management operations.', {
        icon: "🚀",
        position: "top-center"
      });
    }, 1000);
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
      
      soundEffects.playSuccess();
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
      soundEffects.playError();
    } finally {
      setLoading(false);
    }
  };
  
  const handleSyncData = () => {
    soundEffects.play('click');
    setRefreshAnimation(true);
    
    // Reset the animation after it completes
    setTimeout(() => setRefreshAnimation(false), 1000);
    
    fetchDashboardData();
  };
  
  const handleCheckExpiry = async () => {
    soundEffects.play('scan');
    try {
      const response = await inventoryApi.checkExpiry();
      toast.success(`Updated ${response.data.updated_count} products`, {
        icon: "🔄"
      });
      soundEffects.playSuccess();
      fetchDashboardData();
    } catch (err) {
      console.error('Error checking expiry:', err);
      toast.error('Failed to check expiry. Please try again.');
      soundEffects.playError();
    }
  };
  
  const handleProcessExpired = async () => {
    soundEffects.play('click');
    try {
      const response = await inventoryApi.processExpired();
      toast.success(`Processed ${response.data.processed_count} expired products`, {
        icon: "♻️"
      });
      soundEffects.playSuccess();
      fetchDashboardData();
    } catch (err) {
      console.error('Error processing expired products:', err);
      toast.error('Failed to process expired products. Please try again.');
      soundEffects.playError();
    }
  };
  
  const handleProcessNotifications = async () => {
    soundEffects.play('notification');
    try {
      const response = await notificationsApi.process();
      toast.success(`Sent ${response.data.sent} notifications, ${response.data.failed} failed`, {
        icon: "📨"
      });
      soundEffects.playSuccess();
      fetchDashboardData();
    } catch (err) {
      console.error('Error processing notifications:', err);
      toast.error('Failed to process notifications. Please try again.');
      soundEffects.playError();
    }
  };
  
  const handleLinkHover = () => {
    soundEffects.playHover();
  };
  
  const handleButtonHover = () => {
    soundEffects.playHover();
  };
  
  // Function to render tooltip for quick actions
  const renderTooltip = (content) => (props) => (
    <Tooltip id={`tooltip-${content.toLowerCase().replace(/\s/g, '-')}`} {...props}>
      {content}
    </Tooltip>
  );
  
  if (loading) {
    return (
      <div className="text-center p-5 fade-in">
        <div className="position-relative" style={{ width: '100px', height: '100px', margin: '0 auto' }}>
          <div 
            className="spinner-border text-primary highlight-glow" 
            role="status" 
            style={{ 
              width: '100px', 
              height: '100px',
              borderWidth: '4px'
            }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <div 
            className="position-absolute" 
            style={{ 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)' 
            }}
          >
            <FaRocket 
              className="text-primary pulse-border" 
              style={{ 
                fontSize: '2.5rem',
                animation: 'float 3s infinite ease-in-out'
              }} 
            />
          </div>
        </div>
        <p 
          className="mt-4 typing-effect sci-fi-title" 
          style={{ 
            color: 'var(--primary-color)', 
            letterSpacing: '3px',
            fontSize: '1.2rem'
          }}
        >
          INITIALIZING SYSTEM MODULES...
        </p>
        <div className="loading-bar-container mt-3" style={{ width: '300px', margin: '0 auto' }}>
          <div className="loading-bar"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="danger" className="sci-fi-border shake">
        <Alert.Heading className="d-flex align-items-center">
          <FaExclamationTriangle className="me-2 pulse-border" /> SYSTEM MALFUNCTION
        </Alert.Heading>
        <p style={{ fontFamily: 'monospace' }} className="typing-effect">{error}</p>
        <Button 
          variant="danger" 
          onClick={fetchDashboardData} 
          className="glow-effect hover-scale"
          onMouseEnter={handleButtonHover}
        >
          <FaNetworkWired className="me-2 pulse-border" /> REINITIALIZE SYSTEM
        </Button>
      </Alert>
    );
  }
  
  return (
    <div className="dashboard-container">
      <div className="d-flex justify-content-between align-items-center mb-4 fade-in">
        <h1 className="sci-fi-title" style={{ 
          color: 'var(--primary-color)', 
          textTransform: 'uppercase', 
          letterSpacing: '3px',
          textShadow: '0 0 10px rgba(0, 188, 212, 0.3)'
        }}>
          COMMAND CENTER <span style={{ fontSize: '0.5em', verticalAlign: 'middle', opacity: 0.7 }}>OverClockminds</span>
        </h1>
        <div className="d-flex">
          <Button 
            variant="primary" 
            className={`sync-button hover-scale ${refreshAnimation ? 'spin-once' : ''}`}
            onClick={handleSyncData}
            onMouseEnter={handleButtonHover}
            style={{ 
              borderRadius: '4px',
              transition: 'all 0.3s ease'
            }}
          >
            <FaDatabase className={`me-2 ${refreshAnimation ? 'spin-once' : ''}`} />
            SYNC DATA
          </Button>
        </div>
      </div>
      
      {/* Rapid Access System Menu */}
      <div className="rapid-access-menu mb-4 scale-in" style={{ animationDelay: '0.1s' }}>
        <div className="d-flex flex-wrap justify-content-between">
          {[
            { path: '/inventory', icon: FaBoxOpen, label: 'INVENTORY' },
            { path: '/waste-tracking', icon: FaRecycle, label: 'WASTE' },
            { path: '/analytics', icon: FaChartBar, label: 'ANALYTICS' },
            { path: '/scanner', icon: FaBarcode, label: 'SCANNER' },
            { path: '/customers', icon: FaUsers, label: 'CUSTOMERS' },
            { path: '/categories', icon: FaTags, label: 'CATEGORIES' }
          ].map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              className="rapid-access-item text-decoration-none hover-scale"
              onMouseEnter={handleLinkHover}
            >
              <div className="d-flex align-items-center">
                <div className="rapid-icon">
                  <item.icon />
                </div>
                <span className="rapid-label">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Quick Actions */}
      <Card className="mb-4 dashboard-card scale-in" style={{ animationDelay: '0.2s' }}>
        <Card.Header 
          style={{ 
            borderBottom: '1px solid var(--primary-color)',
            background: 'rgba(13, 110, 253, 0.1)'
          }}
        >
          <h5 className="mb-0 d-flex align-items-center" style={{ color: 'var(--primary-color)', letterSpacing: '1px' }}>
            <FaSatellite className="me-2 pulse-border" /> SYSTEM OPERATIONS
          </h5>
        </Card.Header>
        <Card.Body style={{ 
          background: 'rgba(0, 188, 212, 0.05)',
          backdropFilter: 'blur(10px)'
        }}>
          <Row>
            <Col md={4} className="mb-2">
              <OverlayTrigger
                placement="top"
                delay={{ show: 250, hide: 150 }}
                overlay={renderTooltip("Scan all inventory items for approaching expiry dates")}
              >
                <Button 
                  variant="primary" 
                  className="w-100 py-3 sci-fi-border hover-scale" 
                  onClick={handleCheckExpiry}
                  onMouseEnter={handleButtonHover}
                >
                  <div className="d-flex flex-column align-items-center">
                    <FaRegClock className="mb-2 pulse-border" size={24} />
                    <span style={{ letterSpacing: '1px' }}>SCAN EXPIRY STATUS</span>
                  </div>
                </Button>
              </OverlayTrigger>
            </Col>
            <Col md={4} className="mb-2">
              <OverlayTrigger
                placement="top"
                delay={{ show: 250, hide: 150 }}
                overlay={renderTooltip("Move expired products to waste management system")}
              >
                <Button 
                  variant="danger" 
                  className="w-100 py-3 sci-fi-border hover-scale" 
                  onClick={handleProcessExpired}
                  onMouseEnter={handleButtonHover}
                >
                  <div className="d-flex flex-column align-items-center">
                    <FaRecycle className="mb-2 rotate-gear" size={24} />
                    <span style={{ letterSpacing: '1px' }}>RECYCLE EXPIRED ITEMS</span>
                  </div>
                </Button>
              </OverlayTrigger>
            </Col>
            <Col md={4} className="mb-2">
              <OverlayTrigger
                placement="top"
                delay={{ show: 250, hide: 150 }}
                overlay={renderTooltip("Send pending notifications to relevant stakeholders")}
              >
                <Button 
                  variant="success" 
                  className="w-100 py-3 sci-fi-border hover-scale" 
                  onClick={handleProcessNotifications}
                  disabled={stats.pendingNotifications === 0}
                  onMouseEnter={handleButtonHover}
                >
                  <div className="d-flex flex-column align-items-center position-relative">
                    <FaBell className="mb-2 highlight-glow" size={24} />
                    <span style={{ letterSpacing: '1px' }}>BROADCAST ALERTS</span>
                    {stats.pendingNotifications > 0 && (
                      <Badge 
                        bg="danger" 
                        pill 
                        className="position-absolute top-0 end-0 mt-1 me-1 pulse-border"
                        style={{ boxShadow: '0 0 5px var(--danger-color)' }}
                      >
                        {stats.pendingNotifications}
                      </Badge>
                    )}
                  </div>
                </Button>
              </OverlayTrigger>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Stats Cards */}
      <Row className="mb-4">
        {[
          {
            title: "INVENTORY COUNT",
            value: stats.totalProducts,
            icon: FaBoxOpen,
            color: "primary",
            link: "/inventory",
            linkText: "ACCESS INVENTORY",
            delay: 0.3
          },
          {
            title: "CRITICAL TIMELINE",
            value: stats.expiringProducts,
            icon: FaExclamationTriangle,
            color: "warning",
            link: "/inventory?status=active&expiry_days=7",
            linkText: "MONITOR EXPIRING",
            animate: stats.expiringProducts > 5 ? "highlight-glow" : "",
            delay: 0.4
          },
          {
            title: "EXPIRED UNITS",
            value: stats.expiredProducts,
            icon: FaRecycle,
            color: "danger",
            link: "/inventory?status=expired",
            linkText: "PROCESS EXPIRED",
            animate: stats.expiredProducts > 0 ? "pulse-border" : "",
            delay: 0.5
          },
          {
            title: "OPTIMIZED PRICING",
            value: stats.discountedProducts,
            icon: FaMicrochip,
            color: "success",
            link: "/inventory?status=discounted",
            linkText: "ACCESS DISCOUNTS",
            delay: 0.6
          }
        ].map((stat, index) => (
          <Col md={3} sm={6} className="mb-3" key={index}>
            <Card 
              className={`h-100 dashboard-card ${showStats ? 'scale-in' : ''}`} 
              style={{ animationDelay: `${stat.delay}s` }}
            >
              <Card.Body className="text-center">
                <div 
                  className={`rounded-circle p-3 d-inline-block mb-3 ${stat.animate || ''}`} 
                  style={{ 
                    background: `rgba(var(--${stat.color}-rgb), 0.1)`, 
                    boxShadow: `0 0 15px rgba(var(--${stat.color}-rgb), 0.2)` 
                  }}
                >
                  <stat.icon size={30} style={{ color: `var(--${stat.color}-color)` }} className="float" />
                </div>
                <h2 
                  style={{ color: `var(--${stat.color}-color)`, fontWeight: 'bold' }}
                  className="counter-value"
                  data-target={stat.value}
                >
                  {stat.value}
                </h2>
                <p 
                  style={{ color: 'var(--light-text)', letterSpacing: '1px', fontSize: '0.8rem' }}
                  className="text-uppercase"
                >
                  {stat.title}
                </p>
              </Card.Body>
              <Card.Footer className="text-center">
                <Link 
                  to={stat.link} 
                  className={`btn btn-sm btn-${stat.color} hover-scale`}
                  onMouseEnter={handleLinkHover}
                >
                  {stat.linkText}
                </Link>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
      
      {/* Waste Statistics Summary */}
      {stats.wasteStats && (
        <Row className="mb-4">
          <Col md={12}>
            <Card className={`dashboard-card ${showStats ? 'slide-up-animation' : ''}`} style={{ animationDelay: '0.7s' }}>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 sci-fi-title">WASTE STATISTICS SUMMARY</h5>
                <Link 
                  to="/analytics" 
                  className="btn btn-sm btn-outline-primary hover-scale"
                  onMouseEnter={handleLinkHover}
                >
                  <FaLink className="me-1" /> VIEW DETAILED ANALYTICS
                </Link>
              </Card.Header>
              <Card.Body className="bg-dark bg-opacity-10">
                <Row>
                  {[
                    {
                      title: "Total Waste Units",
                      value: stats.wasteStats.total_waste,
                      icon: FaServer,
                      color: "info",
                      trend: stats.wasteStats.total_waste_trend,
                      trendIcon: stats.wasteStats.total_waste_trend > 0 ? FaArrowUp : FaArrowDown,
                      trendColor: stats.wasteStats.total_waste_trend > 0 ? "danger" : "success"
                    },
                    {
                      title: "Recyclable Units",
                      value: stats.wasteStats.recyclable_waste,
                      icon: FaRecycle,
                      color: "success",
                      trend: stats.wasteStats.recyclable_waste_trend,
                      trendIcon: stats.wasteStats.recyclable_waste_trend > 0 ? FaArrowUp : FaArrowDown,
                      trendColor: stats.wasteStats.recyclable_waste_trend > 0 ? "success" : "danger"
                    },
                    {
                      title: "Recyclable Percentage",
                      value: `${stats.wasteStats.recyclable_percentage.toFixed(1)}%`,
                      icon: FaPercent,
                      color: "warning",
                      trend: stats.wasteStats.recyclable_percentage_trend,
                      trendIcon: stats.wasteStats.recyclable_percentage_trend > 0 ? FaArrowUp : FaArrowDown,
                      trendColor: stats.wasteStats.recyclable_percentage_trend > 0 ? "success" : "danger"
                    }
                  ].map((stat, index) => (
                    <Col md={4} className="text-center mb-3" key={index}>
                      <div 
                        className={`bg-${stat.color} bg-opacity-10 rounded-circle p-3 d-inline-block mb-2 ${index % 2 ? 'float' : 'pulse-border'}`}
                      >
                        <stat.icon className={`text-${stat.color}`} size={24} />
                      </div>
                      <h3 className="d-flex align-items-center justify-content-center">
                        {stat.value}
                        {stat.trend !== 0 && (
                          <span className={`ms-2 small text-${stat.trendColor}`}>
                            <stat.trendIcon /> {Math.abs(stat.trend).toFixed(1)}%
                          </span>
                        )}
                      </h3>
                      <p className="text-muted">{stat.title}</p>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
      
      <style jsx="true">{`
        .dashboard-container {
          animation: fadeIn 0.5s ease-in-out;
        }
        
        .rapid-access-menu {
          background: rgba(13, 110, 253, 0.05);
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
          border: 1px solid rgba(13, 110, 253, 0.1);
        }
        
        .rapid-access-item {
          color: var(--text-color);
          padding: 10px 15px;
          border-radius: 8px;
          transition: all 0.3s ease;
          display: block;
          flex: 1;
          text-align: center;
          min-width: 110px;
        }
        
        .rapid-access-item:hover {
          background: rgba(13, 110, 253, 0.1);
          transform: translateY(-5px);
        }
        
        .rapid-icon {
          font-size: 1.2rem;
          margin-right: 8px;
          color: var(--primary-color);
        }
        
        .rapid-label {
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 1px;
        }
        
        @keyframes spin-once {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .spin-once {
          animation: spin-once 1s ease-in-out;
        }
        
        @keyframes counter {
          from { opacity: 0.3; }
          to { opacity: 1; }
        }
        
        .counter-value {
          animation: counter 2s ease-out;
        }
        
        .sync-button {
          position: relative;
          overflow: hidden;
        }
        
        .sync-button:after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          transform: rotate(45deg);
          transition: all 1s ease;
          opacity: 0;
        }
        
        .sync-button:hover:after {
          opacity: 1;
          transform: rotate(45deg) translate(0, 100%);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
