const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { suggestScheduleWithGemini, filterNonOverlapping } = require('./ai-scheduler');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.use(cors());
app.use(express.json());

// Test Supabase connection
(async () => {
  try {
    const { data, error } = await supabase.from('tasks').select('count').single();
    if (error) throw error;
    console.log('✅ Connected to Supabase database');
  } catch (err) {
    console.error('❌ Error connecting to Supabase:', err);
  }
})();

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

// AI Schedule endpoint - fills only open time slots
app.post('/api/ai-schedule', async (req, res) => {
  try {
    const { tasks } = req.body;
    
    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ error: 'Tasks array is required' });
    }

    // Validate tasks format
    for (const task of tasks) {
      if (!task.title || !task.durationMinutes || typeof task.durationMinutes !== 'number') {
        return res.status(400).json({ error: 'Each task must have title and durationMinutes' });
      }
    }

    // 1. Get existing events from Supabase to identify busy slots
    const { data: existingEvents, error: fetchError } = await supabase
      .from('tasks')
      .select('id, title, start_time, end_time')
      .not('start_time', 'is', null)
      .not('end_time', 'is', null)
      .order('start_time', { ascending: true });

    if (fetchError) {
      console.error('Error fetching existing events:', fetchError);
      throw fetchError;
    }
    
    // Convert to busy slots format for AI
    const busySlots = existingEvents.map(event => ({
      start: event.start_time,
      end: event.end_time
    }));

    // 2. Ask Gemini AI to suggest schedule for open slots
    const aiEvents = await suggestScheduleWithGemini({ tasks, busySlots });
    
    // 3. Server-side safety check to prevent overlaps
    const safeEvents = filterNonOverlapping(aiEvents, existingEvents);
    
    // 4. Insert the AI-scheduled events into Supabase
    const insertedEvents = [];
    for (const event of safeEvents) {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title: event.title,
          description: `AI scheduled: ${event.title}`,
          start_time: event.start,
          end_time: event.end,
          category: 'ai-scheduled',
          priority: 'medium'
        }])
        .select();

      if (error) {
        console.error('Error inserting AI event:', error);
        continue;
      }
      
      insertedEvents.push(data[0]);
    }

    res.json({
      message: `Successfully scheduled ${insertedEvents.length} out of ${tasks.length} tasks`,
      scheduledTasks: insertedEvents,
      skippedTasks: tasks.length - insertedEvents.length
    });
    
  } catch (err) {
    console.error('❌ Error with AI scheduling:', err);
    res.status(500).json({ error: 'AI scheduling failed: ' + err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running!', 
    timestamp: new Date(),
    database: 'Connected to PostgreSQL'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;