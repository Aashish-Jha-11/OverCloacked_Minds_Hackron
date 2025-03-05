import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Row, Col, Alert, Modal, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaPlus, FaFilter, FaSync, FaTrash, FaEdit, FaEnvelope, FaSms, FaHistory } from 'react-icons/fa';
import { customersApi, purchaseHistoryApi } from '../services/api';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    notification_preference: 'email'
  });
  
  useEffect(() => {
    fetchCustomers();
  }, []);
  
  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await customersApi.getAll();
      setCustomers(response.data);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await customersApi.create(newCustomer);
      setCustomers([...customers, response.data]);
      toast.success('Customer created successfully');
      setShowAddModal(false);
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        notification_preference: 'email'
      });
    } catch (err) {
      console.error('Error creating customer:', err);
      toast.error('Failed to create customer');
    }
  };
  
  const viewPurchaseHistory = async (customer) => {
    setSelectedCustomer(customer);
    setHistoryLoading(true);
    setShowHistoryModal(true);
    
    try {
      const response = await purchaseHistoryApi.getByCustomer(customer.id);
      setPurchaseHistory(response.data);
    } catch (err) {
      console.error('Error fetching purchase history:', err);
      toast.error('Failed to load purchase history');
    } finally {
      setHistoryLoading(false);
    }
  };
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Customers</h1>
        <Button 
          variant="primary"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus className="me-2" />
          Add Customer
        </Button>
      </div>
      
      {error ? (
        <Alert variant="danger">
          <Alert.Heading>Error Loading Customers</Alert.Heading>
          <p>{error}</p>
          <Button 
            variant="outline-danger" 
            onClick={fetchCustomers}
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
                <p className="mt-3">Loading customers...</p>
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center p-5">
                <p className="text-muted">No customers found.</p>
                <Button 
                  variant="primary"
                  onClick={() => setShowAddModal(true)}
                >
                  <FaPlus className="me-2" />
                  Add First Customer
                </Button>
              </div>
            ) : (
              <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Notification Preference</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map(customer => (
                      <tr key={customer.id}>
                        <td>{customer.id}</td>
                        <td>{customer.name}</td>
                        <td>{customer.email}</td>
                        <td>{customer.phone || '-'}</td>
                        <td>
                          <Badge bg={
                            customer.notification_preference === 'email' ? 'primary' :
                            customer.notification_preference === 'sms' ? 'success' : 'info'
                          }>
                            {customer.notification_preference === 'email' ? (
                              <><FaEnvelope className="me-1" /> Email</>
                            ) : customer.notification_preference === 'sms' ? (
                              <><FaSms className="me-1" /> SMS</>
                            ) : (
                              <><FaEnvelope className="me-1" /><FaSms className="me-1" /> Both</>
                            )}
                          </Badge>
                        </td>
                        <td>{new Date(customer.created_at).toLocaleDateString()}</td>
                        <td>
                          <Button 
                            variant="outline-info" 
                            size="sm" 
                            className="me-1"
                            title="View Purchase History"
                            onClick={() => viewPurchaseHistory(customer)}
                          >
                            <FaHistory />
                          </Button>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-1"
                            title="Edit Customer"
                          >
                            <FaEdit />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            title="Delete Customer"
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
      
      {/* Add Customer Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Customer</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control 
                type="text" 
                name="name"
                value={newCustomer.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control 
                type="email" 
                name="email"
                value={newCustomer.email}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone (Optional)</Form.Label>
              <Form.Control 
                type="tel" 
                name="phone"
                value={newCustomer.phone}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Notification Preference</Form.Label>
              <Form.Select 
                name="notification_preference"
                value={newCustomer.notification_preference}
                onChange={handleInputChange}
                required
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="both">Both</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              <FaPlus className="me-2" />
              Create Customer
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      
      {/* Purchase History Modal */}
      <Modal 
        show={showHistoryModal} 
        onHide={() => setShowHistoryModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Purchase History - {selectedCustomer?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {historyLoading ? (
            <div className="text-center p-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading purchase history...</p>
            </div>
          ) : purchaseHistory.length === 0 ? (
            <Alert variant="info">
              No purchase history found for this customer.
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Purchase Date</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseHistory.map(purchase => (
                    <tr key={purchase.id}>
                      <td>{purchase.id}</td>
                      <td>{purchase.product_name}</td>
                      <td>{purchase.quantity} {purchase.unit}</td>
                      <td>{new Date(purchase.purchase_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHistoryModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Customers;
