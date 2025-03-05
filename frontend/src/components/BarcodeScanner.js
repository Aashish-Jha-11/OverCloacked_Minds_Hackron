import React, { useState, useRef } from 'react';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaBarcode, FaCamera, FaQrcode } from 'react-icons/fa';
import { productsApi } from '../services/api';

const BarcodeScanner = ({ onScanComplete }) => {
  const [barcode, setBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const fileInputRef = useRef(null);
  
  // In a real implementation, this would use a barcode scanning library
  // For demo purposes, we'll just use manual input or simulate scanning
  
  const handleManualInput = (e) => {
    setBarcode(e.target.value);
    setError('');
  };
  
  const handleScan = async () => {
    if (!barcode) {
      setError('Please enter a barcode');
      return;
    }
    
    setIsScanning(true);
    setError('');
    
    try {
      const response = await productsApi.scan(barcode);
      setScanResult(response.data);
      
      if (response.data.found && onScanComplete) {
        onScanComplete(response.data.product);
      }
    } catch (err) {
      console.error('Error scanning barcode:', err);
      setError('Error scanning barcode. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };
  
  const simulateCameraScan = () => {
    // Simulate camera scanning with a random sample barcode
    setIsScanning(true);
    setError('');
    
    // Generate a random barcode for demo purposes
    const randomBarcode = `SAMPLE${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    setTimeout(async () => {
      try {
        const response = await productsApi.scan(randomBarcode);
        setScanResult(response.data);
        setBarcode(randomBarcode);
        
        if (response.data.found && onScanComplete) {
          onScanComplete(response.data.product);
        }
      } catch (err) {
        console.error('Error scanning barcode:', err);
        setError('Error scanning barcode. Please try again.');
      } finally {
        setIsScanning(false);
      }
    }, 1500); // Simulate scanning delay
  };
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // In a real implementation, this would use a barcode scanning library to process the image
    // For demo purposes, we'll just simulate scanning with a delay
    setIsScanning(true);
    setError('');
    
    setTimeout(async () => {
      try {
        // Generate a random barcode for demo purposes
        const randomBarcode = `SAMPLE${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        
        const response = await productsApi.scan(randomBarcode);
        setScanResult(response.data);
        setBarcode(randomBarcode);
        
        if (response.data.found && onScanComplete) {
          onScanComplete(response.data.product);
        }
      } catch (err) {
        console.error('Error scanning barcode:', err);
        setError('Error scanning barcode. Please try again.');
      } finally {
        setIsScanning(false);
      }
    }, 1500); // Simulate scanning delay
  };
  
  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-primary text-white">
        <FaBarcode className="me-2" />
        Barcode Scanner
      </Card.Header>
      <Card.Body>
        <Form.Group className="mb-3">
          <Form.Label>Enter Barcode Manually</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter barcode"
            value={barcode}
            onChange={handleManualInput}
            disabled={isScanning}
          />
        </Form.Group>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        <div className="d-flex justify-content-between mb-3">
          <Button 
            variant="primary" 
            onClick={handleScan} 
            disabled={isScanning}
          >
            {isScanning ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Scanning...
              </>
            ) : (
              <>
                <FaBarcode className="me-2" />
                Scan Barcode
              </>
            )}
          </Button>
          
          <Button 
            variant="info" 
            onClick={simulateCameraScan} 
            disabled={isScanning}
          >
            <FaCamera className="me-2" />
            Simulate Camera Scan
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={() => fileInputRef.current.click()} 
            disabled={isScanning}
          >
            <FaQrcode className="me-2" />
            Upload Image
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept="image/*" 
            onChange={handleFileUpload} 
            disabled={isScanning}
          />
        </div>
        
        {scanResult && (
          <Alert variant={scanResult.found ? "success" : "warning"}>
            {scanResult.found ? (
              <>
                <strong>Product Found:</strong> {scanResult.product.name}<br />
                <strong>Category:</strong> {scanResult.product.category}<br />
                <strong>Expiry Date:</strong> {scanResult.product.expiry_date}<br />
                <strong>Status:</strong> {scanResult.product.status}
              </>
            ) : (
              <>
                <strong>No product found for barcode:</strong> {scanResult.barcode}<br />
                <span>This product is not in the inventory.</span>
              </>
            )}
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default BarcodeScanner;
