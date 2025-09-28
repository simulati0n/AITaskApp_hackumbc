import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const TaskCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Sample tasks for AI scheduling
  const [sampleTasks] = useState([
    { title: 'Write Project Report', durationMinutes: 120 },
    { title: 'Team Meeting Prep', durationMinutes: 30 },
    { title: 'Code Review', durationMinutes: 60 },
    { title: 'Exercise/Gym', durationMinutes: 90 },
    { title: 'Client Call Follow-up', durationMinutes: 45 }
  ]);

  // Load existing events from backend
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tasks');
      const tasks = await response.json();
      
      // Convert database tasks to calendar events format
      const calendarEvents = tasks
        .filter(task => task.start_time && task.end_time)
        .map(task => ({
          id: task.id,
          title: task.title,
          start: new Date(task.start_time),
          end: new Date(task.end_time),
          resource: {
            description: task.description,
            category: task.category,
            priority: task.priority,
            isCompleted: task.is_completed
          }
        }));
      
      setEvents(calendarEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
      alert('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  // Handle AI scheduling
  const handleAiSchedule = async () => {
    setAiLoading(true);
    try {
      const response = await fetch('/api/ai-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tasks: sampleTasks })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'AI scheduling failed');
      }

      alert(`✅ AI scheduled ${result.scheduledTasks.length} tasks successfully!
${result.skippedTasks > 0 ? `⚠️ ${result.skippedTasks} tasks couldn't be scheduled due to conflicts.` : ''}`);
      
      // Reload events to show new AI-scheduled tasks
      await loadEvents();
      
    } catch (error) {
      console.error('AI scheduling error:', error);
      alert('❌ AI scheduling failed: ' + error.message);
    } finally {
      setAiLoading(false);
    }
  };

  // Event style customization based on category
  const eventStyleGetter = (event) => {
    let backgroundColor = '#3174ad';
    
    if (event.resource?.category === 'ai-scheduled') {
      backgroundColor = '#10b981'; // Green for AI scheduled
    } else if (event.resource?.priority === 'high') {
      backgroundColor = '#ef4444'; // Red for high priority
    } else if (event.resource?.priority === 'low') {
      backgroundColor = '#6b7280'; // Gray for low priority
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: event.resource?.isCompleted ? 0.6 : 1,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          AI Task Calendar
        </h1>
        
        <div className="flex gap-3">
          <button
            onClick={loadEvents}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          
          <button
            onClick={handleAiSchedule}
            disabled={aiLoading}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
          >
            {aiLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                AI Scheduling...
              </>
            ) : (
              '🤖 AI Schedule Tasks'
            )}
          </button>
        </div>
      </div>

      {/* Sample tasks info */}
      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold mb-2">Sample Tasks for AI Scheduling:</h3>
        <div className="flex flex-wrap gap-2">
          {sampleTasks.map((task, index) => (
            <span key={index} className="px-2 py-1 bg-blue-200 dark:bg-blue-700 rounded text-sm">
              {task.title} ({task.durationMinutes}min)
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Click "AI Schedule Tasks" to let AI find open time slots for these tasks
        </p>
      </div>

      {/* Legend */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="font-semibold mb-2">Legend:</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>AI Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>High Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500 rounded"></div>
            <span>Low Priority</span>
          </div>
        </div>
      </div>

      {/* React Big Calendar */}
      <div style={{ height: '600px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          eventPropGetter={eventStyleGetter}
          views={['month', 'week', 'day', 'agenda']}
          defaultView="week"
          popup
          tooltipAccessor={(event) => 
            `${event.title}\n${event.resource?.description || ''}\nPriority: ${event.resource?.priority || 'medium'}`
          }
          onSelectEvent={(event) => {
            alert(`Event: ${event.title}\nDescription: ${event.resource?.description || 'No description'}\nCategory: ${event.resource?.category || 'general'}`);
          }}
        />
      </div>
    </div>
  );
};

export default TaskCalendar;