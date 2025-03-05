import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { FaEdit, FaTrash, FaBarcode } from 'react-icons/fa';

const getStatusBadge = (status) => {
  switch (status) {
    case 'active':
      return <Badge bg="success">Active</Badge>;
    case 'discounted':
      return <Badge bg="warning">Discounted</Badge>;
    case 'expired':
      return <Badge bg="danger">Expired</Badge>;
    case 'disposed':
      return <Badge bg="secondary">Disposed</Badge>;
    default:
      return <Badge bg="info">{status}</Badge>;
  }
};

const ProductCard = ({ product, onEdit, onDelete, onViewBarcode }) => {
  const daysUntilExpiry = product.days_until_expiry;
  
  return (
    <Card className="h-100 shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center">
        {getStatusBadge(product.status)}
        <small className="text-muted">ID: {product.id}</small>
      </Card.Header>
      <Card.Body>
        <Card.Title>{product.name}</Card.Title>
        <Card.Text>
          <strong>Category:</strong> {product.category}<br />
          <strong>Barcode:</strong> {product.barcode}<br />
          <strong>Quantity:</strong> {product.quantity} {product.unit}<br />
          <strong>Location:</strong> {product.location}<br />
          <strong>Expiry:</strong> {product.expiry_date}
          {daysUntilExpiry !== null && (
            <Badge 
              bg={daysUntilExpiry <= 0 ? 'danger' : daysUntilExpiry <= 7 ? 'warning' : 'info'} 
              className="ms-2"
            >
              {daysUntilExpiry <= 0 
                ? 'Expired' 
                : `${daysUntilExpiry} days left`}
            </Badge>
          )}
          <br />
          <strong>Price:</strong> ${product.price.toFixed(2)}
          {product.discounted_price && (
            <>
              <span className="text-decoration-line-through ms-2">${product.price.toFixed(2)}</span>
              <span className="text-danger ms-2">${product.discounted_price.toFixed(2)}</span>
              <Badge bg="danger" className="ms-2">
                {Math.round((1 - product.discounted_price / product.price) * 100)}% OFF
              </Badge>
            </>
          )}
        </Card.Text>
      </Card.Body>
      <Card.Footer className="d-flex justify-content-between">
        <Button variant="outline-primary" size="sm" onClick={() => onEdit(product)}>
          <FaEdit /> Edit
        </Button>
        <Button variant="outline-info" size="sm" onClick={() => onViewBarcode(product)}>
          <FaBarcode /> Barcode
        </Button>
        <Button variant="outline-danger" size="sm" onClick={() => onDelete(product.id)}>
          <FaTrash /> Delete
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default ProductCard;
