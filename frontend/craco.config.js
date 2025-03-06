module.exports = {
  devServer: {
    port: 3002,
    allowedHosts: 'all'
  },
  webpack: {
    configure: {
      ignoreWarnings: [
        {
          module: /html5-qrcode/,
          message: /Failed to parse source map/,
        },
      ],
    },
  },
};
