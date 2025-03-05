  const navigate = useNavigate();
  
  useEffect(() => {
    // Parse query parameters
    const searchParams = new URLSearchParams(location.search);
    const queryFilters = {
      status: searchParams.get('status') || '',
      category: searchParams.get('category') || '',
      expiry_days: searchParams.get('expiry_days') || '',
      location: searchParams.get('location') || ''
    };
    
    setFilters(queryFilters);
    setShowFilters(Object.values(queryFilters).some(value => value !== ''));
    
    // Fetch categories
    fetchCategories();
    
    // Fetch products with filters
    fetchProducts(queryFilters);
  }, [location.search]);
  
  const fetchCategories = async () => {
    try {
      const response = await categoriesApi.getAll();
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error('Failed to load categories');
    }
  };
  
  const fetchProducts = async (filterParams = filters) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await productsApi.getAll(filterParams);
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const applyFilters = () => {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        queryParams.set(key, value);
      }
    });
    
    // Update URL with filters
    navigate({
      pathname: location.pathname,
      search: queryParams.toString()
    });
  };
  
  const clearFilters = () => {
    setFilters({
      status: '',
      category: '',
      expiry_days: '',
      location: ''
    });
    
    navigate(location.pathname);
  };
  
  const handleProductUpdate = (updatedProduct) => {
    setProducts(products.map(p => 
      p.id === updatedProduct.id ? updatedProduct : p
    ));
    toast.success(`Product "${updatedProduct.name}" updated successfully`);
  };
  
  const handleProductDelete = (productId) => {
    setProducts(products.filter(p => p.id !== productId));
    toast.success('Product deleted successfully');
  };
  
  const handleEditProduct = (product) => {
    navigate(`/inventory/edit/${product.id}`);
  };
  
  const handleViewBarcode = (product) => {
    // Open a modal or navigate to barcode view
    navigate(`/scanner?barcode=${product.barcode}`);
  };
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Inventory Management</h1>
        <div>
          <Button 
            variant="outline-primary" 
            className="me-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter className="me-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <Button 
            variant="primary"
            onClick={() => navigate('/inventory/add')}
          >
            <FaPlus className="me-2" />
            Add Product
          </Button>
        </div>
      </div>
      
      {showFilters && (
        <Card className="mb-4 shadow-sm">
          <Card.Header>
            <h5 className="mb-0">Filter Products</h5>
          </Card.Header>
          <Card.Body>
            <Form>
              <Row>
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label>Status</Form.Label>
                    <Form.Select 
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="discounted">Discounted</option>
                      <option value="expired">Expired</option>
                      <option value="disposed">Disposed</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label>Category</Form.Label>
                    <Form.Select 
                      name="category"
                      value={filters.category}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label>Expiring Within (Days)</Form.Label>
                    <Form.Control 
                      type="number" 
                      name="expiry_days"
                      value={filters.expiry_days}
                      onChange={handleFilterChange}
                      placeholder="e.g., 7"
                    />
                  </Form.Group>
                </Col>
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label>Location</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="location"
                      value={filters.location}
                      onChange={handleFilterChange}
                      placeholder="e.g., Shelf A"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex justify-content-end">
                <Button 
                  variant="outline-secondary" 
                  className="me-2"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
                <Button 
                  variant="primary"
                  onClick={applyFilters}
                >
                  Apply Filters
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}
      
      {error ? (
        <Alert variant="danger">
          <Alert.Heading>Error Loading Products</Alert.Heading>
          <p>{error}</p>
          <Button 
            variant="outline-danger" 
            onClick={() => fetchProducts()}
          >
            <FaSync className="me-2" />
            Retry
          </Button>
        </Alert>
      ) : (
        <Card className="shadow-sm">
          <Card.Body>
            <InventoryTable 
              products={products} 
              loading={loading}
              onEdit={handleEditProduct}
              onDelete={handleProductDelete}
              onViewBarcode={handleViewBarcode}
              categories={categories}
            />
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default Inventory;
