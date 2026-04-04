const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'expense-tracker.db');

// Ensure data directory exists
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Wrapper that provides a better-sqlite3-compatible API on top of sql.js
const dbWrapper = {
  _db: null,
  _dbPath: DB_PATH,

  _save() {
    const data = this._db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(this._dbPath, buffer);
  },

  async init() {
    const SQL = await initSqlJs();

    if (fs.existsSync(this._dbPath)) {
      const buffer = fs.readFileSync(this._dbPath);
      this._db = new SQL.Database(buffer);
    } else {
      this._db = new SQL.Database();
    }

    // Enable foreign keys
    this._db.run('PRAGMA foreign_keys = ON');

    // Create tables
    this._db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    this._db.run(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        date TEXT NOT NULL,
        amount REAL NOT NULL,
        added_by INTEGER NOT NULL,
        updated_by INTEGER,
        added_date TEXT NOT NULL DEFAULT (datetime('now')),
        updated_date TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (added_by) REFERENCES users(id),
        FOREIGN KEY (updated_by) REFERENCES users(id)
      )
    `);

    this._save();
    return this;
  },

  prepare(sql) {
    const self = this;
    return {
      get(...params) {
        const stmt = self._db.prepare(sql);
        if (params.length > 0) {
          stmt.bind(params);
        }
        let result = undefined;
        if (stmt.step()) {
          result = stmt.getAsObject();
        }
        stmt.free();
        return result;
      },

      all(...params) {
        const results = [];
        const stmt = self._db.prepare(sql);
        if (params.length > 0) {
          stmt.bind(params);
        }
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      },

      run(...params) {
        self._db.run(sql, params);
        const lastIdResult = self._db.exec('SELECT last_insert_rowid() as id');
        const lastInsertRowid = lastIdResult.length > 0 ? lastIdResult[0].values[0][0] : 0;
        const changes = self._db.getRowsModified();
        self._save();
        return { lastInsertRowid, changes };
      }
    };
  },

  exec(sql) {
    this._db.run(sql);
    this._save();
  }
};

module.exports = dbWrapper;
