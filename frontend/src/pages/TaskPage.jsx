import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import TaskCalendar from '../components/TaskCalendar';
import { Menu, X, Target, Plus } from 'lucide-react';

export default function TaskPage() {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [goalInput, setGoalInput] = useState('');
    const [goals, setGoals] = useState([]);

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    const handleAddGoal = () => {
        if (goalInput.trim()) {
            setGoals([...goals, goalInput.trim()]);
            setGoalInput('');
        }
    };

    const handleDelete = (indexToDelete) => {
        setGoals(goals.filter((_, index) => index !== indexToDelete));
    };

    const handleInputChange = (e) => {
        setGoalInput(e.target.value);
    };

    const handleSend = () => {
        handleAddGoal();
    };

    return (
        <div className="relative min-h-screen bg-background">
            {/* Sidebar */}
            <div className={`fixed top-0 left-0 h-full bg-card border-r shadow-lg transform transition-transform duration-300 ease-in-out z-30 ${isSidebarOpen ? 'w-80 translate-x-0' : 'w-16 -translate-x-full'}`}>
                <div className={`absolute top-4 ${isSidebarOpen ? 'right-4' : 'left-full ml-4'}`}>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleSidebar}
                        className="h-8 w-8"
                    >
                        {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    </Button>
                </div>
                
                {isSidebarOpen && (
                    <div className="mt-16">
                        <h2 className="text-xl font-bold text-black-900 dark:text-white mb-4">Goals</h2>
                        <ul>
                            {goals.map((goal, index) => (
                                <li key={index} className="flex justify-between items-center text-gray-800 dark:text-gray-200 mb-2">
                                    <span>{goal}</span>
                                    <button onClick={() => handleDelete(index)} className="p-1 text-red-500 hover:text-red-700">
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-80' : 'ml-16'}`}>
                <div className="container mx-auto py-6 px-4">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="text-4xl font-bold text-foreground mb-2">
                            Task Management
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Manage your tasks and stay organized with AI-powered insights
                        </p>
                    </div>

                    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                        <TaskCalendar />
                    </div>
                </div>
            </div>
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-1/2 flex items-center">
                <input
                    type="text"
                    placeholder="Enter Goal"
                    value={goalInput}
                    onChange={handleInputChange}
                    className="flex-grow p-3 rounded-l-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleSend}
                    className="p-3 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none 
                    focus:ring-2 focus:ring-blue-500 shadow-md"
                > Send </button>
            </div>
        </div>
    )
}
