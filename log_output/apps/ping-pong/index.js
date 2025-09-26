const express = require('express');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 3002;

// postgres enviroment
const DB_HOST = process.env.DB_HOST || 'postgres-svc';
const DB_PORT = process.env.DB_PORT || 5432;
const DB_NAME = process.env.DB_NAME || 'pingpong';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'password';

const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
});

// Initialize database table

async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS counter (
        id SERIAL PRIMARY KEY,
        value INTEGER NOT NULL DEFAULT 0
      )
    `);
    
    // Insert initial value if not exists
    const result = await pool.query('SELECT COUNT(*) FROM counter');
    if (parseInt(result.rows[0].count) === 0) {
      await pool.query('INSERT INTO counter (value) VALUES (0)');
    }
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

// Endpoint that responds with incrementing counter

app.get('/pingpong', async (req, res) => {
  try {
    
    const selectResult = await pool.query('SELECT value FROM counter WHERE id = 1');
    let counter = selectResult.rows[0]?.value || 0;
    
    counter++;
    await pool.query('UPDATE counter SET value = $1 WHERE id = 1', [counter]);
    
    res.send(`pong ${counter}`);
  } catch (err) {
    console.error('Error updating counter:', err);
    res.status(500).send('Database error');
  }
});

app.get('/pings', async (req, res) => {
  try {
    
    const selectResult = await pool.query('SELECT value FROM counter WHERE id = 1');
    let counter = selectResult.rows[0]?.value || 0;
    res.send({pings: counter});
  } catch (err) {
    console.error('Error reading counter:', err);
    res.status(500).send('Database error');    
  }
});

initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Ping-pong service with PostgreSQL started on port ${PORT}`);
  });
});
