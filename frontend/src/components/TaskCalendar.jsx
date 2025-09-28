import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { RefreshCw, Bot, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const localizer = momentLocalizer(moment);

const TaskCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('week');

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

  // External navigation handlers for Prev/Next/Today
  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  const navigateDate = (action) => {
    if (action === 'TODAY') {
      setCurrentDate(new Date());
      return;
    }

    let unit = 'week';
    if (currentView === 'month') unit = 'month';
    else if (currentView === 'day') unit = 'day';
    else if (currentView === 'agenda') unit = 'week';

    const delta = action === 'NEXT' ? 1 : -1;
    const newDate = moment(currentDate).add(delta, unit).toDate();
    setCurrentDate(newDate);
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
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <CalendarIcon className="h-6 w-6" />
              AI Task Calendar
            </CardTitle>
            <CardDescription className="mt-1">
              Manage your tasks with intelligent AI scheduling
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => navigateDate('PREV')}
                className="p-2"
                aria-label="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                onClick={() => navigateDate('TODAY')}
                className="px-3 py-1"
              >
                Today
              </Button>

              <Button
                variant="ghost"
                onClick={() => navigateDate('NEXT')}
                className="p-2"
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={loadEvents}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
            
            <Button
              onClick={handleAiSchedule}
              disabled={aiLoading}
              className="flex items-center gap-2"
            >
              <Bot className={`h-4 w-4 ${aiLoading ? 'animate-pulse' : ''}`} />
              {aiLoading ? 'AI Scheduling...' : 'AI Schedule Tasks'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Sample tasks info */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Sample Tasks for AI Scheduling:</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {sampleTasks.map((task, index) => (
                <span key={index} className="px-2 py-1 bg-blue-200 dark:bg-blue-700 rounded text-sm text-blue-800 dark:text-blue-200">
                  {task.title} ({task.durationMinutes}min)
                </span>
              ))}
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Click "AI Schedule Tasks" to let AI find open time slots for these tasks
            </p>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3">Legend:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
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
          </CardContent>
        </Card>

        {/* React Big Calendar */}
        <Card>
          <CardContent className="p-0">
            <div style={{ height: '500px' }} className="rounded-lg overflow-hidden">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                date={currentDate}
                view={currentView}
                onView={(view) => handleViewChange(view)}
                onNavigate={(date) => setCurrentDate(date)}
                messages={{ noEventsInRange: 'No Tasks' }}
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
          </CardContent>
        </Card>
      </CardContent>
    </div>
  );
};

export default TaskCalendar;