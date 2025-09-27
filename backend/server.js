// backend/server.js - Copy this entire code into your server.js file

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'task_scheduler',
  password: process.env.DB_PASSWORD || 'your_password',
  port: process.env.DB_PORT || 5432,
});

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error connecting to database:', err);
  } else {
    console.log('✅ Connected to PostgreSQL database');
    release();
  }
});

// Routes

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, description, start_time, end_time, category, priority, is_completed 
      FROM tasks 
      WHERE user_id = 1 
      ORDER BY start_time ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error getting tasks:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new task
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, start_time, end_time, category, priority } = req.body;
    const result = await pool.query(`
      INSERT INTO tasks (user_id, title, description, start_time, end_time, category, priority)
      VALUES (1, $1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [title, description, start_time, end_time, category, priority || 'medium']);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error creating task:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, start_time, end_time, category, priority, is_completed } = req.body;
    
    const result = await pool.query(`
      UPDATE tasks 
      SET title = $1, description = $2, start_time = $3, end_time = $4, 
          category = $5, priority = $6, is_completed = $7
      WHERE id = $8 AND user_id = 1
      RETURNING *
    `, [title, description, start_time, end_time, category, priority, is_completed, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error updating task:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 AND user_id = 1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting task:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running!', 
    timestamp: new Date(),
    database: 'Connected to PostgreSQL'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Tasks API: http://localhost:${PORT}/api/tasks`);
});

module.exports = app;