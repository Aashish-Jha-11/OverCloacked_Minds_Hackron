const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3002;

// Proxy API requests to the backend
app.use('/api', createProxyMiddleware({ 
  target: 'http://localhost:5001',
  changeOrigin: true
}));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// For any request that doesn't match the above, send the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend server is running on port ${PORT}`);
});
