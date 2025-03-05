import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Form, Row, Col, Alert, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaPlus, FaFilter, FaSync, FaTrash, FaEdit, FaRecycle } from 'react-icons/fa';
import { wasteRecordsApi, productsApi } from '../services/api';

const WasteTracking = () => {
  const [wasteRecords, setWasteRecords] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    waste_type: '',
    recyclable: '',
    start_date: '',
    end_date: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecord, setNewRecord] = useState({
    product_id: '',
    quantity: 1,
    waste_type: 'Organic',
    recyclable: true,
    disposal_method: 'Recycling',
    disposal_date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  useEffect(() => {
    fetchWasteRecords();
    fetchProducts();
  }, []);
  
  const fetchWasteRecords = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await wasteRecordsApi.getAll(filters);
      setWasteRecords(response.data);
    } catch (err) {
      console.error('Error fetching waste records:', err);
      setError('Failed to load waste records. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchProducts = async () => {
    try {
      const response = await productsApi.getAll({ status: 'expired' });
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching expired products:', err);
      toast.error('Failed to load expired products');
    }
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const applyFilters = () => {
    fetchWasteRecords();
  };
  
  const clearFilters = () => {
    setFilters({
      waste_type: '',
      recyclable: '',
      start_date: '',
      end_date: ''
    });
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewRecord(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await wasteRecordsApi.create(newRecord);
      setWasteRecords([response.data, ...wasteRecords]);
      toast.success('Waste record created successfully');
      setShowAddModal(false);
      setNewRecord({
        product_id: '',
        quantity: 1,
        waste_type: 'Organic',
        recyclable: true,
        disposal_method: 'Recycling',
        disposal_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    } catch (err) {
      console.error('Error creating waste record:', err);
      toast.error('Failed to create waste record');
    }
  };
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Waste Tracking</h1>
        <div>
          <Button 
            variant="outline-primary" 
            className="me-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter className="me-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <Button 
            variant="primary"
            onClick={() => setShowAddModal(true)}
          >
            <FaPlus className="me-2" />
            Add Waste Record
          </Button>
        </div>
      </div>
      
      {showFilters && (
        <Card className="mb-4 shadow-sm">
          <Card.Header>
            <h5 className="mb-0">Filter Waste Records</h5>
          </Card.Header>
          <Card.Body>
            <Form>
              <Row>
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label>Waste Type</Form.Label>
                    <Form.Select 
                      name="waste_type"
                      value={filters.waste_type}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Types</option>
                      <option value="Organic">Organic</option>
                      <option value="Recyclable">Recyclable</option>
                      <option value="Non-recyclable">Non-recyclable</option>
                      <option value="Mixed">Mixed</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label>Recyclable</Form.Label>
                    <Form.Select 
                      name="recyclable"
                      value={filters.recyclable}
                      onChange={handleFilterChange}
                    >
                      <option value="">All</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control 
                      type="date" 
                      name="start_date"
                      value={filters.start_date}
                      onChange={handleFilterChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label>End Date</Form.Label>
                    <Form.Control 
                      type="date" 
                      name="end_date"
                      value={filters.end_date}
                      onChange={handleFilterChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex justify-content-end">
                <Button 
                  variant="outline-secondary" 
                  className="me-2"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
                <Button 
                  variant="primary"
                  onClick={applyFilters}
                >
                  Apply Filters
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}
      
      {error ? (
        <Alert variant="danger">
          <Alert.Heading>Error Loading Waste Records</Alert.Heading>
          <p>{error}</p>
          <Button 
            variant="outline-danger" 
            onClick={fetchWasteRecords}
          >
            <FaSync className="me-2" />
            Retry
          </Button>
        </Alert>
      ) : (
        <Card className="shadow-sm">
          <Card.Body>
            {loading ? (
              <div className="text-center p-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading waste records...</p>
              </div>
            ) : wasteRecords.length === 0 ? (
              <div className="text-center p-5">
                <p className="text-muted">No waste records found.</p>
                <Button 
                  variant="primary"
                  onClick={() => setShowAddModal(true)}
                >
                  <FaPlus className="me-2" />
                  Add First Waste Record
                </Button>
              </div>
            ) : (
              <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Waste Type</th>
                      <th>Recyclable</th>
                      <th>Disposal Method</th>
                      <th>Disposal Date</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wasteRecords.map(record => (
                      <tr key={record.id}>
                        <td>{record.id}</td>
                        <td>{record.product_name}</td>
                        <td>{record.quantity} {record.unit}</td>
                        <td>
                          <Badge bg={
                            record.waste_type === 'Organic' ? 'success' :
                            record.waste_type === 'Recyclable' ? 'info' :
                            record.waste_type === 'Non-recyclable' ? 'danger' : 'secondary'
                          }>
                            {record.waste_type}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={record.recyclable ? 'success' : 'danger'}>
                            {record.recyclable ? 'Yes' : 'No'}
                          </Badge>
                        </td>
                        <td>{record.disposal_method}</td>
                        <td>{new Date(record.disposal_date).toLocaleDateString()}</td>
                        <td>{record.notes || '-'}</td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-1"
                            title="Edit Record"
                          >
                            <FaEdit />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            title="Delete Record"
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      )}
      
      {/* Add Waste Record Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add Waste Record</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Product</Form.Label>
                  <Form.Select 
                    name="product_id"
                    value={newRecord.product_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Product</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {product.barcode}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control 
                    type="number" 
                    name="quantity"
                    value={newRecord.quantity}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Waste Type</Form.Label>
                  <Form.Select 
                    name="waste_type"
                    value={newRecord.waste_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Organic">Organic</option>
                    <option value="Recyclable">Recyclable</option>
                    <option value="Non-recyclable">Non-recyclable</option>
                    <option value="Mixed">Mixed</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group className="mt-4">
                  <Form.Check 
                    type="checkbox"
                    id="recyclable-checkbox"
                    label="Recyclable"
                    name="recyclable"
                    checked={newRecord.recyclable}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Disposal Method</Form.Label>
                  <Form.Select 
                    name="disposal_method"
                    value={newRecord.disposal_method}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Recycling">Recycling</option>
                    <option value="Composting">Composting</option>
                    <option value="Landfill">Landfill</option>
                    <option value="Donation">Donation</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Disposal Date</Form.Label>
                  <Form.Control 
                    type="date" 
                    name="disposal_date"
                    value={newRecord.disposal_date}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3}
                name="notes"
                value={newRecord.notes}
                onChange={handleInputChange}
                placeholder="Optional notes about this waste record"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              <FaRecycle className="me-2" />
              Create Waste Record
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default WasteTracking;
