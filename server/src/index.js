const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 8080;

async function start() {
  // Initialize database before starting server
  await db.init();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // API routes
  const authRoutes = require('./routes/auth');
  const expenseRoutes = require('./routes/expenses');
  app.use('/api/auth', authRoutes);
  app.use('/api/expenses', expenseRoutes);

  // Health check
  app.get('/api/status', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Serve React frontend in production
  const clientBuildPath = path.join(__dirname, '..', '..', 'client', 'dist');
  app.use(express.static(clientBuildPath));

  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    } else {
      res.status(404).json({ error: 'API endpoint not found.' });
    }
  });

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API: http://localhost:${PORT}/api`);
    console.log(`UI: http://localhost:${PORT}/`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

module.exports = app;
