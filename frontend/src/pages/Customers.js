import React, { useState, useEffect, useRef } from 'react';
import { Card, Table, Button, Form, Row, Col, Alert, Modal, Badge, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaPlus, FaFilter, FaSync, FaTrash, FaEdit, FaEnvelope, FaSms, FaHistory, FaFileImport, 
  FaUpload, FaFileCsv, FaFileCode, FaFileAlt, FaUserAstronaut, FaUserCog, FaSatelliteDish, 
  FaMicrochip, FaDatabase, FaNetworkWired } from 'react-icons/fa';
import { customersApi, purchaseHistoryApi } from '../services/api';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [importFormat, setImportFormat] = useState('csv');
  const [importFile, setImportFile] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const fileInputRef = useRef(null);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    notification_preference: 'email'
  });
  const [editCustomer, setEditCustomer] = useState({
    id: null,
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
  
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditCustomer(prev => ({ ...prev, [name]: value }));
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
  
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await customersApi.update(editCustomer.id, editCustomer);
      setCustomers(customers.map(c => c.id === editCustomer.id ? editCustomer : c));
      toast.success('Customer updated successfully');
      setShowEditModal(false);
    } catch (err) {
      console.error('Error updating customer:', err);
      toast.error('Failed to update customer');
    }
  };
  
  const handleDeleteCustomer = async () => {
    try {
      setLoading(true);
      await customersApi.delete(selectedCustomer.id);
      setCustomers(customers.filter(c => c.id !== selectedCustomer.id));
      toast.success('Customer deleted successfully');
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error deleting customer:', err);
      let errorMessage = 'Failed to delete customer';
      
      if (err.response && err.response.data && err.response.data.error) {
        errorMessage += `: ${err.response.data.error}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const openEditModal = (customer) => {
    setEditCustomer({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      notification_preference: customer.notification_preference
    });
    setShowEditModal(true);
  };
  
  const openDeleteModal = (customer) => {
    setSelectedCustomer(customer);
    setShowDeleteModal(true);
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
  
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
      setImportResults(null);
    }
  };
  
  const handleImportCustomers = async () => {
    if (!importFile) {
      toast.error('Please select a file to import');
      return;
    }
    
    try {
      setLoading(true);
      const response = await customersApi.import(importFile, importFormat);
      setImportResults(response.data);
      
      if (response.data.added > 0) {
        // Refresh the customer list
        fetchCustomers();
        toast.success(`Successfully imported ${response.data.added} customers`);
      } else {
        toast.warning('No customers were imported');
      }
    } catch (err) {
      console.error('Error importing customers:', err);
      toast.error('Failed to import customers');
    } finally {
      setLoading(false);
    }
  };
  
  const resetImportForm = () => {
    setImportFile(null);
    setImportResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 style={{ color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '2px' }}>
          <FaUserAstronaut className="me-2" /> CUSTOMER DATABASE
        </h1>
        <div>
          <Button 
            variant="success" 
            className="me-2 sci-fi-border"
            onClick={() => setShowImportModal(true)}
          >
            <FaFileImport className="me-2" />
            IMPORT DATA
          </Button>
          <Button 
            variant="primary"
            onClick={() => setShowAddModal(true)}
            className="sci-fi-border"
          >
            <FaPlus className="me-2" />
            ADD PROFILE
          </Button>
        </div>
      </div>
      
      {error ? (
        <Alert variant="danger" className="sci-fi-border">
          <Alert.Heading>
            <FaNetworkWired className="me-2" /> DATABASE ACCESS ERROR
          </Alert.Heading>
          <p style={{ fontFamily: 'monospace' }}>{error}</p>
          <Button 
            variant="danger" 
            onClick={fetchCustomers}
            className="glow-effect"
          >
            <FaDatabase className="me-2" /> REINITIALIZE CONNECTION
          </Button>
        </Alert>
      ) : (
        <Card className="dashboard-card">
          <Card.Header style={{ borderBottom: '1px solid var(--primary-color)' }}>
            <h5 className="mb-0" style={{ color: 'var(--primary-color)', letterSpacing: '1px' }}>
              <FaSatelliteDish className="me-2" /> CUSTOMER PROFILES
            </h5>
          </Card.Header>
          <Card.Body>
            {loading ? (
              <div className="text-center p-5">
                <div className="position-relative" style={{ width: '80px', height: '80px', margin: '0 auto' }}>
                  <div className="spinner-border text-primary" role="status" style={{ width: '80px', height: '80px' }}>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <div className="position-absolute" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <FaUserCog className="text-primary" style={{ animation: 'pulse 1.5s infinite' }} />
                  </div>
                </div>
                <p className="mt-3" style={{ color: 'var(--primary-color)', letterSpacing: '1px' }}>ACCESSING CUSTOMER DATABASE...</p>
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center p-5">
                <div style={{ marginBottom: '20px' }}>
                  <FaUserAstronaut style={{ fontSize: '3rem', color: 'var(--primary-color)', opacity: '0.6' }} />
                </div>
                <p style={{ color: 'var(--secondary-color)', letterSpacing: '1px', marginBottom: '20px' }}>NO CUSTOMER PROFILES DETECTED</p>
                <Button 
                  variant="primary"
                  onClick={() => setShowAddModal(true)}
                  className="sci-fi-border glow-effect"
                >
                  <FaPlus className="me-2" />
                  INITIALIZE FIRST PROFILE
                </Button>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="sci-fi-table">
                  <thead>
                    <tr>
                      <th style={{ color: 'var(--primary-color)', letterSpacing: '1px' }}>ID</th>
                      <th style={{ color: 'var(--primary-color)', letterSpacing: '1px' }}>NAME</th>
                      <th style={{ color: 'var(--primary-color)', letterSpacing: '1px' }}>EMAIL</th>
                      <th style={{ color: 'var(--primary-color)', letterSpacing: '1px' }}>PHONE</th>
                      <th style={{ color: 'var(--primary-color)', letterSpacing: '1px' }}>NOTIFICATION</th>
                      <th style={{ color: 'var(--primary-color)', letterSpacing: '1px' }}>CREATED</th>
                      <th style={{ color: 'var(--primary-color)', letterSpacing: '1px' }}>ACTIONS</th>
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
                          } style={{ 
                            background: customer.notification_preference === 'email' 
                              ? 'linear-gradient(45deg, var(--primary-color), var(--secondary-color))' 
                              : customer.notification_preference === 'sms'
                                ? 'linear-gradient(45deg, var(--success-color), #00796b)'
                                : 'linear-gradient(45deg, var(--info-color), #0277bd)',
                            boxShadow: '0 0 10px rgba(0, 188, 212, 0.3)',
                            padding: '0.4rem 0.6rem',
                            letterSpacing: '0.5px'
                          }}>
                            {customer.notification_preference === 'email' ? (
                              <><FaEnvelope className="me-1" /> EMAIL</>
                            ) : customer.notification_preference === 'sms' ? (
                              <><FaSms className="me-1" /> SMS</>
                            ) : (
                              <><FaEnvelope className="me-1" /><FaSms className="me-1" /> DUAL</>
                            )}
                          </Badge>
                        </td>
                        <td>{new Date(customer.created_at).toLocaleDateString()}</td>
                        <td>
                          <Button 
                            variant="info" 
                            size="sm" 
                            className="me-1 sci-fi-border"
                            title="View Transaction Logs"
                            onClick={() => viewPurchaseHistory(customer)}
                            style={{ padding: '0.25rem 0.5rem' }}
                          >
                            <FaHistory />
                          </Button>
                          <Button 
                            variant="primary" 
                            size="sm" 
                            className="me-1 sci-fi-border"
                            title="Modify Profile"
                            onClick={() => openEditModal(customer)}
                            style={{ padding: '0.25rem 0.5rem' }}
                          >
                            <FaEdit />
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm"
                            title="Delete Profile"
                            onClick={() => openDeleteModal(customer)}
                            className="sci-fi-border"
                            style={{ padding: '0.25rem 0.5rem' }}
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
        <Modal.Header closeButton style={{ borderBottom: '1px solid var(--primary-color)' }}>
          <Modal.Title style={{ color: 'var(--primary-color)', letterSpacing: '1px' }}>
            <FaUserAstronaut className="me-2" /> NEW PROFILE REGISTRATION
          </Modal.Title>
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
          <Modal.Footer style={{ borderTop: '1px solid var(--primary-color)' }}>
            <Button variant="secondary" onClick={() => setShowAddModal(false)} className="sci-fi-border">
              CANCEL
            </Button>
            <Button variant="primary" type="submit" className="sci-fi-border glow-effect">
              <FaPlus className="me-2" />
              CREATE PROFILE
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
        <Modal.Header closeButton style={{ borderBottom: '1px solid var(--primary-color)' }}>
          <Modal.Title style={{ color: 'var(--primary-color)', letterSpacing: '1px' }}>
            <FaHistory className="me-2" /> TRANSACTION LOGS - {selectedCustomer?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {historyLoading ? (
            <div className="text-center p-3">
              <div className="position-relative" style={{ width: '60px', height: '60px', margin: '0 auto' }}>
                <div className="spinner-border text-primary" role="status" style={{ width: '60px', height: '60px' }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
                <div className="position-absolute" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                  <FaDatabase className="text-primary" style={{ animation: 'pulse 1.5s infinite' }} />
                </div>
              </div>
              <p className="mt-2" style={{ color: 'var(--primary-color)', letterSpacing: '1px' }}>RETRIEVING TRANSACTION DATA...</p>
            </div>
          ) : purchaseHistory.length === 0 ? (
            <Alert variant="info" className="sci-fi-border" style={{ background: 'rgba(13, 71, 161, 0.1)' }}>
              <FaDatabase className="me-2" /> NO TRANSACTION RECORDS FOUND FOR THIS PROFILE.
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table hover className="sci-fi-table">
                <thead>
                  <tr>
                    <th style={{ color: 'var(--primary-color)', letterSpacing: '1px' }}>ID</th>
                    <th style={{ color: 'var(--primary-color)', letterSpacing: '1px' }}>PRODUCT</th>
                    <th style={{ color: 'var(--primary-color)', letterSpacing: '1px' }}>QUANTITY</th>
                    <th style={{ color: 'var(--primary-color)', letterSpacing: '1px' }}>TRANSACTION DATE</th>
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
        <Modal.Footer style={{ borderTop: '1px solid var(--primary-color)' }}>
          <Button variant="secondary" onClick={() => setShowHistoryModal(false)} className="sci-fi-border">
            CLOSE SESSION
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Edit Customer Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton style={{ borderBottom: '1px solid var(--primary-color)' }}>
          <Modal.Title style={{ color: 'var(--primary-color)', letterSpacing: '1px' }}>
            <FaUserCog className="me-2" /> MODIFY PROFILE
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control 
                type="text" 
                name="name"
                value={editCustomer.name}
                onChange={handleEditInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control 
                type="email" 
                name="email"
                value={editCustomer.email}
                onChange={handleEditInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone (Optional)</Form.Label>
              <Form.Control 
                type="tel" 
                name="phone"
                value={editCustomer.phone}
                onChange={handleEditInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Notification Preference</Form.Label>
              <Form.Select 
                name="notification_preference"
                value={editCustomer.notification_preference}
                onChange={handleEditInputChange}
                required
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="both">Both</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              <FaEdit className="me-2" />
              Update Customer
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      
      {/* Delete Customer Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => !loading && setShowDeleteModal(false)}>
        <Modal.Header closeButton={!loading} style={{ borderBottom: '1px solid var(--danger-color)' }}>
          <Modal.Title style={{ color: 'var(--danger-color)', letterSpacing: '1px' }}>
            <FaTrash className="me-2" /> CONFIRM DATA PURGE
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}>
            WARNING: You are about to permanently delete profile: <strong style={{ color: 'var(--danger-color)' }}>{selectedCustomer?.name}</strong>
          </p>
          <p style={{ color: 'var(--danger-color)', fontWeight: 'bold', letterSpacing: '1px', border: '1px solid var(--danger-color)', padding: '10px', background: 'rgba(244, 67, 54, 0.1)' }}>
            <FaTrash className="me-2" /> THIS OPERATION CANNOT BE REVERSED. ALL ASSOCIATED DATA WILL BE LOST.
          </p>
          {loading && (
            <div className="text-center mt-3">
              <div className="position-relative" style={{ width: '60px', height: '60px', margin: '0 auto' }}>
                <div className="spinner-border text-danger" role="status" style={{ width: '60px', height: '60px' }}>
                  <span className="visually-hidden">Deleting...</span>
                </div>
                <div className="position-absolute" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                  <FaTrash className="text-danger" style={{ animation: 'pulse 1.5s infinite' }} />
                </div>
              </div>
              <p className="mt-2" style={{ color: 'var(--danger-color)', letterSpacing: '1px' }}>EXECUTING DATA PURGE PROTOCOL...</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '1px solid var(--danger-color)' }}>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={loading} className="sci-fi-border">
            ABORT
          </Button>
          <Button variant="danger" onClick={handleDeleteCustomer} disabled={loading} className="sci-fi-border glow-effect">
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                PURGING DATA...
              </>
            ) : (
              <>
                <FaTrash className="me-2" />
                CONFIRM PURGE
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Import Customers Modal */}
      <Modal show={showImportModal} onHide={() => !loading && setShowImportModal(false)} size="lg">
        <Modal.Header closeButton={!loading} style={{ borderBottom: '1px solid var(--primary-color)' }}>
          <Modal.Title style={{ color: 'var(--primary-color)', letterSpacing: '1px' }}>
            <FaDatabase className="me-2" /> DATA IMPORT PROTOCOL
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>File Format</Form.Label>
              <div className="d-flex">
                <Form.Check
                  type="radio"
                  id="format-csv"
                  label={<><FaFileCsv className="me-1" /> CSV</>}
                  name="importFormat"
                  value="csv"
                  checked={importFormat === 'csv'}
                  onChange={() => setImportFormat('csv')}
                  className="me-3"
                />
                <Form.Check
                  type="radio"
                  id="format-json"
                  label={<><FaFileCode className="me-1" /> JSON</>}
                  name="importFormat"
                  value="json"
                  checked={importFormat === 'json'}
                  onChange={() => setImportFormat('json')}
                  className="me-3"
                />
                <Form.Check
                  type="radio"
                  id="format-txt"
                  label={<><FaFileAlt className="me-1" /> TXT</>}
                  name="importFormat"
                  value="txt"
                  checked={importFormat === 'txt'}
                  onChange={() => setImportFormat('txt')}
                />
              </div>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Select File</Form.Label>
              <Form.Control 
                type="file" 
                accept={importFormat === 'csv' ? '.csv' : importFormat === 'json' ? '.json' : '.txt'}
                onChange={handleFileChange}
                ref={fileInputRef}
                disabled={loading}
              />
            </Form.Group>
            
            {importFormat === 'csv' && (
              <Alert variant="info">
                <div className="mb-2"><strong>CSV Format Instructions:</strong></div>
                <p className="mb-1">Your CSV file should have the following columns:</p>
                <ul className="mb-0">
                  <li>name (required)</li>
                  <li>email</li>
                  <li>phone</li>
                  <li>address</li>
                </ul>
              </Alert>
            )}
            
            {importFormat === 'json' && (
              <Alert variant="info">
                <div className="mb-2"><strong>JSON Format Instructions:</strong></div>
                <p className="mb-1">Your JSON file should contain an array of objects with the following structure:</p>
                <pre className="mb-0">
                  {JSON.stringify([
                    {
                      "name": "Customer Name",
                      "email": "email@example.com",
                      "phone": "123-456-7890",
                      "address": "123 Main St"
                    }
                  ], null, 2)}
                </pre>
              </Alert>
            )}
            
            {importFormat === 'txt' && (
              <Alert variant="info">
                <div className="mb-2"><strong>TXT Format Instructions:</strong></div>
                <p className="mb-1">Each line should contain customer data separated by tabs or commas:</p>
                <pre className="mb-0">Name,Email,Phone,Address</pre>
                <p className="mt-2 mb-0">Example: John Doe,john@example.com,123-456-7890,123 Main St</p>
              </Alert>
            )}
            
            {importResults && (
              <Alert variant={importResults.added > 0 ? 'success' : 'warning'} className="mt-3">
                <div className="mb-2"><strong>Import Results:</strong></div>
                <p className="mb-1">Total records: {importResults.total}</p>
                <p className="mb-1">Successfully imported: {importResults.added}</p>
                {importResults.errors && importResults.errors.length > 0 && (
                  <>
                    <p className="mb-1">Errors:</p>
                    <ul className="mb-0">
                      {importResults.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </>
                )}
              </Alert>
            )}
            
            {loading && (
              <div className="text-center mt-3">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-2">Importing customers...</p>
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => {
              resetImportForm();
              setShowImportModal(false);
            }}
            disabled={loading}
          >
            Close
          </Button>
          <Button 
            variant="success" 
            onClick={handleImportCustomers}
            disabled={!importFile || loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Importing...
              </>
            ) : (
              <>
                <FaUpload className="me-2" />
                Import Customers
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Customers;
