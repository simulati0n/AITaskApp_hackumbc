import React from 'react';
import TaskCalendar from '../components/TaskCalendar';

const CalendarPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <TaskCalendar />
    </div>
  );
};

export default CalendarPage;