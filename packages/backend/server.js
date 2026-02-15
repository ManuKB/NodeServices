const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from frontend build directory
app.use(express.static(path.join(__dirname, '../frontend/public')));

// REST API endpoints
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Express REST API!' });
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
  console.log(`API: http://localhost:${port}/api/hello`);
  console.log(`UI: http://localhost:${port}/`);
});
