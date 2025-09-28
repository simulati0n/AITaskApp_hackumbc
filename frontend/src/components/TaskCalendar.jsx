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
      const response = await fetch('https://taskoai-backend.onrender.com/api/tasks');
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

 
  const handleAiSchedule = async () => {
    setAiLoading(true);
    try {
      const response = await fetch('https://taskoai-backend.onrender.com/api/ai-schedule', {
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
      
      
      await loadEvents();
      
    } catch (error) {
      console.error('AI scheduling error:', error);
      alert('❌ AI scheduling failed: ' + error.message);
    } finally {
      setAiLoading(false);
    }
  };

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

  // Modal state for adding/editing events
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); 
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    category: 'user',
    priority: 'medium'
  });

  // CRUD handlers
  const createTask = async (task) => {
    try {
      const res = await fetch('https://taskoai-backend.onrender.com/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });

      if (!res.ok) throw new Error('Failed to create task');
      const created = await res.json();
      return created;
    } catch (err) {
      console.error('createTask error', err);
      alert('Failed to create task: ' + err.message);
      throw err;
    }
  };

  const updateTask = async (id, updates) => {
    try {
      const res = await fetch(`https://taskoai-backend.onrender.com/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!res.ok) throw new Error('Failed to update task');
      const updated = await res.json();
      return updated;
    } catch (err) {
      console.error('updateTask error', err);
      alert('Failed to update task: ' + err.message);
      throw err;
    }
  };

  const deleteTask = async (id) => {
    try {
      const res = await fetch(`https://taskoai-backend.onrender.com/api/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete task');
      return true;
    } catch (err) {
      console.error('deleteTask error', err);
      alert('Failed to delete task: ' + err.message);
      throw err;
    }
  };

  // Handle slot selection (create new event)
  const handleSelectSlot = (slotInfo) => {
    setModalMode('create');
    setSelectedEvent(null);
    setFormData({
      title: '',
      description: '',
      start_time: slotInfo.start.toISOString(),
      end_time: slotInfo.end.toISOString(),
      category: 'user',
      priority: 'medium'
    });
    setShowModal(true);
  };

  // Handle event selection (edit existing event)
  const handleSelectEvent = (event) => {
    setModalMode('edit');
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.resource?.description || '',
      start_time: event.start.toISOString(),
      end_time: event.end.toISOString(),
      category: event.resource?.category || 'user',
      priority: event.resource?.priority || 'medium'
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (modalMode === 'create') {
        await createTask(formData);
      } else if (modalMode === 'edit') {
        await updateTask(selectedEvent.id, formData);
      }
      
      setShowModal(false);
      await loadEvents();
      alert(modalMode === 'create' ? 'Task created!' : 'Task updated!');
    } catch (err) {
      // Error already handled in createTask/updateTask
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this task?');
    if (!confirmed) return;

    try {
      await deleteTask(selectedEvent.id);
      setShowModal(false);
      await loadEvents();
      alert('Task deleted!');
    } catch (err) {
      // Error already handled in deleteTask
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
    setFormData({
      title: '',
      description: '',
      start_time: '',
      end_time: '',
      category: 'user',
      priority: 'medium'
    });
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
                selectable
                onSelectSlot={handleSelectSlot}
                onDoubleClickSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
              />
            </div>
          </CardContent>
        </Card>
      </CardContent>

      {/* Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {modalMode === 'create' ? 'Add New Task' : 'Edit Task'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time *</label>
                  <input
                    type="datetime-local"
                    value={moment(formData.start_time).format('YYYY-MM-DDTHH:mm')}
                    onChange={(e) => setFormData({ ...formData, start_time: new Date(e.target.value).toISOString() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">End Time *</label>
                  <input
                    type="datetime-local"
                    value={moment(formData.end_time).format('YYYY-MM-DDTHH:mm')}
                    onChange={(e) => setFormData({ ...formData, end_time: new Date(e.target.value).toISOString() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">Personal</option>
                    <option value="work">Work</option>
                    <option value="meeting">Meeting</option>
                    <option value="ai-scheduled">AI Scheduled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <div>
                  {modalMode === 'edit' && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Delete
                    </button>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {modalMode === 'create' ? 'Create Task' : 'Update Task'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCalendar;