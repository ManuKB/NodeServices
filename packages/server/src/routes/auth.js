const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { authenticate, generateToken } = require('../middleware/auth');

const router = express.Router();

// Register a new user
router.post('/register', (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = db.prepare(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
    ).run(name, email, hashedPassword, role || 'user');

    const user = db.prepare('SELECT id, name, email, role, active FROM users WHERE id = ?').get(result.lastInsertRowid);
    const token = generateToken(user);

    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed.', details: err.message });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.active) {
      return res.status(403).json({ error: 'Account is deactivated.' });
    }

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.', details: err.message });
  }
});

// Get current user profile
router.get('/me', authenticate, (req, res) => {
  const user = db.prepare('SELECT id, name, email, role, active FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  res.json(user);
});

// Update a user
router.put('/users/:id', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, active, password } = req.body;

    // Only allow users to update themselves, or admins to update anyone
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Not authorized to update this user.' });
    }

    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const updates = {
      name: name || existing.name,
      email: email || existing.email,
      role: req.user.role === 'admin' && role !== undefined ? role : existing.role,
      active: req.user.role === 'admin' && active !== undefined ? (active ? 1 : 0) : existing.active
    };

    if (password) {
      updates.password = bcrypt.hashSync(password, 10);
    } else {
      updates.password = existing.password;
    }

    db.prepare(
      `UPDATE users SET name = ?, email = ?, password = ?, role = ?, active = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(updates.name, updates.email, updates.password, updates.role, updates.active, id);

    const user = db.prepare('SELECT id, name, email, role, active FROM users WHERE id = ?').get(id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Update failed.', details: err.message });
  }
});

// List all users (admin only)
router.get('/users', authenticate, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  const users = db.prepare('SELECT id, name, email, role, active FROM users').all();
  res.json(users);
});

module.exports = router;
