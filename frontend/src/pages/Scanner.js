import React, { useState } from 'react';
import { Card, Row, Col, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import BarcodeScanner from '../components/BarcodeScanner';
import ProductCard from '../components/ProductCard';
import { productsApi } from '../services/api';

const Scanner = () => {
  const [scannedProduct, setScannedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleScan = async (barcode) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await productsApi.scanBarcode(barcode);
      setScannedProduct(response.data);
      toast.success(`Successfully scanned product: ${response.data.name}`);
    } catch (err) {
      console.error('Error scanning barcode:', err);
      setError(err.response?.data?.error || 'Failed to scan barcode. Please try again.');
      toast.error('Barcode scan failed');
    } finally {
      setLoading(false);
    }
  };
  
  const handleProductUpdate = (updatedProduct) => {
    setScannedProduct(updatedProduct);
    toast.success(`Product "${updatedProduct.name}" updated successfully`);
  };
  
  return (
    <div>
      <h1 className="mb-4">Barcode Scanner</h1>
      
      <Row>
        <Col md={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header>
              <h5 className="mb-0">Scan Barcode</h5>
            </Card.Header>
            <Card.Body>
              <BarcodeScanner onScan={handleScan} loading={loading} />
              
              {error && (
                <Alert variant="danger" className="mt-3">
                  {error}
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header>
              <h5 className="mb-0">Scanned Product</h5>
            </Card.Header>
            <Card.Body>
              {scannedProduct ? (
                <ProductCard 
                  product={scannedProduct} 
                  onUpdate={handleProductUpdate}
                />
              ) : (
                <div className="text-center p-5">
                  <p className="text-muted">
                    No product scanned yet. Use the scanner on the left to scan a product barcode.
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Card className="shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Scanner Instructions</h5>
        </Card.Header>
        <Card.Body>
          <ol>
            <li>Enter a barcode manually in the input field or use the "Simulate Scan" button to test with sample barcodes.</li>
            <li>The system will look up the product associated with the barcode.</li>
            <li>View product details and take actions such as updating quantity or marking as expired.</li>
            <li>For real barcode scanning functionality, connect a USB barcode scanner or implement a camera-based scanner.</li>
          </ol>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Scanner;
