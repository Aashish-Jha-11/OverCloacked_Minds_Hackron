import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products API
export const productsApi = {
  getAll: (params = {}) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  scan: (barcode) => api.post('/products/scan', { barcode }),
  generateBarcode: (productData, codeType = 'barcode') => 
    api.post('/products/barcode/generate', { product_data: productData, code_type: codeType }),
  getSampleBarcodes: (count = 5) => api.get('/products/barcode/samples', { params: { count } }),
};

// Categories API
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
};

// Waste Records API
export const wasteRecordsApi = {
  getAll: (params = {}) => api.get('/waste-records', { params }),
  create: (data) => api.post('/waste-records', data),
  getStatistics: (params = {}) => api.get('/waste-statistics', { params }),
  getWasteByCategory: (params = {}) => api.get('/waste-statistics/by-category', { params }),
  getWasteOverTime: (params = {}) => api.get('/waste-statistics/over-time', { params }),
};

// Customers API
export const customersApi = {
  getAll: () => api.get('/customers'),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
};

// Purchase History API
export const purchaseHistoryApi = {
  getAll: (params = {}) => api.get('/purchase-history', { params }),
  create: (data) => api.post('/purchase-history', data),
};

// Inventory Management API
export const inventoryApi = {
  checkExpiry: () => api.post('/inventory/check-expiry'),
  processExpired: () => api.post('/inventory/process-expired'),
  getFefoInventory: () => api.get('/inventory/fefo'),
};

// Notifications API
export const notificationsApi = {
  getAll: (params = {}) => api.get('/notifications', { params }),
  process: () => api.post('/notifications/process'),
};

export default {
  products: productsApi,
  categories: categoriesApi,
  wasteRecords: wasteRecordsApi,
  customers: customersApi,
  purchaseHistory: purchaseHistoryApi,
  inventory: inventoryApi,
  notifications: notificationsApi,
};
