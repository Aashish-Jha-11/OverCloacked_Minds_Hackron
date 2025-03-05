import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHome, FaExclamationTriangle } from 'react-icons/fa';

const NotFound = () => {
  return (
    <Container className="text-center py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <FaExclamationTriangle className="text-warning mb-4" size={80} />
          <h1 className="display-4 mb-4">404</h1>
          <h2 className="mb-4">Page Not Found</h2>
          <p className="lead mb-5">
            The page you are looking for might have been removed, had its name changed, 
            or is temporarily unavailable.
          </p>
          <Link to="/">
            <Button variant="primary" size="lg">
              <FaHome className="me-2" /> Go to Dashboard
            </Button>
          </Link>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;
