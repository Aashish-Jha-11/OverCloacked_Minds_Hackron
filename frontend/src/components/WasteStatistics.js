import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form } from 'react-bootstrap';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { wasteRecordsApi } from '../services/api';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const WasteStatistics = () => {
  const [statistics, setStatistics] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchStatistics();
  }, [dateRange]);
  
  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const response = await wasteRecordsApi.getStatistics({
        start_date: dateRange.startDate,
        end_date: dateRange.endDate
      });
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching waste statistics:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  if (loading) {
    return (
      <Card className="shadow-sm">
        <Card.Header>Waste Statistics</Card.Header>
        <Card.Body className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading statistics...</p>
        </Card.Body>
      </Card>
    );
  }
  
  if (!statistics) {
    return (
      <Card className="shadow-sm">
        <Card.Header>Waste Statistics</Card.Header>
        <Card.Body>
          <p className="text-center">No statistics available</p>
        </Card.Body>
      </Card>
    );
  }
  
  // Prepare data for charts
  const wasteByTypeData = {
    labels: Object.keys(statistics.waste_by_type),
    datasets: [
      {
        label: 'Waste by Type',
        data: Object.values(statistics.waste_by_type),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const recyclableData = {
    labels: ['Recyclable', 'Non-Recyclable'],
    datasets: [
      {
        label: 'Recyclable vs Non-Recyclable',
        data: [statistics.recyclable_waste, statistics.non_recyclable_waste],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Sort dates for the trend chart
  const sortedDates = Object.keys(statistics.waste_by_date).sort();
  
  const wasteByDateData = {
    labels: sortedDates,
    datasets: [
      {
        label: 'Waste Trend',
        data: sortedDates.map(date => statistics.waste_by_date[date]),
        fill: false,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        tension: 0.1
      },
    ],
  };
  
  return (
    <Card className="shadow-sm">
      <Card.Header>Waste Statistics</Card.Header>
      <Card.Body>
        <Form className="mb-4">
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateChange}
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
        
        <Row className="mb-4">
          <Col md={4}>
            <Card className="text-center mb-3">
              <Card.Body>
                <h2>{statistics.total_waste}</h2>
                <p className="text-muted">Total Waste Units</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center mb-3">
              <Card.Body>
                <h2>{statistics.recyclable_waste}</h2>
                <p className="text-muted">Recyclable Units</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center mb-3">
              <Card.Body>
                <h2>{statistics.recyclable_percentage.toFixed(1)}%</h2>
                <p className="text-muted">Recyclable Percentage</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <Row>
          <Col md={6} className="mb-4">
            <h5 className="text-center mb-3">Waste by Type</h5>
            <div style={{ height: '300px' }}>
              <Bar 
                data={wasteByTypeData} 
                options={{ 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  }
                }} 
              />
            </div>
          </Col>
          <Col md={6} className="mb-4">
            <h5 className="text-center mb-3">Recyclable vs Non-Recyclable</h5>
            <div style={{ height: '300px' }}>
              <Pie 
                data={recyclableData} 
                options={{ 
                  maintainAspectRatio: false 
                }} 
              />
            </div>
          </Col>
        </Row>
        
        <Row>
          <Col md={12}>
            <h5 className="text-center mb-3">Waste Trend</h5>
            <div style={{ height: '300px' }}>
              <Line 
                data={wasteByDateData} 
                options={{ 
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }} 
              />
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default WasteStatistics;
