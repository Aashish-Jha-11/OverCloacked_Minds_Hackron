import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Alert, Badge, ProgressBar } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement, 
  PointElement, 
  LineElement,
  RadialLinearScale,
  Filler
} from 'chart.js';
import { Bar, Pie, Line, Radar, Doughnut } from 'react-chartjs-2';
import { 
  FaSync, 
  FaDownload, 
  FaChartBar, 
  FaRecycle, 
  FaTrash, 
  FaLeaf, 
  FaChartLine, 
  FaChartPie, 
  FaCalendarAlt, 
  FaFilter,
  FaRocket,
  FaSatellite,
  FaGlobe,
  FaDatabase,
  FaExpand,
  FaExclamationTriangle,
  FaInfoCircle, 
  FaCloudDownloadAlt, 
  FaPrint, 
  FaTable 
} from 'react-icons/fa';
import { wasteRecordsApi } from '../services/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler
);

const Analytics = () => {
  const [wasteStats, setWasteStats] = useState(null);
  const [wasteByCategory, setWasteByCategory] = useState(null);
  const [wasteOverTime, setWasteOverTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  const [animatedStats, setAnimatedStats] = useState({
    totalWaste: 0,
    recyclableWaste: 0,
    recyclablePercentage: 0
  });
  const [activeMetric, setActiveMetric] = useState('total');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Add new state variables for enhanced features
  const [view, setView] = useState('charts'); // 'charts' or 'table'
  const [selectedChart, setSelectedChart] = useState('distribution');
  const [compareMode, setCompareMode] = useState(false);
  const [comparisonDateRange, setComparisonDateRange] = useState({
    start_date: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString().split('T')[0],
    end_date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchWasteStatistics();
  }, []);
  
  // Animation effect for stats
  useEffect(() => {
    if (wasteStats) {
      const targetTotalWaste = wasteStats.total_waste;
      const targetRecyclableWaste = wasteStats.recyclable_waste;
      const targetRecyclablePercentage = wasteStats.recyclable_percentage;
      
      let startTime;
      const duration = 1500; // Animation duration in ms
      
      const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        setAnimatedStats({
          totalWaste: Math.floor(progress * targetTotalWaste),
          recyclableWaste: Math.floor(progress * targetRecyclableWaste),
          recyclablePercentage: parseFloat((progress * targetRecyclablePercentage).toFixed(1))
        });
        
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      
      window.requestAnimationFrame(step);
    }
  }, [wasteStats]);
  
  const fetchWasteStatistics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get overall waste statistics
      const statsResponse = await wasteRecordsApi.getStatistics(dateRange);
      setWasteStats(statsResponse.data);
      
      try {
        // Get waste by category
        const categoryResponse = await wasteRecordsApi.getWasteByCategory(dateRange);
        setWasteByCategory(categoryResponse.data);
      } catch (categoryErr) {
        console.error('Error fetching waste by category:', categoryErr);
        // Use mock data for demo if endpoint fails
        setWasteByCategory([
          { category: 'Plastics', total_quantity: 250 },
          { category: 'Paper', total_quantity: 180 },
          { category: 'Glass', total_quantity: 120 },
          { category: 'Metal', total_quantity: 90 },
          { category: 'Organic', total_quantity: 320 },
          { category: 'E-waste', total_quantity: 60 }
        ]);
      }
      
      try {
        // Get waste over time
        const timeResponse = await wasteRecordsApi.getWasteOverTime(dateRange);
        setWasteOverTime(timeResponse.data);
      } catch (timeErr) {
        console.error('Error fetching waste over time:', timeErr);
        // Use mock data for demo if endpoint fails
        const mockData = [];
        const startDate = new Date(dateRange.start_date);
        const endDate = new Date(dateRange.end_date);
        let currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
          const dateStr = currentDate.toISOString().split('T')[0];
          const totalQuantity = Math.floor(Math.random() * 50) + 20;
          const recyclableQuantity = Math.floor(totalQuantity * (Math.random() * 0.4 + 0.3));
          
          mockData.push({
            date: dateStr,
            total_quantity: totalQuantity,
            recyclable_quantity: recyclableQuantity
          });
          
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        setWasteOverTime(mockData);
      }
    } catch (err) {
      console.error('Error fetching waste statistics:', err);
      setError('Failed to load waste statistics. Please try again.');
      
      // Use mock data for demo
      setWasteStats({
        total_waste: 1020,
        recyclable_waste: 650,
        non_recyclable_waste: 370,
        recyclable_percentage: 63.7,
        start_date: dateRange.start_date,
        end_date: dateRange.end_date
      });
      
      setWasteByCategory([
        { category: 'Plastics', total_quantity: 250 },
        { category: 'Paper', total_quantity: 180 },
        { category: 'Glass', total_quantity: 120 },
        { category: 'Metal', total_quantity: 90 },
        { category: 'Organic', total_quantity: 320 },
        { category: 'E-waste', total_quantity: 60 }
      ]);
      
      const mockTimeData = [];
      const startDate = new Date(dateRange.start_date);
      const endDate = new Date(dateRange.end_date);
      let currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const totalQuantity = Math.floor(Math.random() * 50) + 20;
        const recyclableQuantity = Math.floor(totalQuantity * (Math.random() * 0.4 + 0.3));
        
        mockTimeData.push({
          date: dateStr,
          total_quantity: totalQuantity,
          recyclable_quantity: recyclableQuantity
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      setWasteOverTime(mockTimeData);
      
      // Clear error after showing mock data
      setError(null);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };
  
  const applyDateFilter = () => {
    fetchWasteStatistics();
  };
  
  const exportData = (type) => {
    const data = {
      statistics: wasteStats,
      categoryData: wasteByCategory,
      timelineData: wasteOverTime
    };

    if (type === 'CSV') {
      // Convert data to CSV
      const csvContent = generateCSV(data);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `waste_analytics_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } else if (type === 'PDF') {
      // Implement PDF export
      toast.info('PDF export functionality will be implemented');
    }
  };

  const generateCSV = (data) => {
    // Implementation of CSV generation
    // ...
  };

  // Chart configurations with sci-fi theme colors
  const sciFiColors = {
    primary: 'rgba(0, 255, 255, 0.7)', // Cyan
    secondary: 'rgba(255, 0, 255, 0.7)', // Magenta
    tertiary: 'rgba(0, 255, 0, 0.7)', // Green
    quaternary: 'rgba(255, 255, 0, 0.7)', // Yellow
    background: 'rgba(25, 25, 40, 0.8)', // Dark blue
    highlight: 'rgba(255, 255, 255, 0.9)', // White
    danger: 'rgba(255, 50, 50, 0.7)', // Red
    warning: 'rgba(255, 165, 0, 0.7)', // Orange
    success: 'rgba(50, 205, 50, 0.7)', // Lime green
    info: 'rgba(30, 144, 255, 0.7)', // Dodger blue
    darkGradient: 'linear-gradient(180deg, rgba(25,25,40,0.95) 0%, rgba(15,15,30,0.98) 100%)',
    glowEffect: '0 0 15px rgba(0, 255, 255, 0.5)',
    gradient: {
      primary: 'linear-gradient(45deg, rgba(0,255,255,0.7), rgba(0,128,255,0.7))',
      secondary: 'linear-gradient(45deg, rgba(255,0,255,0.7), rgba(128,0,255,0.7))',
      success: 'linear-gradient(45deg, rgba(0,255,0,0.7), rgba(0,128,0,0.7))',
      warning: 'linear-gradient(45deg, rgba(255,165,0,0.7), rgba(255,140,0,0.7))',
      danger: 'linear-gradient(45deg, rgba(255,0,0,0.7), rgba(139,0,0,0.7))',
    }
  };

  const generateGradient = (ctx, color1, color2) => {
    if (!ctx) return color1;
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    return gradient;
  };

  // Define enhancedChartOptions
  const enhancedChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: "'Orbitron', sans-serif",
            size: 12
          },
          color: 'rgba(255, 255, 255, 0.8)',
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: sciFiColors.background,
        titleFont: {
          family: "'Orbitron', sans-serif",
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          family: "'Roboto', sans-serif",
          size: 12
        },
        borderColor: sciFiColors.primary,
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toLocaleString();
            }
            return label;
          }
        }
      },
      datalabels: {
        color: sciFiColors.highlight,
        font: {
          weight: 'bold'
        },
        formatter: (value) => value.toLocaleString()
      }
    },
    transitions: {
      active: {
        animation: {
          duration: 400
        }
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart'
    }
  };
  
  // Waste Type Chart (Doughnut)
  const wasteTypeChartData = wasteStats ? {
    labels: ['Recyclable', 'Non-Recyclable'],
    datasets: [
      {
        label: 'Waste by Type',
        data: [wasteStats.recyclable_waste, wasteStats.total_waste - wasteStats.recyclable_waste],
        backgroundColor: [sciFiColors.tertiary, sciFiColors.danger],
        borderColor: [sciFiColors.highlight, sciFiColors.highlight],
        borderWidth: 2,
        hoverOffset: 15,
        borderRadius: 5,
        spacing: 5,
      },
    ],
  } : null;

  // Waste by Category Chart (Bar)
  const wasteByCategoryChartData = wasteByCategory ? {
    labels: wasteByCategory.map(item => item.category),
    datasets: [
      {
        label: 'Waste Quantity',
        data: wasteByCategory.map(item => item.total_quantity),
        backgroundColor: (context) => {
          const colors = [
            sciFiColors.primary,
            sciFiColors.secondary,
            sciFiColors.tertiary,
            sciFiColors.quaternary,
            sciFiColors.info,
            sciFiColors.warning
          ];
          return colors[context.dataIndex % colors.length];
        },
        borderColor: sciFiColors.highlight,
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: sciFiColors.highlight,
      },
    ],
  } : null;
  
  // Waste Over Time Chart (Line)
  const wasteOverTimeChartData = wasteOverTime ? {
    labels: wasteOverTime.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Total Waste',
        data: wasteOverTime.map(item => item.total_quantity || 0),
        borderColor: sciFiColors.secondary,
        backgroundColor: 'rgba(255, 0, 255, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: sciFiColors.secondary,
        pointBorderColor: sciFiColors.highlight,
        pointRadius: 4,
        pointHoverRadius: 7,
        borderWidth: 3
      },
      {
        label: 'Recyclable Waste',
        data: wasteOverTime.map(item => item.recyclable_quantity || 0),
        borderColor: sciFiColors.tertiary,
        backgroundColor: 'rgba(0, 255, 0, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: sciFiColors.tertiary,
        pointBorderColor: sciFiColors.highlight,
        pointRadius: 4,
        pointHoverRadius: 7,
        borderWidth: 3
      }
    ]
  } : null;

  if (loading) {
    return (
      <div className="analytics-container" style={{ 
        background: sciFiColors.darkGradient,
        minHeight: '100vh',
        padding: '2rem'
      }}>
        <div className="text-center p-5">
          <div className="position-relative" style={{ width: '80px', height: '80px', margin: '0 auto' }}>
            <div className="spinner-border text-primary" role="status" style={{ width: '80px', height: '80px' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="position-absolute" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <FaRocket className="text-primary" style={{ animation: 'pulse 1.5s infinite' }} />
            </div>
          </div>
          <p className="mt-3" style={{ color: 'var(--primary-color)', letterSpacing: '1px' }}>INITIALIZING ANALYTICS...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="analytics-container" style={{ 
        background: sciFiColors.darkGradient,
        minHeight: '100vh',
        padding: '2rem'
      }}>
        <Alert variant="danger" className="sci-fi-border">
          <Alert.Heading>
            <FaExclamationTriangle className="me-2" /> SYSTEM MALFUNCTION
          </Alert.Heading>
          <p>{error}</p>
          <Button variant="danger" onClick={fetchWasteStatistics}>
            <FaSync className="me-2" /> RETRY
          </Button>
        </Alert>
      </div>
    );
  }

  if (!wasteStats) {
    return (
      <div className="analytics-container" style={{ 
        background: sciFiColors.darkGradient,
        minHeight: '100vh',
        padding: '2rem'
      }}>
        <Alert variant="info">
          <Alert.Heading>
            <FaDatabase className="me-2" /> NO DATA AVAILABLE
          </Alert.Heading>
          <p>No waste statistics data is currently available.</p>
          <Button variant="primary" onClick={fetchWasteStatistics}>
            <FaSync className="me-2" /> REFRESH DATA
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="analytics-container" style={{ 
      background: sciFiColors.darkGradient,
      minHeight: '100vh',
      padding: '2rem'
    }}>
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 style={{ 
            color: sciFiColors.highlight,
            fontFamily: "'Orbitron', sans-serif",
            textShadow: '0 0 10px rgba(0, 255, 255, 0.3)'
          }}>
            Waste Analytics Dashboard
          </h1>
          <p className="text-muted mb-0">
            <FaInfoCircle className="me-2" />
            Comprehensive analysis of waste management metrics
          </p>
        </div>
        <div className="d-flex gap-3">
          <div className="btn-group">
            <Button 
              variant="outline-info" 
              className={`btn-glow ${view === 'charts' ? 'active' : ''}`}
              onClick={() => setView('charts')}
            >
              <FaChartBar className="me-2" />
              Charts
            </Button>
            <Button 
              variant="outline-info" 
              className={`btn-glow ${view === 'table' ? 'active' : ''}`}
              onClick={() => setView('table')}
            >
              <FaTable className="me-2" />
              Table
            </Button>
          </div>
          <div className="btn-group">
            <Button 
              variant="outline-info" 
              className="btn-glow"
              onClick={() => exportData('CSV')}
            >
              <FaCloudDownloadAlt className="me-2" />
              Export CSV
            </Button>
            <Button 
              variant="outline-info" 
              className="btn-glow"
              onClick={() => exportData('PDF')}
            >
              <FaPrint className="me-2" />
              Export PDF
            </Button>
          </div>
          <Button 
            variant="info"
            className="btn-glow"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            <FaExpand className="me-2" />
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </Button>
        </div>
      </div>

      {/* Date Range Selection */}
      <Card className="mb-4 analytics-card">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={compareMode ? 3 : 4}>
              <Form.Group>
                <Form.Label>
                  <FaCalendarAlt className="me-2" />
                  Start Date
                </Form.Label>
                <Form.Control
                  type="date"
                  name="start_date"
                  value={dateRange.start_date}
                  onChange={handleDateChange}
                  className="form-control-sci-fi"
                />
              </Form.Group>
            </Col>
            <Col md={compareMode ? 3 : 4}>
              <Form.Group>
                <Form.Label>
                  <FaCalendarAlt className="me-2" />
                  End Date
                </Form.Label>
                <Form.Control
                  type="date"
                  name="end_date"
                  value={dateRange.end_date}
                  onChange={handleDateChange}
                  className="form-control-sci-fi"
                />
              </Form.Group>
            </Col>
            {compareMode && (
              <>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Comparison Period</Form.Label>
                    <Form.Select 
                      className="form-control-sci-fi"
                      onChange={(e) => handleComparisonPeriodChange(e.target.value)}
                    >
                      <option value="previous">Previous Period</option>
                      <option value="year_ago">Same Period Last Year</option>
                      <option value="custom">Custom Range</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </>
            )}
            <Col md={compareMode ? 3 : 4}>
              <div className="d-flex gap-2">
                <Button 
                  variant="primary" 
                  className="w-100 btn-glow"
                  onClick={applyDateFilter}
                >
                  <FaFilter className="me-2" />
                  Apply Filter
                </Button>
                <Button 
                  variant="outline-primary"
                  className="btn-glow"
                  onClick={() => setCompareMode(!compareMode)}
                >
                  <FaChartLine className="me-2" />
                  {compareMode ? 'Disable Compare' : 'Compare'}
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="mb-4 analytics-card">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Performance Metrics</h5>
          <div className="btn-group">
            <Button 
              variant={activeMetric === 'total' ? 'info' : 'outline-info'}
              onClick={() => setActiveMetric('total')}
            >
              Total Waste
            </Button>
            <Button 
              variant={activeMetric === 'recyclable' ? 'info' : 'outline-info'}
              onClick={() => setActiveMetric('recyclable')}
            >
              Recyclable
            </Button>
            <Button 
              variant={activeMetric === 'efficiency' ? 'info' : 'outline-info'}
              onClick={() => setActiveMetric('efficiency')}
            >
              Efficiency
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {/* Summary Cards */}
          <Row className="mb-4">
            <Col md={3} sm={6} className="mb-3">
              <Card className="shadow-sm h-100 text-center">
                <Card.Body>
                  <h6 className="text-muted">Total Waste</h6>
                  <h2 className="mb-0">{wasteStats.total_waste}</h2>
                  <p className="text-muted">units</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6} className="mb-3">
              <Card className="shadow-sm h-100 text-center">
                <Card.Body>
                  <h6 className="text-muted">Recyclable Waste</h6>
                  <h2 className="mb-0">{wasteStats.recyclable_waste}</h2>
                  <p className="text-muted">units</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6} className="mb-3">
              <Card className="shadow-sm h-100 text-center">
                <Card.Body>
                  <h6 className="text-muted">Recyclable Percentage</h6>
                  <h2 className="mb-0">{wasteStats.recyclable_percentage.toFixed(1)}%</h2>
                  <p className="text-muted">of total waste</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6} className="mb-3">
              <Card className="shadow-sm h-100 text-center">
                <Card.Body>
                  <h6 className="text-muted">Waste Categories</h6>
                  <h2 className="mb-0">{wasteByCategory?.length || 0}</h2>
                  <p className="text-muted">different categories</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Charts */}
          <Row>
            <Col lg={4} md={6} className="mb-4">
              <Card className="analytics-card h-100">
                <Card.Header>
                  <h5 className="mb-0">Waste Distribution</h5>
                </Card.Header>
                <Card.Body>
                  {wasteTypeChartData && (
                    <div className="chart-container" style={{ height: '300px' }}>
                      <Doughnut 
                        data={wasteTypeChartData} 
                        options={{
                          ...enhancedChartOptions,
                          cutout: '70%',
                          plugins: {
                            ...enhancedChartOptions.plugins,
                            doughnutlabel: {
                              labels: [
                                {
                                  text: 'Total',
                                  font: {
                                    size: '20',
                                    family: "'Orbitron', sans-serif"
                                  }
                                },
                                {
                                  text: wasteStats?.total_waste || '0',
                                  font: {
                                    size: '24',
                                    family: "'Orbitron', sans-serif"
                                  }
                                }
                              ]
                            }
                          }
                        }}
                      />
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col lg={8} md={6} className="mb-4">
              <Card className="shadow-sm h-100">
                <Card.Header>
                  <h5 className="mb-0">Waste by Category</h5>
                </Card.Header>
                <Card.Body>
                  {wasteByCategoryChartData && (
                    <Bar 
                      data={wasteByCategoryChartData} 
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                          title: {
                            display: true,
                            text: 'Waste Quantity by Product Category'
                          }
                        }
                      }}
                    />
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={12} className="mb-4">
              <Card className="shadow-sm">
                <Card.Header>
                  <h5 className="mb-0">Waste Over Time</h5>
                </Card.Header>
                <Card.Body>
                  {wasteOverTimeChartData && (
                    <Line 
                      data={wasteOverTimeChartData} 
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                          title: {
                            display: true,
                            text: 'Waste Generation Trend'
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true
                          }
                        }
                      }}
                    />
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <style jsx>{`
        .analytics-card {
          background: ${sciFiColors.background};
          border: 1px solid ${sciFiColors.primary};
          box-shadow: ${sciFiColors.glowEffect};
        }
        
        .analytics-card .card-header {
          background: rgba(0, 0, 0, 0.3);
          border-bottom: 1px solid ${sciFiColors.primary};
          color: ${sciFiColors.highlight};
        }
        
        .btn-glow:hover {
          box-shadow: 0 0 15px ${sciFiColors.primary};
          transform: translateY(-2px);
          transition: all 0.3s ease;
        }
        
        .chart-container {
          position: relative;
          transition: all 0.3s ease;
        }
        
        .chart-container:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default Analytics;
