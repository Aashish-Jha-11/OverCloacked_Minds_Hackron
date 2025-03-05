import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Card, Form, Button, Alert, Spinner, Modal } from 'react-bootstrap';
import { FaBarcode, FaCamera, FaQrcode, FaTimes } from 'react-icons/fa';
import { productsApi } from '../services/api';
import { Html5Qrcode } from 'html5-qrcode';

const BarcodeScanner = forwardRef(({ onScanComplete }, ref) => {
  const [barcode, setBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const fileInputRef = useRef(null);
  const scannerRef = useRef(null);
  const scannerContainerRef = useRef(null);
  
  // Clean up scanner when component unmounts
  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerActive) {
        try {
          scannerRef.current.stop()
            .catch(err => console.error('Error stopping scanner during cleanup:', err));
        } catch (err) {
          // Ignore errors during cleanup
          console.error('Error during cleanup:', err);
        }
      }
    };
  }, [scannerActive]);
  
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
  
  // Expose a method to programmatically scan a barcode
  React.useImperativeHandle(ref, () => ({
    scanBarcode: (code) => {
      setBarcode(code);
      // Trigger scan with a slight delay to ensure state is updated
      setTimeout(() => handleScan(), 100);
    }
  }));
  
  const startRealCameraScan = () => {
    setShowScanner(true);
    setError('');
    
    // We'll initialize the scanner in the useEffect after the modal is shown
  };
  
  // Initialize the scanner when the modal is shown
  useEffect(() => {
    if (showScanner && scannerContainerRef.current) {
      const html5QrCode = new Html5Qrcode('scanner-container');
      scannerRef.current = html5QrCode;
      
      html5QrCode.start(
        { facingMode: 'environment' }, // Use the back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // On successful scan
          handleSuccessfulScan(decodedText);
        },
        (errorMessage) => {
          // Ignore errors during scanning
          console.log(errorMessage);
        }
      ).then(() => {
        setScannerActive(true);
      }).catch(err => {
        console.error('Error starting scanner:', err);
        setError('Could not start camera scanner. Please check camera permissions.');
        setShowScanner(false);
      });
    }
    
    return () => {
      if (scannerRef.current && scannerActive) {
        try {
          scannerRef.current.stop()
            .then(() => {
              setScannerActive(false);
            })
            .catch(err => {
              console.error('Error stopping scanner:', err);
              setScannerActive(false);
            });
        } catch (err) {
          console.error('Error during cleanup:', err);
          setScannerActive(false);
        }
      }
    };
  }, [showScanner]);
  
  const handleSuccessfulScan = async (scannedBarcode) => {
    // Stop the scanner
    if (scannerRef.current && scannerActive) {
      try {
        await scannerRef.current.stop();
        setScannerActive(false);
      } catch (err) {
        console.error('Error stopping scanner after successful scan:', err);
        setScannerActive(false);
      }
    }
    
    setShowScanner(false);
    setIsScanning(true);
    setBarcode(scannedBarcode);
    
    try {
      const response = await productsApi.scan(scannedBarcode);
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
  
  // Removed simulate camera scan function
  
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
    <>
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
              className="flex-grow-1 me-2"
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
              variant="success" 
              onClick={startRealCameraScan} 
              disabled={isScanning}
              title="Open Camera"
              className="flex-grow-1 me-2"
            >
              <FaCamera className="me-2" />
              Open Camera
            </Button>
            
            <Button 
              variant="secondary" 
              onClick={() => fileInputRef.current.click()} 
              disabled={isScanning}
              className="flex-grow-1"
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
    
    {/* Camera Scanner Modal */}
    <Modal 
      show={showScanner} 
      onHide={() => {
        if (scannerRef.current) {
          scannerRef.current.stop().catch(err => console.error(err));
        }
        setShowScanner(false);
      }}
      centered
      backdrop="static"
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <FaCamera className="me-2" />
          Scan Barcode or QR Code
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="scanner-container-wrapper" style={{ position: 'relative' }}>
          <div 
            id="scanner-container" 
            ref={scannerContainerRef}
            style={{ 
              width: '100%', 
              minHeight: '350px',
              backgroundColor: '#000',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '8px'
            }}
          ></div>
          <div 
            className="scanner-overlay" 
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '280px',
              height: '180px',
              border: '2px solid #00ff00',
              borderRadius: '4px',
              boxShadow: '0 0 0 4000px rgba(0, 0, 0, 0.5)',
              zIndex: 10
            }}
          ></div>
        </div>
        <p className="text-center mt-3">
          Position the barcode or QR code within the green rectangle.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={() => {
            if (scannerRef.current && scannerActive) {
              try {
                scannerRef.current.stop()
                  .then(() => {
                    setScannerActive(false);
                    setShowScanner(false);
                  })
                  .catch(err => {
                    console.error('Error stopping scanner:', err);
                    setScannerActive(false);
                    setShowScanner(false);
                  });
              } catch (err) {
                console.error('Error during manual stop:', err);
                setScannerActive(false);
                setShowScanner(false);
              }
            } else {
              setShowScanner(false);
            }
          }}
        >
          <FaTimes className="me-2" />
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
    </>
  );
});  // Close forwardRef

export default BarcodeScanner;
