import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaSave, FaArrowLeft, FaBarcode } from 'react-icons/fa';
import { productsApi, categoriesApi } from '../services/api';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [product, setProduct] = useState({
    name: '',
    barcode: '',
    category: '',
    expiry_date: '',
    manufacture_date: '',
    quantity: 0,
    unit: 'unit',
    price: 0,
    location: '',
    status: 'active'
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validated, setValidated] = useState(false);
  
  useEffect(() => {
    fetchCategories();
    
    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);
  
  const fetchCategories = async () => {
    try {
      const response = await categoriesApi.getAll();
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error('Failed to load categories');
    }
  };
  
  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await productsApi.getById(id);
      
      // Format dates for form inputs
      const productData = {
        ...response.data,
        expiry_date: response.data.expiry_date ? response.data.expiry_date.split('T')[0] : '',
        manufacture_date: response.data.manufacture_date ? response.data.manufacture_date.split('T')[0] : ''
      };
      
      setProduct(productData);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product. Please try again.');
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };
  
  const generateBarcode = async () => {
    try {
      const response = await productsApi.generateBarcode(product);
      setProduct(prev => ({ ...prev, barcode: response.data.barcode }));
      toast.success('Barcode generated successfully');
    } catch (err) {
      console.error('Error generating barcode:', err);
      toast.error('Failed to generate barcode');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      if (isEditMode) {
        response = await productsApi.update(id, product);
        toast.success(`Product "${product.name}" updated successfully`);
      } else {
        response = await productsApi.create(product);
        toast.success(`Product "${product.name}" created successfully`);
      }
      
      navigate('/inventory');
    } catch (err) {
      console.error('Error saving product:', err);
      setError('Failed to save product. Please check your inputs and try again.');
      toast.error('Failed to save product');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && isEditMode) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading product data...</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate('/inventory')}
        >
          <FaArrowLeft className="me-2" />
          Back to Inventory
        </Button>
      </div>
      
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      <Card className="shadow-sm">
        <Card.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={product.name}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Product name is required
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Barcode</Form.Label>
                  <div className="input-group">
                    <Form.Control
                      type="text"
                      name="barcode"
                      value={product.barcode}
                      onChange={handleChange}
                      required
                    />
                    <Button 
                      variant="outline-secondary" 
                      onClick={generateBarcode}
                      disabled={loading}
                    >
                      <FaBarcode className="me-2" />
                      Generate
                    </Button>
                  </div>
                  <Form.Control.Feedback type="invalid">
                    Barcode is required
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={product.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Category is required
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={product.status}
                    onChange={handleChange}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="discounted">Discounted</option>
                    <option value="expired">Expired</option>
                    <option value="disposed">Disposed</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Manufacture Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="manufacture_date"
                    value={product.manufacture_date}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Manufacture date is required
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Expiry Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="expiry_date"
                    value={product.expiry_date}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Expiry date is required
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    name="quantity"
                    value={product.quantity}
                    onChange={handleNumberChange}
                    required
                    min="0"
                  />
                </Form.Group>
              </Col>
              
              <Col md={2}>
                <Form.Group className="mb-3">
                  <Form.Label>Unit</Form.Label>
                  <Form.Select
                    name="unit"
                    value={product.unit}
                    onChange={handleChange}
                    required
                  >
                    <option value="unit">Unit</option>
                    <option value="kg">Kilogram</option>
                    <option value="g">Gram</option>
                    <option value="l">Liter</option>
                    <option value="ml">Milliliter</option>
                    <option value="box">Box</option>
                    <option value="pack">Pack</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Price (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={product.price}
                    onChange={handleNumberChange}
                    required
                    min="0"
                    step="0.01"
                  />
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={product.location}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Shelf A"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <div className="d-flex justify-content-end mt-4">
              <Button 
                variant="secondary" 
                className="me-2"
                onClick={() => navigate('/inventory')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="me-2" />
                    {isEditMode ? 'Update Product' : 'Save Product'}
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProductForm;
