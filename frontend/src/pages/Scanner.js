import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Alert, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import BarcodeScanner from '../components/BarcodeScanner';
import ProductCard from '../components/ProductCard';
import { productsApi } from '../services/api';
import { FaCamera, FaBarcode } from 'react-icons/fa';

const Scanner = () => {
  const [scannedProduct, setScannedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const barcodeScannerRef = useRef(null);
  
  useEffect(() => {
    // Check if there's a barcode in the URL parameters
    const searchParams = new URLSearchParams(location.search);
    const barcodeParam = searchParams.get('barcode');
    
    if (barcodeParam) {
      handleBarcodeFromUrl(barcodeParam);
    }
  }, [location]);
  
  const handleScan = (product) => {
    if (product) {
      setScannedProduct(product);
      toast.success(`Successfully scanned product: ${product.name}`);
    }
  };
  
  const handleBarcodeFromUrl = async (barcode) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the barcode scanner component to handle the scan
      if (barcodeScannerRef.current) {
        barcodeScannerRef.current.scanBarcode(barcode);
      } else {
        // Fallback if ref is not available
        const response = await productsApi.scan(barcode);
        if (response.data.found) {
          setScannedProduct(response.data.product);
          toast.success(`Product found: ${response.data.product.name}`);
        } else {
          setError(`No product found for barcode: ${barcode}`);
          toast.warning(`No product found for barcode: ${barcode}`);
        }
      }
    } catch (err) {
      console.error('Error scanning barcode:', err);
      setError('Failed to scan barcode. Please try again.');
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>
          <FaBarcode className="me-2" />
          Barcode Scanner
        </h1>
        <Button 
          variant="success" 
          size="lg" 
          className="d-flex align-items-center"
          onClick={() => document.getElementById('open-camera-btn')?.click()}
        >
          <FaCamera className="me-2" />
          Quick Scan
        </Button>
      </div>
      
      <Row>
        <Col md={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Scan Barcode</h5>
            </Card.Header>
            <Card.Body>
              <BarcodeScanner ref={barcodeScannerRef} onScanComplete={handleScan} />
              
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
            <Card.Header className="bg-success text-white">
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
                  <Button 
                    variant="outline-primary"
                    id="open-camera-btn"
                    className="mt-3"
                    onClick={() => document.querySelector('button[title="Open Camera"]')?.click()}
                  >
                    <FaCamera className="me-2" />
                    Open Camera to Scan
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Card className="shadow-sm">
        <Card.Header className="bg-info text-white">
          <h5 className="mb-0">Scanner Instructions</h5>
        </Card.Header>
        <Card.Body>
          <ol>
            <li><strong>Camera Scan:</strong> Click the "Open Camera" button to use your device's camera to scan a barcode or QR code.</li>
            <li><strong>Manual Entry:</strong> Enter a barcode manually in the input field if you know the code.</li>
            <li><strong>Simulate Scan:</strong> Use the "Simulate Scan" button to test with sample barcodes.</li>
            <li><strong>Upload Image:</strong> Upload an image containing a barcode or QR code to scan.</li>
            <li>The system will look up the product associated with the barcode and display its details.</li>
          </ol>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Scanner;
