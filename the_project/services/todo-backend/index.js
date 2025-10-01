const express = require('express');

const { Pool }  = require('pg');

/*
// hardencoded todos

const { v4: uuidv4 } = require('uuid');


const todos = [
  {id: uuidv4(), text: 'Learn JavaScript', done: false },
  {id: uuidv4(), text: 'Learn React', done: false },
  {id: uuidv4(), text: 'Learn Kubernetes', done: false },
  {id: uuidv4(), text: 'Build project', done: false },
];
*/


const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3001;

const DB_HOST = process.env.DB_HOST || 'postgres-svc';
const DB_PORT = process.env.DB_PORT || 5432;
const DB_NAME = process.env.DB_NAME || 'todo-db';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'password';

const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
});

async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        text VARCHAR(140) NOT NULL,
        done BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('[TODO-INIT] Database initialized');
  } catch (err) {
    console.error('[TODO-INIT] ERROR: Database initialization error:', err);
    process.exit(1);
  }
}


// Routes
// Get all todos

app.get('/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('[TODO-GET] ERROR: fetching todos:', err);
    res.status(500).send('Database error');
  }
});

// Create a new todo

app.post('/todos', async (req, res) => {

  if (!req.body || typeof req.body !== 'object') {
    console.error('[TODO-CREATE] ERROR: Invalid request body');
    return res.status(400).json({ error: 'Invalid request body' });

  }

  const { text = '', done = false} = req.body;

  if (!text || text.trim() === '') {
    console.error('[TODO-CREATE] ERROR: Validation failed - Text is required');
    console.error('[TODO-CREATE] Request body:', req.body);
    return res.status(400).json({ error: 'Text is required' });
  }

  if (text.length > 140){
    console.error('[TODO-CREATE] ERROR: Validation failed - Text must be 140 characters or less');
    console.error(`[TODO-CREATE] Received ${text.length} characters, "${text.substring(0, 50)}..."`);
    return res.status(400).json({ error: 'Text must be 140 characters or less'});
  }

  try {
    const result = await pool.query(
      'INSERT INTO todos (text) VALUES ($1) RETURNING *',
      [text.trim()]
    );
    console.log(`[TODO-CREATE] SUCCESS: Created todo with ID ${result.rows[0].id}, "${text.trim()}"`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[TODO-CREATE] ERROR: creating todo:', err);
    res.status(500).send('Database error');
  }
});


app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found'});
})


// Initialize database and start server

initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`[TODO-INIT] Todo backend with PostgreSQL started on port ${PORT}`);
  });
});
