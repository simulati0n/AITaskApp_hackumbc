const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { convertTextToTasks, suggestScheduleWithGemini, filterNonOverlapping, enhanceGoalToSMART } = require('./ai-scheduler');
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
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('❌ Error getting tasks:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new task
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, start_time, end_time, category, priority } = req.body;
    
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        title,
        description,
        start_time,
        end_time,
        category: category || 'user',
        priority: priority || 'medium'
      }])
      .select();
    
    if (error) throw error;
    res.status(201).json(data[0]);
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
    
    const { data, error } = await supabase
      .from('tasks')
      .update({
        title,
        description,
        start_time,
        end_time,
        category,
        priority,
        is_completed,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    if (data.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(data[0]);
  } catch (err) {
    console.error('❌ Error updating task:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting task:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// AI Schedule endpoint
app.post('/api/ai-schedule', async (req, res) => {
  try {
    const { tasks } = req.body;
    
    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ error: 'Tasks array is required' });
    }

    // Get existing events from Supabase
    const { data: existingEvents, error: fetchError } = await supabase
      .from('tasks')
      .select('id, title, start_time, end_time')
      .not('start_time', 'is', null)
      .not('end_time', 'is', null)
      .order('start_time', { ascending: true });

    if (fetchError) throw fetchError;
    
    const busySlots = existingEvents.map(event => ({
      start: event.start_time,
      end: event.end_time
    }));

    // Get AI suggestions
    const aiEvents = await suggestScheduleWithGemini({ tasks, busySlots });
    
    // Filter out overlaps
    const safeEvents = filterNonOverlapping(aiEvents, existingEvents);
    
    // Insert AI-scheduled events
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

// Enhanced goal endpoint - reads from input box and creates SMART goal
app.post('/api/enhance-goal', async (req, res) => {
  try {
    const { goal } = req.body;
    
    if (!goal || typeof goal !== 'string') {
      return res.status(400).json({ error: 'Goal text is required' });
    }

    console.log('📝 Received goal to enhance:', goal);
    
    // Use Gemini AI to enhance the goal
    const smartGoal = await enhanceGoalToSMART(goal);
    
    res.json({ 
      originalGoal: goal,
      smartGoal: smartGoal,
      enhanced: true 
    });
    
  } catch (err) {
    console.error('❌ Error enhancing goal:', err);
    res.status(500).json({ error: 'Goal enhancement failed: ' + err.message });
  }
});

// NEW: Convert text input to tasks and create events
app.post('/api/create-tasks-from-text', async (req, res) => {
  try {
    const { textInput } = req.body;
    
    if (!textInput || typeof textInput !== 'string') {
      return res.status(400).json({ error: 'Text input is required' });
    }

    console.log('📝 Converting text to tasks:', textInput);
    
    // Use Gemini AI to convert text to structured tasks
    const aiTasks = await convertTextToTasks(textInput);
    
    // Save each task to Supabase database
    const createdTasks = [];
    for (const task of aiTasks) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .insert([{
            title: task.title,
            description: task.description,
            start_time: task.start_time,
            end_time: task.end_time,
            category: task.category,
            priority: task.priority,
            is_completed: false
          }])
          .select();

        if (error) {
          console.error('Error inserting task:', error);
          continue;
        }
        
        createdTasks.push(data[0]);
      } catch (insertError) {
        console.error('Failed to insert task:', task.title, insertError);
      }
    }

    console.log(`✅ Successfully created ${createdTasks.length} tasks from text input`);

    res.json({
      message: `Successfully created ${createdTasks.length} tasks from your input`,
      originalText: textInput,
      createdTasks: createdTasks,
      totalParsed: aiTasks.length,
      totalCreated: createdTasks.length
    });
    
  } catch (err) {
    console.error('❌ Error creating tasks from text:', err);
    res.status(500).json({ error: 'Failed to create tasks: ' + err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running!', 
    timestamp: new Date(),
    database: 'Connected to Supabase'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;