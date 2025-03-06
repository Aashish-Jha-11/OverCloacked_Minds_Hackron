import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Button, Form, Row, Col, Alert, Modal, Spinner, Badge, 
  InputGroup, FormControl, OverlayTrigger, Tooltip 
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaPlus, FaSync, FaEdit, FaTrash, FaInfo, FaRecycle } from 'react-icons/fa';
import { categoriesApi } from '../services/api';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    waste_type: 'Organic',
    recyclable: false,
    discount_threshold: 7
  });

  const [editCategory, setEditCategory] = useState({
    id: null,
    name: '',
    description: '',
    waste_type: '',
    recyclable: false,
    discount_threshold: 7
  });
  
  // Fetch all categories when component mounts
  useEffect(() => {
    fetchCategories();
  }, []);
  
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await categoriesApi.getAll();
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewCategory(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'discount_threshold' ? parseInt(value) || 0 : value)
    }));
  };
  
  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditCategory(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'discount_threshold' ? parseInt(value) || 0 : value)
    }));
  };
  
  const openEditModal = (category) => {
    setEditCategory({
      id: category.id,
      name: category.name,
      description: category.description || '',
      waste_type: category.waste_type,
      recyclable: category.recyclable,
      discount_threshold: category.discount_threshold
    });
    setShowEditModal(true);
  };
  
  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await categoriesApi.create(newCategory);
      setCategories([...categories, response.data]);
      toast.success('Category created successfully');
      setShowAddModal(false);
      setNewCategory({
        name: '',
        description: '',
        waste_type: 'Organic',
        recyclable: false,
        discount_threshold: 7
      });
    } catch (err) {
      console.error('Error creating category:', err);
      toast.error('Failed to create category');
    }
  };
  
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await categoriesApi.update(editCategory.id, editCategory);
      setCategories(categories.map(c => c.id === editCategory.id ? editCategory : c));
      toast.success('Category updated successfully');
      setShowEditModal(false);
    } catch (err) {
      console.error('Error updating category:', err);
      toast.error('Failed to update category');
    }
  };
  
  const handleDeleteCategory = async () => {
    try {
      setLoading(true);
      await categoriesApi.delete(selectedCategory.id);
      setCategories(categories.filter(c => c.id !== selectedCategory.id));
      toast.success('Category deleted successfully');
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error deleting category:', err);
      toast.error('Failed to delete category');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Categories Management</h1>
        <Button 
          variant="primary"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus className="me-2" />
          Add Category
        </Button>
      </div>
      
      {error ? (
        <Alert variant="danger">
          <Alert.Heading>Error Loading Categories</Alert.Heading>
          <p>{error}</p>
          <Button 
            variant="outline-danger" 
            onClick={fetchCategories}
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
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading categories...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center p-5">
                <p className="text-muted mb-3">No categories found.</p>
                <Button 
                  variant="primary"
                  onClick={() => setShowAddModal(true)}
                >
                  <FaPlus className="me-2" />
                  Create First Category
                </Button>
              </div>
            ) : (
              <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Waste Type</th>
                      <th>Recyclable</th>
                      <th>
                        Discount Threshold 
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id="discount-threshold-tooltip">
                              Days before expiry to start applying discounts
                            </Tooltip>
                          }
                        >
                          <span className="ms-1"><FaInfo size="12" /></span>
                        </OverlayTrigger>
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(category => (
                      <tr key={category.id}>
                        <td>{category.id}</td>
                        <td>{category.name}</td>
                        <td>{category.description || '-'}</td>
                        <td>
                          <Badge bg={
                            category.waste_type === 'Organic' ? 'success' :
                            category.waste_type === 'Recyclable' ? 'info' :
                            category.waste_type === 'Non-recyclable' ? 'danger' : 'secondary'
                          }>
                            {category.waste_type}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={category.recyclable ? 'success' : 'danger'}>
                            {category.recyclable ? 'Yes' : 'No'}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg="primary">
                            {category.discount_threshold} days
                          </Badge>
                        </td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-1"
                            onClick={() => openEditModal(category)}
                          >
                            <FaEdit />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => openDeleteModal(category)}
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
      
      {/* Add Category Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Category</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control 
                type="text" 
                name="name"
                value={newCategory.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={2}
                name="description"
                value={newCategory.description}
                onChange={handleInputChange}
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Waste Type</Form.Label>
                  <Form.Select 
                    name="waste_type"
                    value={newCategory.waste_type}
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
              
              <Col md={6}>
                <Form.Group className="mb-3 mt-4">
                  <Form.Check 
                    type="checkbox"
                    id="recyclable-checkbox"
                    label="Recyclable"
                    name="recyclable"
                    checked={newCategory.recyclable}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>
                Discount Threshold (Days)
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip id="discount-threshold-tooltip">
                      Number of days before expiry when products start getting discounted.
                      Different categories can have different thresholds.
                    </Tooltip>
                  }
                >
                  <span className="ms-1"><FaInfo size="12" /></span>
                </OverlayTrigger>
              </Form.Label>
              <InputGroup>
                <FormControl
                  type="number"
                  name="discount_threshold"
                  value={newCategory.discount_threshold}
                  onChange={handleInputChange}
                  min="1"
                  max="90"
                  required
                />
                <InputGroup.Text>days</InputGroup.Text>
              </InputGroup>
              <Form.Text className="text-muted">
                Products will start getting discounted when they are this many days away from expiry.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              <FaPlus className="me-2" />
              Create Category
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      
      {/* Edit Category Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Category</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control 
                type="text" 
                name="name"
                value={editCategory.name}
                onChange={handleEditInputChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={2}
                name="description"
                value={editCategory.description}
                onChange={handleEditInputChange}
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Waste Type</Form.Label>
                  <Form.Select 
                    name="waste_type"
                    value={editCategory.waste_type}
                    onChange={handleEditInputChange}
                    required
                  >
                    <option value="Organic">Organic</option>
                    <option value="Recyclable">Recyclable</option>
                    <option value="Non-recyclable">Non-recyclable</option>
                    <option value="Mixed">Mixed</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3 mt-4">
                  <Form.Check 
                    type="checkbox"
                    id="edit-recyclable-checkbox"
                    label="Recyclable"
                    name="recyclable"
                    checked={editCategory.recyclable}
                    onChange={handleEditInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>
                Discount Threshold (Days)
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip id="edit-discount-threshold-tooltip">
                      Number of days before expiry when products start getting discounted.
                      Different categories can have different thresholds.
                    </Tooltip>
                  }
                >
                  <span className="ms-1"><FaInfo size="12" /></span>
                </OverlayTrigger>
              </Form.Label>
              <InputGroup>
                <FormControl
                  type="number"
                  name="discount_threshold"
                  value={editCategory.discount_threshold}
                  onChange={handleEditInputChange}
                  min="1"
                  max="90"
                  required
                />
                <InputGroup.Text>days</InputGroup.Text>
              </InputGroup>
              <Form.Text className="text-muted">
                Products will start getting discounted when they are this many days away from expiry.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              <FaEdit className="me-2" />
              Update Category
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      
      {/* Delete Category Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => !loading && setShowDeleteModal(false)}>
        <Modal.Header closeButton={!loading}>
          <Modal.Title>Delete Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete the category <strong>{selectedCategory?.name}</strong>?</p>
          <Alert variant="warning">
            <FaInfo className="me-2" />
            All products in this category must be re-assigned before deletion.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteCategory} disabled={loading}>
            {loading ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Deleting...
              </>
            ) : (
              <>
                <FaTrash className="me-2" />
                Delete Category
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Categories;