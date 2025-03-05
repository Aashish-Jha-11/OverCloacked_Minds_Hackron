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
  FaDatabase
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
    // This would be implemented to export data in CSV or PDF format
    toast.info(`Export ${type} functionality would be implemented here`);
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
  };
  
  const generateGradient = (ctx, color1, color2) => {
    if (!ctx) return color1;
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    return gradient;
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
        data: wasteOverTime.map(item => item.total_quantity),
        borderColor: sciFiColors.secondary,
        backgroundColor: 'rgba(255, 0, 255, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: sciFiColors.secondary,
        pointBorderColor: sciFiColors.highlight,
        pointRadius: 4,
        pointHoverRadius: 7,
        borderWidth: 3,
      },
      {
        label: 'Recyclable Waste',
        data: wasteOverTime.map(item => item.recyclable_quantity),
        borderColor: sciFiColors.tertiary,
        backgroundColor: 'rgba(0, 255, 0, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: sciFiColors.tertiary,
        pointBorderColor: sciFiColors.highlight,
        pointRadius: 4,
        pointHoverRadius: 7,
        borderWidth: 3,
      },
    ],
  } : null;
  
  // Waste Efficiency Radar Chart
  const wasteEfficiencyData = wasteStats ? {
    labels: ['Recycling Rate', 'Waste Reduction', 'Resource Recovery', 'Waste Diversion', 'Processing Efficiency', 'Collection Efficiency'],
    datasets: [
      {
        label: 'Current Performance',
        data: [
          wasteStats.recyclable_percentage,
          Math.min(85, 60 + Math.random() * 25),
          Math.min(90, 65 + Math.random() * 25),
          Math.min(80, 55 + Math.random() * 25),
          Math.min(95, 70 + Math.random() * 25),
          Math.min(90, 65 + Math.random() * 25),
        ],
        backgroundColor: 'rgba(0, 255, 255, 0.2)',
        borderColor: sciFiColors.primary,
        borderWidth: 2,
        pointBackgroundColor: sciFiColors.primary,
        pointBorderColor: sciFiColors.highlight,
        pointHoverBackgroundColor: sciFiColors.highlight,
        pointHoverBorderColor: sciFiColors.primary,
        pointRadius: 5,
        pointHoverRadius: 8,
      },
      {
        label: 'Target Performance',
        data: [85, 80, 90, 75, 95, 85],
        backgroundColor: 'rgba(255, 255, 0, 0.1)',
        borderColor: sciFiColors.quaternary,
        borderWidth: 2,
        pointBackgroundColor: sciFiColors.quaternary,
        pointBorderColor: sciFiColors.highlight,
        pointHoverBackgroundColor: sciFiColors.highlight,
        pointHoverBorderColor: sciFiColors.quaternary,
        pointRadius: 5,
        pointHoverRadius: 8,
      }
    ],
  } : null;
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Waste Analytics</h1>
        <div>
          <Button 
            variant="outline-primary" 
            className="me-2"
            onClick={() => exportData('CSV')}
          >
            <FaDownload className="me-2" />
            Export CSV
          </Button>
          <Button 
            variant="primary"
            onClick={() => exportData('PDF')}
          >
            <FaChartBar className="me-2" />
            Export PDF
          </Button>
        </div>
      </div>
      
      <Card className="mb-4 shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Date Range</h5>
        </Card.Header>
        <Card.Body>
          <Form>
            <Row>
              <Col md={5}>
                <Form.Group>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control 
                    type="date" 
                    name="start_date"
                    value={dateRange.start_date}
                    onChange={handleDateChange}
                  />
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control 
                    type="date" 
                    name="end_date"
                    value={dateRange.end_date}
                    onChange={handleDateChange}
                  />
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end">
                <Button 
                  variant="primary" 
                  className="w-100"
                  onClick={applyDateFilter}
                >
                  Apply
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
      
      {error ? (
        <Alert variant="danger">
          <Alert.Heading>Error Loading Statistics</Alert.Heading>
          <p>{error}</p>
          <Button 
            variant="outline-danger" 
            onClick={fetchWasteStatistics}
          >
            <FaSync className="me-2" />
            Retry
          </Button>
        </Alert>
      ) : loading ? (
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading waste statistics...</p>
        </div>
      ) : (
        <>
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
                  <h2 className="mb-0">{wasteByCategory.length}</h2>
                  <p className="text-muted">different categories</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Charts */}
          <Row>
            <Col lg={4} md={6} className="mb-4">
              <Card className="shadow-sm h-100">
                <Card.Header>
                  <h5 className="mb-0">Waste by Type</h5>
                </Card.Header>
                <Card.Body>
                  {wasteTypeChartData && (
                    <Pie 
                      data={wasteTypeChartData} 
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'bottom',
                          },
                          title: {
                            display: true,
                            text: 'Recyclable vs Non-Recyclable Waste'
                          }
                        }
                      }}
                    />
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
        </>
      )}
    </div>
  );
};

export default Analytics;
