import React, { useState, useRef } from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { FaEdit, FaTrash, FaBarcode, FaInfoCircle } from 'react-icons/fa';
import soundEffects from '../utils/soundEffects';
import '../styles/animations.css';

const getStatusBadge = (status) => {
  switch (status) {
    case 'active':
      return <Badge bg="success" className="pulse-border">Active</Badge>;
    case 'discounted':
      return <Badge bg="warning" className="highlight-glow">Discounted</Badge>;
    case 'expired':
      return <Badge bg="danger" className="shake">Expired</Badge>;
    case 'disposed':
      return <Badge bg="secondary">Disposed</Badge>;
    default:
      return <Badge bg="info">{status}</Badge>;
  }
};

const ProductCard = ({ product, onEdit, onDelete, onViewBarcode }) => {
  const daysUntilExpiry = product.days_until_expiry;
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  
  const handleMouseEnter = () => {
    setIsHovered(true);
    soundEffects.playHover();
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  
  const handleButtonClick = (action, item) => {
    soundEffects.playClick();
    if (action === 'edit') {
      onEdit(item);
    } else if (action === 'delete') {
      onDelete(item.id);
    } else if (action === 'barcode') {
      onViewBarcode(item);
      soundEffects.play('scan');
    }
  };
  
  return (
    <Card 
      className={`h-100 shadow-sm scale-in ${isHovered ? 'highlight-glow' : ''}`}
      style={{
        transform: isHovered ? 'translateY(-10px)' : 'translateY(0)',
        transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      }} 
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          {getStatusBadge(product.status)}
        </div>
        <small className="text-muted">ID: {product.id}</small>
      </Card.Header>
      <Card.Body>
        <Card.Title className="d-flex align-items-center">
          {product.name}
          {isHovered && (
            <FaInfoCircle 
              className="ms-2 text-primary fade-in" 
              title="Product details" 
              style={{ opacity: 0.7 }}
            />
          )}
        </Card.Title>
        <Card.Text>
          <strong>Category:</strong> {product.category}<br />
          <strong>Barcode:</strong> {product.barcode}<br />
          <strong>Quantity:</strong> {product.quantity} {product.unit}<br />
          <strong>Location:</strong> {product.location}<br />
          <strong>Expiry:</strong> {product.expiry_date}
          {daysUntilExpiry !== null && (
            <Badge 
              bg={daysUntilExpiry <= 0 ? 'danger' : daysUntilExpiry <= 7 ? 'warning' : 'info'} 
              className={`ms-2 ${daysUntilExpiry <= 3 ? 'highlight-glow' : ''}`}
            >
              {daysUntilExpiry <= 0 
                ? 'Expired' 
                : `${daysUntilExpiry} days left`}
            </Badge>
          )}
          <br />
          <strong>Price:</strong> ${product.price.toFixed(2)}
          {product.discounted_price && (
            <div className="mt-1">
              <span className="text-decoration-line-through ms-1">${product.price.toFixed(2)}</span>
              <span className="text-danger ms-2 fw-bold">${product.discounted_price.toFixed(2)}</span>
              <Badge bg="danger" className="ms-2 bounce">
                {Math.round((1 - product.discounted_price / product.price) * 100)}% OFF
              </Badge>
            </div>
          )}
        </Card.Text>
      </Card.Body>
      <Card.Footer className="d-flex justify-content-between" style={{ background: 'transparent' }}>
        <Button 
          variant="outline-primary" 
          size="sm" 
          className="hover-scale"
          onClick={() => handleButtonClick('edit', product)}
          onMouseEnter={handleMouseEnter}
        >
          <FaEdit className={isHovered ? 'rotate-gear' : ''} style={{ transition: 'all 0.3s ease' }} /> Edit
        </Button>
        <Button 
          variant="outline-info" 
          size="sm" 
          className="hover-scale"
          onClick={() => handleButtonClick('barcode', product)}
          onMouseEnter={handleMouseEnter}
        >
          <FaBarcode /> Barcode
        </Button>
        <Button 
          variant="outline-danger" 
          size="sm" 
          className="hover-scale"
          onClick={() => handleButtonClick('delete', product)}
          onMouseEnter={handleMouseEnter}
        >
          <FaTrash /> Delete
        </Button>
      </Card.Footer>
      
      {/* Shine effect overlay */}
      {isHovered && (
        <div 
          className="position-absolute" 
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.1) 45%, transparent 55%)',
            zIndex: 1,
            borderRadius: '0.375rem',
            pointerEvents: 'none'
          }}
        />
      )}
    </Card>
  );
};

export default ProductCard;
