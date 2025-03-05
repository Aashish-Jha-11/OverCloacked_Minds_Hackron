import React, { useState } from 'react';
import { Table, Badge, Button, Form, InputGroup } from 'react-bootstrap';
import { FaSort, FaSortUp, FaSortDown, FaSearch, FaEdit, FaTrash, FaBarcode } from 'react-icons/fa';

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

const InventoryTable = ({ products, onEdit, onDelete, onViewBarcode }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'expiry_date', direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  
  // Get unique categories for filter dropdown
  const categories = [...new Set(products.map(product => product.category))];
  
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };
  
  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      // Apply search filter
      const searchMatch = searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Apply status filter
      const statusMatch = filterStatus === '' || product.status === filterStatus;
      
      // Apply category filter
      const categoryMatch = filterCategory === '' || product.category === filterCategory;
      
      return searchMatch && statusMatch && categoryMatch;
    })
    .sort((a, b) => {
      // Sort by the selected key
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  
  return (
    <div>
      <div className="mb-3 d-flex flex-wrap gap-2">
        <InputGroup className="mb-2 me-2" style={{ maxWidth: '300px' }}>
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
          <Form.Control
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        
        <Form.Select 
          className="mb-2 me-2" 
          style={{ maxWidth: '200px' }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="discounted">Discounted</option>
          <option value="expired">Expired</option>
          <option value="disposed">Disposed</option>
        </Form.Select>
        
        <Form.Select 
          className="mb-2" 
          style={{ maxWidth: '200px' }}
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </Form.Select>
      </div>
      
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th onClick={() => requestSort('name')} style={{ cursor: 'pointer' }}>
                Name {getSortIcon('name')}
              </th>
              <th onClick={() => requestSort('category')} style={{ cursor: 'pointer' }}>
                Category {getSortIcon('category')}
              </th>
              <th onClick={() => requestSort('expiry_date')} style={{ cursor: 'pointer' }}>
                Expiry Date {getSortIcon('expiry_date')}
              </th>
              <th onClick={() => requestSort('quantity')} style={{ cursor: 'pointer' }}>
                Quantity {getSortIcon('quantity')}
              </th>
              <th onClick={() => requestSort('price')} style={{ cursor: 'pointer' }}>
                Price {getSortIcon('price')}
              </th>
              <th onClick={() => requestSort('location')} style={{ cursor: 'pointer' }}>
                Location {getSortIcon('location')}
              </th>
              <th onClick={() => requestSort('status')} style={{ cursor: 'pointer' }}>
                Status {getSortIcon('status')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>
                    {product.expiry_date}
                    {product.days_until_expiry !== null && (
                      <Badge 
                        bg={product.days_until_expiry <= 0 ? 'danger' : product.days_until_expiry <= 7 ? 'warning' : 'info'} 
                        className="ms-2"
                      >
                        {product.days_until_expiry <= 0 
                          ? 'Expired' 
                          : `${product.days_until_expiry} days left`}
                      </Badge>
                    )}
                  </td>
                  <td>{product.quantity} {product.unit}</td>
                  <td>
                    ₹{product.price.toFixed(2)}
                    {product.discounted_price && (
                      <>
                        <span className="text-decoration-line-through ms-2">₹{product.price.toFixed(2)}</span>
                        <span className="text-danger ms-2">₹{product.discounted_price.toFixed(2)}</span>
                      </>
                    )}
                  </td>
                  <td>{product.location}</td>
                  <td>{getStatusBadge(product.status)}</td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-1" onClick={() => onEdit(product)}>
                      <FaEdit />
                    </Button>
                    <Button variant="outline-info" size="sm" className="me-1" onClick={() => onViewBarcode(product)}>
                      <FaBarcode />
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => onDelete(product.id)}>
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center">No products found</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
      <div className="mt-2">
        <small className="text-muted">Showing {filteredProducts.length} of {products.length} products</small>
      </div>
    </div>
  );
};

export default InventoryTable;
