const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All expense routes require authentication
router.use(authenticate);

// Get all expenses (with optional month/year filter)
router.get('/', (req, res) => {
  try {
    const { month, year } = req.query;
    let query = `
      SELECT e.*, 
        u1.name as added_by_name, 
        u2.name as updated_by_name 
      FROM expenses e
      LEFT JOIN users u1 ON e.added_by = u1.id
      LEFT JOIN users u2 ON e.updated_by = u2.id
    `;
    const params = [];

    if (month && year) {
      query += ` WHERE strftime('%m', e.date) = ? AND strftime('%Y', e.date) = ?`;
      params.push(month.padStart(2, '0'), year);
    } else if (year) {
      query += ` WHERE strftime('%Y', e.date) = ?`;
      params.push(year);
    }

    query += ' ORDER BY e.date DESC';

    const expenses = db.prepare(query).all(...params);
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch expenses.', details: err.message });
  }
});

// Get monthly summary for dashboard
router.get('/summary', (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = year || new Date().getFullYear().toString();

    const summary = db.prepare(`
      SELECT 
        strftime('%m', date) as month,
        strftime('%Y', date) as year,
        SUM(amount) as total,
        COUNT(*) as count
      FROM expenses
      WHERE strftime('%Y', date) = ?
      GROUP BY strftime('%Y-%m', date)
      ORDER BY month ASC
    `).all(targetYear);

    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch summary.', details: err.message });
  }
});

// Add a new expense
router.post('/', (req, res) => {
  try {
    const { name, date, amount } = req.body;

    if (!name || !date || amount === undefined) {
      return res.status(400).json({ error: 'Name, date, and amount are required.' });
    }

    const result = db.prepare(
      'INSERT INTO expenses (name, date, amount, added_by, updated_by) VALUES (?, ?, ?, ?, ?)'
    ).run(name, date, parseFloat(amount), req.user.id, req.user.id);

    const expense = db.prepare(`
      SELECT e.*, u1.name as added_by_name, u2.name as updated_by_name 
      FROM expenses e
      LEFT JOIN users u1 ON e.added_by = u1.id
      LEFT JOIN users u2 ON e.updated_by = u2.id
      WHERE e.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add expense.', details: err.message });
  }
});

// Update an expense
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, date, amount } = req.body;

    const existing = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Expense not found.' });
    }

    db.prepare(
      `UPDATE expenses SET name = ?, date = ?, amount = ?, updated_by = ?, updated_date = datetime('now') WHERE id = ?`
    ).run(
      name || existing.name,
      date || existing.date,
      amount !== undefined ? parseFloat(amount) : existing.amount,
      req.user.id,
      id
    );

    const expense = db.prepare(`
      SELECT e.*, u1.name as added_by_name, u2.name as updated_by_name 
      FROM expenses e
      LEFT JOIN users u1 ON e.added_by = u1.id
      LEFT JOIN users u2 ON e.updated_by = u2.id
      WHERE e.id = ?
    `).get(id);

    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update expense.', details: err.message });
  }
});

// Delete an expense
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const existing = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Expense not found.' });
    }

    db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
    res.json({ message: 'Expense deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete expense.', details: err.message });
  }
});

module.exports = router;
