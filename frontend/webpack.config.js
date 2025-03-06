const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    port: 3001,
    allowedHosts: 'all',
    proxy: [
      {
        context: ['/api'],
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    ],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  ignoreWarnings: [
    {
      module: /html5-qrcode/,
      message: /Failed to parse source map/,
    },
  ],
};
