const express = require('express');
const cors = require('cors');
const httpProxy = require('express-http-proxy');

const app = express();
const PORT = 5000;

app.use(cors());

// Multipart routes — raw body forward
app.use('/api/pdf',      httpProxy('http://localhost:5001'));
app.use('/api/image',    httpProxy('http://localhost:5002'));
app.use('/api/word',     httpProxy('http://localhost:5003'));
app.use('/api/excel',    httpProxy('http://localhost:5003'));
app.use('/api/ppt',      httpProxy('http://localhost:5003'));
app.use('/api/document', httpProxy('http://localhost:5003'));

// Admin route — JSON only, handle manually to avoid body stream conflict
app.use('/api/admin', express.json(), (req, res) => {
  const http = require('http');
  const body = req.body ? JSON.stringify(req.body) : '';
  const options = {
    hostname: 'localhost',
    port: 5004,
    path: req.originalUrl,
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    }
  };
  const proxy = http.request(options, (proxyRes) => {
    res.status(proxyRes.statusCode);
    Object.entries(proxyRes.headers).forEach(([k, v]) => {
      if (k !== 'transfer-encoding') res.setHeader(k, v);
    });
    proxyRes.pipe(res);
  });
  proxy.on('error', (err) => {
    console.error('Admin proxy error:', err.message);
    if (!res.headersSent) res.status(502).json({ error: 'Admin service unavailable' });
  });
  if (body) proxy.write(body);
  proxy.end();
});

app.get('/', (req, res) => {
  res.send('DocTools API Gateway is running');
});

app.listen(PORT, () => {
  console.log(`API Gateway running on http://localhost:${PORT}`);
});
