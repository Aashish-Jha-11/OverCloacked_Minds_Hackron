import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Card, Form, Button, Alert, Spinner, Modal } from 'react-bootstrap';
import { FaBarcode, FaCamera, FaQrcode, FaTimes, FaVolumeUp } from 'react-icons/fa';
import { productsApi } from '../services/api';
import { Html5Qrcode } from 'html5-qrcode';
import soundEffects from '../utils/soundEffects';
import '../styles/animations.css';

const BarcodeScanner = forwardRef(({ onScanComplete }, ref) => {
  const [barcode, setBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [scannerAnimation, setScannerAnimation] = useState(false);
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
    soundEffects.play('typing');
  };
  
  const handleScan = async () => {
    if (!barcode) {
      setError('Please enter a barcode');
      soundEffects.playError();
      return;
    }
    
    setIsScanning(true);
    setError('');
    soundEffects.play('scan');
    
    try {
      const response = await productsApi.scan(barcode);
      setScanResult(response.data);
      
      if (response.data.found) {
        soundEffects.playSuccess();
        if (onScanComplete) {
          onScanComplete(response.data.product);
        }
      } else {
        soundEffects.playError();
      }
    } catch (err) {
      console.error('Error scanning barcode:', err);
      setError('Error scanning barcode. Please try again.');
      soundEffects.playError();
    } finally {
      setIsScanning(false);
    }
  };
  
  // Expose a method to programmatically scan a barcode
  useImperativeHandle(ref, () => ({
    scanBarcode: (code) => {
      setBarcode(code);
      // Trigger scan with a slight delay to ensure state is updated
      setTimeout(() => handleScan(), 100);
    }
  }));
  
  const startRealCameraScan = () => {
    setShowScanner(true);
    setError('');
    soundEffects.play('click');
    // We'll initialize the scanner in the useEffect after the modal is shown
  };
  
  // Scanner animation effect
  useEffect(() => {
    if (showScanner) {
      const interval = setInterval(() => {
        setScannerAnimation(prev => !prev);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [showScanner]);
  
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
        soundEffects.play('notification');
      }).catch(err => {
        console.error('Error starting scanner:', err);
        setError('Could not start camera scanner. Please check camera permissions.');
        setShowScanner(false);
        soundEffects.playError();
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
    soundEffects.play('scan');
    
    try {
      const response = await productsApi.scan(scannedBarcode);
      setScanResult(response.data);
      
      if (response.data.found) {
        soundEffects.playSuccess();
        if (onScanComplete) {
          onScanComplete(response.data.product);
        }
      } else {
        soundEffects.playError();
      }
    } catch (err) {
      console.error('Error scanning barcode:', err);
      setError('Error scanning barcode. Please try again.');
      soundEffects.playError();
    } finally {
      setIsScanning(false);
    }
  };
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // In a real implementation, this would use a barcode scanning library to process the image
    // For demo purposes, we'll just simulate scanning with a delay
    setIsScanning(true);
    setError('');
    soundEffects.play('scan');
    
    setTimeout(async () => {
      try {
        // Generate a random barcode for demo purposes
        const randomBarcode = `SAMPLE${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        
        const response = await productsApi.scan(randomBarcode);
        setScanResult(response.data);
        setBarcode(randomBarcode);
        
        if (response.data.found) {
          soundEffects.playSuccess();
          if (onScanComplete) {
            onScanComplete(response.data.product);
          }
        } else {
          soundEffects.playError();
        }
      } catch (err) {
        console.error('Error scanning barcode:', err);
        setError('Error scanning barcode. Please try again.');
        soundEffects.playError();
      } finally {
        setIsScanning(false);
      }
    }, 1500); // Simulate scanning delay
  };
  
  const handleButtonMouseEnter = () => {
    soundEffects.playHover();
  };
  
  const handleCloseScanner = () => {
    if (scannerRef.current && scannerActive) {
      try {
        scannerRef.current.stop()
          .then(() => {
            setScannerActive(false);
            setShowScanner(false);
            soundEffects.play('click');
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
  };
  
  return (
    <>
      <Card className="shadow-sm scale-in">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <FaBarcode className="me-2 bounce" />
            <span>Barcode Scanner</span>
          </div>
          <div 
            className="scanner-icon rotate-gear"
            style={{ opacity: 0.7, fontSize: '1.2rem' }}
          >
            <FaVolumeUp />
          </div>
        </Card.Header>
        <Card.Body>
          <Form.Group className="mb-3 slide-up-animation">
            <Form.Label>Enter Barcode Manually</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter barcode"
              value={barcode}
              onChange={handleManualInput}
              disabled={isScanning}
              className="form-control-sci-fi"
            />
          </Form.Group>
          
          {error && (
            <Alert variant="danger" className="shake">
              {error}
            </Alert>
          )}
          
          <div className="d-flex justify-content-between mb-3 slide-up-animation" style={{ animationDelay: '0.1s' }}>
            <Button 
              variant="primary" 
              onClick={handleScan} 
              disabled={isScanning}
              className="flex-grow-1 me-2 hover-scale"
              onMouseEnter={handleButtonMouseEnter}
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
              className="flex-grow-1 me-2 hover-scale"
              onMouseEnter={handleButtonMouseEnter}
            >
              <FaCamera className="me-2" />
              Open Camera
            </Button>
            
            <Button 
              variant="secondary" 
              onClick={() => {
                fileInputRef.current.click();
                soundEffects.play('click');
              }} 
              disabled={isScanning}
              className="flex-grow-1 hover-scale"
              onMouseEnter={handleButtonMouseEnter}
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
          <Alert 
            variant={scanResult.found ? "success" : "warning"} 
            className={scanResult.found ? "scale-in" : "shake"}
          >
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
      onHide={handleCloseScanner}
      centered
      backdrop="static"
      size="lg"
      className="scanner-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <FaCamera className="me-2 pulse-border" />
          <span className="typing-effect">Scan Barcode or QR Code</span>
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
              border: `2px solid ${scannerAnimation ? '#0dcaf0' : '#00ff00'}`,
              transition: 'border-color 1s ease',
              borderRadius: '4px',
              boxShadow: `0 0 0 4000px rgba(0, 0, 0, 0.5), 0 0 20px ${scannerAnimation ? 'rgba(13, 202, 240, 0.7)' : 'rgba(0, 255, 0, 0.7)'}`,
              zIndex: 10
            }}
          >
            {/* Scanning line animation */}
            <div
              style={{
                position: 'absolute',
                height: '2px',
                width: '100%',
                backgroundColor: scannerAnimation ? '#0dcaf0' : '#00ff00',
                top: scannerAnimation ? '0%' : '100%',
                left: 0,
                transition: 'top 2s ease-in-out, background-color 1s ease',
                boxShadow: `0 0 10px ${scannerAnimation ? 'rgba(13, 202, 240, 0.7)' : 'rgba(0, 255, 0, 0.7)'}`
              }}
            ></div>
          </div>
        </div>
        <p className="text-center mt-3 fade-in" style={{ animationDelay: '0.5s' }}>
          Position the barcode or QR code within the highlighted rectangle.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={handleCloseScanner}
          className="hover-scale"
          onMouseEnter={handleButtonMouseEnter}
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
