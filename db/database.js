const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const DB_PATH = path.join(__dirname, 'baby_tracker.db');

// Initialize database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('📊 Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database schema
function initializeDatabase() {
  db.serialize(() => {
    // Baby Profile table
    db.run(`
      CREATE TABLE IF NOT EXISTS baby_profile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        birth_date TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Reference Pattern table
    db.run(`
      CREATE TABLE IF NOT EXISTS reference_pattern (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        row_index INTEGER NOT NULL,
        time TEXT,
        feed TEXT,
        sleep_start TEXT,
        sleep_end TEXT,
        poop TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Records table
    db.run(`
      CREATE TABLE IF NOT EXISTS records (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        time TEXT,
        feed_left INTEGER,
        feed_right INTEGER,
        feed_breast_milk INTEGER,
        feed_formula INTEGER,
        sleep_start INTEGER,
        sleep_end INTEGER,
        poop TEXT,
        pee TEXT,
        bath INTEGER,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Forecasts table
    db.run(`
      CREATE TABLE IF NOT EXISTS forecasts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Forecast rows table
    db.run(`
      CREATE TABLE IF NOT EXISTS forecast_rows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        forecast_id INTEGER NOT NULL,
        row_index INTEGER NOT NULL,
        time TEXT,
        feed TEXT,
        sleep_start TEXT,
        sleep_end TEXT,
        poop TEXT,
        FOREIGN KEY (forecast_id) REFERENCES forecasts(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Database schema initialized');
  });
}

// Helper function to run queries with promises
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Baby Profile operations
const babyProfile = {
  get: async () => {
    return await getQuery('SELECT * FROM baby_profile ORDER BY id DESC LIMIT 1');
  },
  
  save: async (birthDate) => {
    // Delete existing profile and insert new one
    await runQuery('DELETE FROM baby_profile');
    return await runQuery(
      'INSERT INTO baby_profile (birth_date) VALUES (?)',
      [birthDate]
    );
  }
};

// Reference Pattern operations
const referencePattern = {
  getAll: async () => {
    return await allQuery('SELECT * FROM reference_pattern ORDER BY row_index');
  },
  
  saveAll: async (patterns) => {
    await runQuery('DELETE FROM reference_pattern');
    for (let i = 0; i < patterns.length; i++) {
      const p = patterns[i];
      await runQuery(
        `INSERT INTO reference_pattern (row_index, time, feed, sleep_start, sleep_end, poop)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [i, p.time || '', p.feed || '', p.sleepStart || '', p.sleepEnd || '', p.poop || '']
      );
    }
    return { success: true };
  }
};

// Records operations
const records = {
  getAll: async () => {
    return await allQuery('SELECT * FROM records ORDER BY date, time');
  },
  
  getByDate: async (date) => {
    return await allQuery('SELECT * FROM records WHERE date = ? ORDER BY time', [date]);
  },
  
  add: async (record) => {
    return await runQuery(
      `INSERT INTO records (id, date, time, feed_left, feed_right, feed_breast_milk, feed_formula,
       sleep_start, sleep_end, poop, pee, bath, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [record.id, record.date, record.time || '',
       record.feedLeft || 0, record.feedRight || 0, record.feedBreastMilk || 0, record.feedFormula || 0,
       record.sleepStart ? 1 : 0, record.sleepEnd ? 1 : 0,
       record.poop || '', record.pee || '', record.bath ? 1 : 0, record.notes || '']
    );
  },
  
  update: async (id, record) => {
    return await runQuery(
      `UPDATE records
       SET date = ?, time = ?, feed_left = ?, feed_right = ?, feed_breast_milk = ?, feed_formula = ?,
       sleep_start = ?, sleep_end = ?, poop = ?, pee = ?, bath = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [record.date, record.time || '',
       record.feedLeft || 0, record.feedRight || 0, record.feedBreastMilk || 0, record.feedFormula || 0,
       record.sleepStart ? 1 : 0, record.sleepEnd ? 1 : 0,
       record.poop || '', record.pee || '', record.bath ? 1 : 0, record.notes || '', id]
    );
  },
  
  delete: async (id) => {
    return await runQuery('DELETE FROM records WHERE id = ?', [id]);
  }
};

// Forecasts operations
const forecasts = {
  getAll: async () => {
    const forecastList = await allQuery('SELECT * FROM forecasts ORDER BY date DESC');
    const result = [];
    
    for (const forecast of forecastList) {
      const rows = await allQuery(
        'SELECT * FROM forecast_rows WHERE forecast_id = ? ORDER BY row_index',
        [forecast.id]
      );
      result.push({
        date: forecast.date,
        rows: rows.map(r => ({
          time: r.time,
          feed: r.feed,
          sleepStart: r.sleep_start,
          sleepEnd: r.sleep_end,
          poop: r.poop
        }))
      });
    }
    
    return result;
  },
  
  getByDate: async (date) => {
    const forecast = await getQuery('SELECT * FROM forecasts WHERE date = ?', [date]);
    if (!forecast) return null;
    
    const rows = await allQuery(
      'SELECT * FROM forecast_rows WHERE forecast_id = ? ORDER BY row_index',
      [forecast.id]
    );
    
    return {
      date: forecast.date,
      rows: rows.map(r => ({
        time: r.time,
        feed: r.feed,
        sleepStart: r.sleep_start,
        sleepEnd: r.sleep_end,
        poop: r.poop
      }))
    };
  },
  
  save: async (date, rows) => {
    // Check if forecast exists
    const existing = await getQuery('SELECT id FROM forecasts WHERE date = ?', [date]);
    
    let forecastId;
    if (existing) {
      forecastId = existing.id;
      await runQuery('DELETE FROM forecast_rows WHERE forecast_id = ?', [forecastId]);
      await runQuery('UPDATE forecasts SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [forecastId]);
    } else {
      const result = await runQuery('INSERT INTO forecasts (date) VALUES (?)', [date]);
      forecastId = result.lastID;
    }
    
    // Insert forecast rows
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      await runQuery(
        `INSERT INTO forecast_rows (forecast_id, row_index, time, feed, sleep_start, sleep_end, poop)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [forecastId, i, r.time || '', r.feed || '', r.sleepStart || '', r.sleepEnd || '', r.poop || '']
      );
    }
    
    return { success: true };
  }
};

module.exports = {
  db,
  babyProfile,
  referencePattern,
  records,
  forecasts
};

// Made with Bob
