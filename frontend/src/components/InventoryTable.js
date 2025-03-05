import React, { useState } from 'react';
import { Table, Badge, Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import { 
  FaSort, FaSortUp, FaSortDown, FaSearch, FaEdit, 
  FaTrash, FaBarcode, FaBoxOpen, FaClock 
} from 'react-icons/fa';

const getStatusBadge = (status) => {
  switch (status) {
    case 'active':
      return <Badge bg="success" className="status-badge">Active</Badge>;
    case 'discounted':
      return <Badge bg="warning" className="status-badge">Discounted</Badge>;
    case 'expired':
      return <Badge bg="danger" className="status-badge">Expired</Badge>;
    case 'disposed':
      return <Badge bg="secondary" className="status-badge">Disposed</Badge>;
    default:
      return <Badge bg="info" className="status-badge">{status}</Badge>;
  }
};

const InventoryTable = ({ products, loading, onEdit, onDelete, onViewBarcode, categories }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'expiry_date', direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  
  // Get unique categories for filter dropdown
  const uniqueCategories = [...new Set(products.map(product => product.category))];
  
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="sort-icon" />;
    return sortConfig.direction === 'asc' ? 
      <FaSortUp className="sort-icon active" /> : 
      <FaSortDown className="sort-icon active" />;
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
    <div className="inventory-table-container">
      <div className="mb-3 d-flex flex-wrap align-items-center">
        <div className="search-container me-3 mb-2">
          <InputGroup className="tech-search" style={{ maxWidth: '300px' }}>
            <InputGroup.Text className="search-icon-container">
              <FaSearch className="search-icon" />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </InputGroup>
        </div>
        
        <div className="filter-container d-flex flex-wrap">
          <Form.Select 
            className="tech-select me-2 mb-2" 
            style={{ maxWidth: '180px' }}
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
            className="tech-select mb-2" 
            style={{ maxWidth: '180px' }}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {uniqueCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Form.Select>
        </div>
        
        <div className="ms-auto mb-2">
          <Badge bg="primary" className="table-info-badge">
            <span>{filteredProducts.length}</span> of <span>{products.length}</span> products
          </Badge>
        </div>
      </div>
      
      <div className="table-responsive tech-table-container">
        <Table className="tech-table">
          <thead>
            <tr>
              <th className="id-column">#</th>
              <th onClick={() => requestSort('name')} className="sortable-header">
                Product Name {getSortIcon('name')}
              </th>
              <th onClick={() => requestSort('category')} className="sortable-header">
                Category {getSortIcon('category')}
              </th>
              <th onClick={() => requestSort('expiry_date')} className="sortable-header">
                Expiry Date {getSortIcon('expiry_date')}
              </th>
              <th onClick={() => requestSort('quantity')} className="sortable-header">
                Quantity {getSortIcon('quantity')}
              </th>
              <th onClick={() => requestSort('price')} className="sortable-header">
                Price {getSortIcon('price')}
              </th>
              <th onClick={() => requestSort('location')} className="sortable-header">
                Location {getSortIcon('location')}
              </th>
              <th onClick={() => requestSort('status')} className="sortable-header">
                Status {getSortIcon('status')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <tr key={product.id} className={`product-row status-${product.status}`}>
                  <td className="id-column">{product.id}</td>
                  <td className="product-name">{product.name}</td>
                  <td>
                    <span className="category-tag">{product.category}</span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <FaClock className="me-2 text-muted small-icon" />
                      <span>{product.expiry_date}</span>
                      
                      {product.days_until_expiry !== null && (
                        <Badge 
                          bg={product.days_until_expiry <= 0 ? 'danger' : product.days_until_expiry <= 7 ? 'warning' : 'info'} 
                          className="ms-2 expiry-badge"
                        >
                          {product.days_until_expiry <= 0 
                            ? 'Expired' 
                            : `${product.days_until_expiry} days`}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <FaBoxOpen className="me-2 text-muted small-icon" />
                      <span>
                        <strong>{product.quantity}</strong> {product.unit}
                      </span>
                    </div>
                  </td>
                  <td className="price-cell">
                    {product.discounted_price ? (
                      <>
                        <span className="discounted-price">₹{product.discounted_price.toFixed(2)}</span>
                        <span className="original-price">₹{product.price.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="regular-price">₹{product.price.toFixed(2)}</span>
                    )}
                  </td>
                  <td>{product.location}</td>
                  <td>{getStatusBadge(product.status)}</td>
                  <td>
                    <div className="action-buttons">
                      <Button variant="outline-primary" size="sm" className="action-btn" onClick={() => onEdit(product)} title="Edit Product">
                        <FaEdit />
                      </Button>
                      <Button variant="outline-info" size="sm" className="action-btn" onClick={() => onViewBarcode(product)} title="View Barcode">
                        <FaBarcode />
                      </Button>
                      <Button variant="outline-danger" size="sm" className="action-btn" onClick={() => onDelete(product.id)} title="Delete Product">
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-5">
                  {loading ? (
                    <div>
                      <Spinner animation="border" variant="primary" />
                      <p className="mt-2">Loading inventory data...</p>
                    </div>
                  ) : (
                    <div className="no-data-message">
                      <FaBoxOpen size={40} className="mb-3 text-muted" />
                      <p>No products found matching your filters</p>
                      <small className="text-muted">Try adjusting your search criteria</small>
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <style jsx="true">{`
        .inventory-table-container {
          position: relative;
        }
        
        .tech-table-container {
          border-radius: 10px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.5);
          box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.05);
          backdrop-filter: blur(5px);
        }
        
        .tech-table {
          margin-bottom: 0;
          border-collapse: separate;
          border-spacing: 0;
        }
        
        .tech-table thead th {
          background-color: rgba(240, 245, 255, 0.8);
          border-bottom: 2px solid #0d6efd;
          color: #495057;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.8rem;
          padding: 1rem;
          position: relative;
          white-space: nowrap;
        }
        
        .tech-table tbody tr {
          background-color: rgba(255, 255, 255, 0.7);
          transition: all 0.2s ease-in-out;
        }
        
        .tech-table tbody tr:hover {
          background-color: rgba(225, 235, 255, 0.9);
          transform: scale(1.005);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
          z-index: 2;
          position: relative;
        }
        
        .tech-search {
          border-radius: 30px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .search-icon-container {
          background: #0d6efd;
          border: none;
        }
        
        .search-icon {
          color: white;
        }
        
        .search-input {
          border: none;
          padding-left: 15px;
          background: rgba(255, 255, 255, 0.9);
        }
        
        .search-input:focus {
          box-shadow: none;
          background: white;
        }
        
        .tech-select {
          border-radius: 8px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
          transition: all 0.2s;
        }
        
        .tech-select:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.25);
        }
        
        .sortable-header {
          cursor: pointer;
          user-select: none;
          position: relative;
        }
        
        .sort-icon {
          font-size: 0.7rem;
          opacity: 0.5;
          margin-left: 5px;
          position: relative;
          top: -1px;
          transition: all 0.2s;
        }
        
        .sort-icon.active {
          opacity: 1;
          color: #0d6efd;
        }
        
        .product-row {
          border-left: 3px solid transparent;
        }
        
        .product-row.status-active {
          border-left-color: #198754;
        }
        
        .product-row.status-discounted {
          border-left-color: #ffc107;
        }
        
        .product-row.status-expired {
          border-left-color: #dc3545;
        }
        
        .product-row.status-disposed {
          border-left-color: #6c757d;
        }
        
        .id-column {
          width: 60px;
          text-align: center;
          font-weight: 600;
          color: #6c757d;
        }
        
        .product-name {
          font-weight: 500;
        }
        
        .category-tag {
          background: rgba(13, 110, 253, 0.1);
          color: #0d6efd;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.85rem;
          display: inline-block;
        }
        
        .action-buttons {
          display: flex;
          gap: 5px;
        }
        
        .action-btn {
          width: 32px;
          height: 32px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.2s;
        }
        
        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
        }
        
        .status-badge {
          padding: 0.4rem 0.6rem;
          border-radius: 30px;
          font-weight: 500;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          font-size: 0.7rem;
        }
        
        .expiry-badge {
          font-size: 0.7rem;
          border-radius: 30px;
          padding: 0.25rem 0.5rem;
        }
        
        .price-cell {
          min-width: 120px;
        }
        
        .discounted-price {
          font-weight: 600;
          color: #dc3545;
          display: block;
          line-height: 1.2;
        }
        
        .original-price {
          text-decoration: line-through;
          color: #6c757d;
          font-size: 0.85rem;
          display: block;
          line-height: 1.2;
        }
        
        .regular-price {
          font-weight: 600;
        }
        
        .small-icon {
          font-size: 0.8rem;
        }
        
        .table-info-badge {
          padding: 0.4rem 0.6rem;
          border-radius: 30px;
          font-weight: 400;
          font-size: 0.8rem;
        }
        
        .table-info-badge span {
          font-weight: 600;
        }
        
        .no-data-message {
          padding: 2rem;
          color: #6c757d;
        }
      `}</style>
    </div>
  );
};

export default InventoryTable;
