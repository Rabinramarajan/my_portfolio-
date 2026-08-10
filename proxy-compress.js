const express = require('express');
const compression = require('compression');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use(compression());

app.use('/', createProxyMiddleware({
  target: 'http://localhost:4000',
  changeOrigin: true,
}));

app.listen(4001, () => {
  console.log('Proxy running on http://localhost:4001 with gzip');
});
