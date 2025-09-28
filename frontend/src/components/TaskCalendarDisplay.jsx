import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent } from './ui/card';

const localizer = momentLocalizer(moment);

const TaskCalendarDisplay = ({ tasks, onEditTask }) => {
  const [events, setEvents] = useState([]);

  // Convert tasks to calendar events whenever tasks prop changes
  useEffect(() => {
    if (tasks) {
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
    }
  }, [tasks]);

  // Event style customization based on category and priority
  const eventStyleGetter = (event) => {
    let backgroundColor = '#3174ad';
    
    if (event.resource?.category === 'ai-scheduled') {
      backgroundColor = '#10b981'; // Green for AI scheduled
    } else if (event.resource?.category === 'work') {
      backgroundColor = '#8b5cf6'; // Purple for work
    } else if (event.resource?.category === 'meeting') {
      backgroundColor = '#f59e0b'; // Orange for meetings
    } else if (event.resource?.priority === 'high') {
      backgroundColor = '#ef4444'; // Red for high priority
    } else if (event.resource?.priority === 'low') {
      backgroundColor = '#6b7280'; // Gray for low priority
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: event.resource?.isCompleted ? 0.6 : 1,
        color: 'white',
        border: 'none',
        fontSize: '12px',
        padding: '2px 4px'
      }
    };
  };

  const handleSelectEvent = (event) => {
    if (onEditTask) {
      // Convert calendar event back to task format for editing
      const task = {
        id: event.id,
        title: event.title,
        description: event.resource?.description || '',
        start_time: event.start.toISOString(),
        end_time: event.end.toISOString(),
        category: event.resource?.category || 'user',
        priority: event.resource?.priority || 'medium'
      };
      onEditTask(task);
    } else {
      // Simple alert showing event details (fallback)
      alert(`📅 ${event.title}
📝 ${event.resource?.description || 'No description'}
🏷️ Category: ${event.resource?.category || 'general'}
⚡ Priority: ${event.resource?.priority || 'medium'}
⏰ ${moment(event.start).format('MMM D, YYYY HH:mm')} - ${moment(event.end).format('HH:mm')}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3">Calendar Legend:</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>AI Scheduled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span>Work</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>Meeting</span>
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
          <div style={{ height: '600px' }} className="rounded-lg overflow-hidden">
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
              onSelectEvent={handleSelectEvent}
              messages={{ 
                noEventsInRange: 'No tasks scheduled for this period',
                showMore: (total) => `+${total} more tasks`
              }}
              // Disable selection for creating events - this is display only
              selectable={false}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskCalendarDisplay;