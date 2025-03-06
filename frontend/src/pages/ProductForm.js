import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Alert, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaSave, FaArrowLeft, FaBarcode, FaInfoCircle, FaRegCalendarAlt, FaBoxOpen, FaMapMarkerAlt } from 'react-icons/fa';
import { productsApi, categoriesApi } from '../services/api';
import soundEffects from '../utils/soundEffects';
import '../styles/animations.css';

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
    location: ''
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validated, setValidated] = useState(false);
  const [formSections, setFormSections] = useState({
    basic: true,
    dates: true,
    inventory: true,
    pricing: true
  });
  
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
      soundEffects.playError();
    }
  };
  
  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    soundEffects.play('scan');
    
    try {
      const response = await productsApi.getById(id);
      
      // Format dates for form inputs
      const productData = {
        ...response.data,
        expiry_date: response.data.expiry_date ? response.data.expiry_date.split('T')[0] : '',
        manufacture_date: response.data.manufacture_date ? response.data.manufacture_date.split('T')[0] : ''
      };
      
      setProduct(productData);
      soundEffects.playSuccess();
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product. Please try again.');
      toast.error('Failed to load product');
      soundEffects.playError();
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
    soundEffects.play('typing');
  };
  
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    soundEffects.play('typing');
  };
  
  const generateBarcode = async () => {
    soundEffects.play('scan');
    try {
      const response = await productsApi.generateBarcode(product);
      setProduct(prev => ({ ...prev, barcode: response.data.barcode }));
      toast.success('Barcode generated successfully');
      soundEffects.playSuccess();
    } catch (err) {
      console.error('Error generating barcode:', err);
      toast.error('Failed to generate barcode');
      soundEffects.playError();
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      soundEffects.playError();
      return;
    }
    
    setLoading(true);
    setError(null);
    soundEffects.play('submit');
    
    try {
      let response;
      
      if (isEditMode) {
        response = await productsApi.update(id, product);
        toast.success(`Product "${product.name}" updated successfully`, {
          icon: "🔄"
        });
      } else {
        // Set initial status as active when creating
        const productData = { ...product, status: 'active' };
        response = await productsApi.create(productData);
        toast.success(`Product "${product.name}" created successfully`, {
          icon: "✅"
        });
      }
      
      soundEffects.playSuccess();
      navigate('/inventory');
    } catch (err) {
      console.error('Error saving product:', err);
      setError('Failed to save product. Please check your inputs and try again.');
      toast.error('Failed to save product');
      soundEffects.playError();
    } finally {
      setLoading(false);
    }
  };
  
  const toggleSection = (section) => {
    soundEffects.play('click');
    setFormSections({ ...formSections, [section]: !formSections[section] });
  };

  const handleButtonHover = () => {
    soundEffects.playHover();
  };
  
  const renderTooltip = (content) => (props) => (
    <Tooltip id="tooltip-info" {...props}>
      {content}
    </Tooltip>
  );
  
  if (loading && isEditMode) {
    return (
      <div className="text-center my-5 fade-in">
        <div className="glow-effect p-4 rounded-circle d-inline-block mb-3">
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
        </div>
        <p className="mt-3 slide-up-animation sci-fi-title">LOADING PRODUCT DATA...</p>
      </div>
    );
  }
  
  const selectedCategory = categories.find(c => c.name === product.category);
  
  return (
    <div className="product-form-container fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="sci-fi-title typing-effect">
          {isEditMode ? 'EDIT PRODUCT' : 'ADD NEW PRODUCT'}
        </h1>
        <Button 
          variant="outline-secondary" 
          onClick={() => {
            soundEffects.play('click');
            navigate('/inventory');
          }}
          className="hover-scale"
          onMouseEnter={handleButtonHover}
        >
          <FaArrowLeft className="me-2" />
          Back to Inventory
        </Button>
      </div>
      
      {error && (
        <Alert variant="danger" className="mb-4 shake">
          {error}
        </Alert>
      )}
      
      <Card className="shadow-sm scale-in glass-effect">
        <Card.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            {/* Basic Product Information */}
            <div className="form-section mb-4">
              <div 
                className="section-header d-flex justify-content-between align-items-center cursor-pointer mb-3"
                onClick={() => toggleSection('basic')}
              >
                <h4 className="m-0 d-flex align-items-center">
                  <span 
                    className={`me-2 ${formSections.basic ? 'rotate-gear' : ''}`} 
                    style={{ transition: 'transform 0.3s ease' }}
                  >
                    <FaBoxOpen />
                  </span>
                  Basic Information
                </h4>
                <div className={`section-arrow ${formSections.basic ? 'open' : 'closed'}`}>
                  ▼
                </div>
              </div>
              
              <div className={`section-content ${formSections.basic ? 'slide-down-animation' : 'd-none'}`}>
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
                        className="form-control-sci-fi"
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
                          className="form-control-sci-fi"
                        />
                        <Button 
                          variant="outline-secondary" 
                          onClick={generateBarcode}
                          disabled={loading}
                          className="hover-scale"
                          onMouseEnter={handleButtonHover}
                        >
                          <FaBarcode className="me-2 pulse-border" />
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
                      <Form.Label className="d-flex align-items-center">
                        Category
                        {selectedCategory && (
                          <OverlayTrigger
                            placement="top"
                            delay={{ show: 250, hide: 150 }}
                            overlay={renderTooltip(`This category has a discount threshold of ${selectedCategory.discount_threshold} days before expiry`)}
                          >
                            <span className="ms-2 text-primary">
                              <FaInfoCircle style={{ cursor: 'pointer' }} />
                            </span>
                          </OverlayTrigger>
                        )}
                      </Form.Label>
                      <Form.Select
                        name="category"
                        value={product.category}
                        onChange={handleChange}
                        required
                        className="form-control-sci-fi"
                      >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Text className="text-muted">
                        {selectedCategory && (
                          <span className="fade-in">
                            Products in this category will be discounted {selectedCategory.discount_threshold} days before expiry
                          </span>
                        )}
                      </Form.Text>
                      <Form.Control.Feedback type="invalid">
                        Category is required
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Location</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text bg-transparent">
                          <FaMapMarkerAlt />
                        </span>
                        <Form.Control
                          type="text"
                          name="location"
                          value={product.location}
                          onChange={handleChange}
                          required
                          placeholder="e.g., Shelf A"
                          className="form-control-sci-fi"
                        />
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            </div>
            
            {/* Dates Section */}
            <div className="form-section mb-4">
              <div 
                className="section-header d-flex justify-content-between align-items-center cursor-pointer mb-3"
                onClick={() => toggleSection('dates')}
              >
                <h4 className="m-0 d-flex align-items-center">
                  <span 
                    className={`me-2 ${formSections.dates ? 'rotate-gear' : ''}`} 
                    style={{ transition: 'transform 0.3s ease' }}
                  >
                    <FaRegCalendarAlt />
                  </span>
                  Dates
                </h4>
                <div className={`section-arrow ${formSections.dates ? 'open' : 'closed'}`}>
                  ▼
                </div>
              </div>
              
              <div className={`section-content ${formSections.dates ? 'slide-down-animation' : 'd-none'}`}>
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
                        className="form-control-sci-fi"
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
                        className="form-control-sci-fi"
                      />
                      <Form.Control.Feedback type="invalid">
                        Expiry date is required
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            </div>
            
            {/* Inventory Section */}
            <div className="form-section mb-4">
              <div 
                className="section-header d-flex justify-content-between align-items-center cursor-pointer mb-3"
                onClick={() => toggleSection('inventory')}
              >
                <h4 className="m-0 d-flex align-items-center">
                  <span 
                    className={`me-2 ${formSections.inventory ? 'rotate-gear' : ''}`} 
                    style={{ transition: 'transform 0.3s ease' }}
                  >
                    <FaBoxOpen />
                  </span>
                  Inventory
                </h4>
                <div className={`section-arrow ${formSections.inventory ? 'open' : 'closed'}`}>
                  ▼
                </div>
              </div>
              
              <div className={`section-content ${formSections.inventory ? 'slide-down-animation' : 'd-none'}`}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Quantity</Form.Label>
                      <Form.Control
                        type="number"
                        name="quantity"
                        value={product.quantity}
                        onChange={handleNumberChange}
                        required
                        min="0"
                        className="form-control-sci-fi"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Unit</Form.Label>
                      <Form.Select
                        name="unit"
                        value={product.unit}
                        onChange={handleChange}
                        required
                        className="form-control-sci-fi"
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
                </Row>
              </div>
            </div>
            
            {/* Price Section */}
            <div className="form-section mb-4">
              <div 
                className="section-header d-flex justify-content-between align-items-center cursor-pointer mb-3"
                onClick={() => toggleSection('pricing')}
              >
                <h4 className="m-0 d-flex align-items-center">
                  <span 
                    className={`me-2 ${formSections.pricing ? 'rotate-gear' : ''}`} 
                    style={{ transition: 'transform 0.3s ease' }}
                  >
                    <FaInfoCircle />
                  </span>
                  Pricing
                </h4>
                <div className={`section-arrow ${formSections.pricing ? 'open' : 'closed'}`}>
                  ▼
                </div>
              </div>
              
              <div className={`section-content ${formSections.pricing ? 'slide-down-animation' : 'd-none'}`}>
                <Row>
                  <Col md={6}>
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
                        className="form-control-sci-fi"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            </div>
            
            <div className="d-flex justify-content-end mt-4 slide-up-animation" style={{ animationDelay: '0.3s' }}>
              <Button 
                variant="secondary" 
                className="me-2 hover-scale"
                onClick={() => {
                  soundEffects.play('click');
                  navigate('/inventory');
                }}
                onMouseEnter={handleButtonHover}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                disabled={loading}
                className="pulse-border hover-scale"
                onMouseEnter={handleButtonHover}
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
      
      <style jsx="true">{`
        .form-section {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          padding: 15px;
          border: 1px solid rgba(13, 110, 253, 0.2);
          transition: all 0.3s ease;
        }
        
        .form-section:hover {
          box-shadow: 0 0 15px rgba(13, 110, 253, 0.15);
        }
        
        .section-header {
          color: var(--primary-color);
        }
        
        .section-arrow {
          font-size: 12px;
          transition: transform 0.3s ease;
        }
        
        .section-arrow.closed {
          transform: rotate(-90deg);
        }
        
        .section-content {
          transition: all 0.3s ease;
        }
        
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .slide-down-animation {
          animation: slide-down 0.3s ease forwards;
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
        }
      `}</style>
    </div>
  );
};

export default ProductForm;
