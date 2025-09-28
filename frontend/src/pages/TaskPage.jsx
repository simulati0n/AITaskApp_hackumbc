import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import TaskCalendarDisplay from '../components/TaskCalendarDisplay';
import { Menu, X, Target, Plus } from 'lucide-react';
import moment from 'moment';
import { supabase } from '../lib/supabase';

export default function TaskPage() {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [goalInput, setGoalInput] = useState('');
    const [goals, setGoals] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [selectedTask, setSelectedTask] = useState(null);
    const [taskFormData, setTaskFormData] = useState({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        category: 'user',
        priority: 'medium'
    });

    // Load tasks on component mount
    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            // 📊 READ: Load from Supabase instead of localStorage
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Supabase load error:', error);
                throw error;
            }

            setTasks(data || []);
        } catch (error) {
            console.error('Failed to load tasks:', error);
            setTasks([]);
        }
    };

    const createTask = async (task) => {
        try {
            // ➕ CREATE: Save to Supabase instead of localStorage
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
                console.error('Supabase insert error:', error);
                throw error;
            }

            // Reload tasks to get the latest data
            await loadTasks();
            return true;
        } catch (err) {
            console.error('createTask error', err);
            alert('Failed to create task: ' + err.message);
            return false;
        }
    };

    const updateTask = async (taskId, updatedData) => {
        try {
            // 📝 UPDATE: Update in Supabase instead of localStorage
            const { data, error } = await supabase
                .from('tasks')
                .update({
                    title: updatedData.title,
                    description: updatedData.description,
                    start_time: updatedData.start_time,
                    end_time: updatedData.end_time,
                    category: updatedData.category,
                    priority: updatedData.priority,
                    is_completed: updatedData.is_completed
                })
                .eq('id', taskId)
                .select();

            if (error) {
                console.error('Supabase update error:', error);
                throw error;
            }

            // Reload tasks to get the latest data
            await loadTasks();
            return true;
        } catch (err) {
            console.error('updateTask error', err);
            alert('Failed to update task: ' + err.message);
            return false;
        }
    };

    const deleteTask = async (taskId) => {
        try {
            // 🗑️ DELETE: Remove from Supabase instead of localStorage
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', taskId);

            if (error) {
                console.error('Supabase delete error:', error);
                throw error;
            }

            // Reload tasks to get the latest data
            await loadTasks();
            return true;
        } catch (err) {
            console.error('deleteTask error', err);
            alert('Failed to delete task: ' + err.message);
            return false;
        }
    };

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

    // NEW: AI function to convert text input to tasks/events
    const handleCreateTasksFromAI = async () => {
        if (!goalInput.trim()) {
            alert('Please enter some text to convert to tasks');
            return;
        }

        try {
            console.log('🤖 Sending text to AI for task creation:', goalInput);
            
            // Show loading state
            const originalButtonText = document.querySelector('button').textContent;
            const button = document.querySelector('button');
            if (button) {
                button.textContent = '🤖 Creating Tasks...';
                button.disabled = true;
            }
            
            const response = await fetch('http://localhost:5000/api/create-tasks-from-text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    textInput: goalInput.trim() 
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create tasks from text');
            }

            const data = await response.json();
            console.log('✅ AI created tasks:', data);

            // Reload tasks to show the new ones in the calendar
            await loadTasks();

            // Clear the input and show detailed success message
            setGoalInput('');
            
            // Show detailed success message
            const taskTitles = data.createdTasks.map(task => task.title).join(', ');
            alert(`🎉 AI successfully created ${data.totalCreated} tasks:\n\n${taskTitles}\n\nCheck your calendar to see them!`);

            // Reset button
            if (button) {
                button.textContent = originalButtonText;
                button.disabled = false;
            }

        } catch (error) {
            console.error('❌ Error creating tasks from AI:', error);
            alert('Error creating tasks. Make sure your backend server is running and you have a valid Gemini API key.');
            
            // Reset button on error
            const button = document.querySelector('button');
            if (button) {
                button.textContent = '🤖 Create Tasks';
                button.disabled = false;
            }
        }
    };

    const openTaskModal = () => {
        setModalMode('create');
        setSelectedTask(null);
        setTaskFormData({
            title: '',
            description: '',
            start_time: moment().format('YYYY-MM-DDTHH:mm'),
            end_time: moment().add(1, 'hour').format('YYYY-MM-DDTHH:mm'),
            category: 'user',
            priority: 'medium'
        });
        setShowTaskModal(true);
    };

    const openEditModal = (task) => {
        setModalMode('edit');
        setSelectedTask(task);
        setTaskFormData({
            title: task.title,
            description: task.description || '',
            start_time: moment(task.start_time).format('YYYY-MM-DDTHH:mm'),
            end_time: moment(task.end_time).format('YYYY-MM-DDTHH:mm'),
            category: task.category || 'user',
            priority: task.priority || 'medium'
        });
        setShowTaskModal(true);
    };

    const closeTaskModal = () => {
        setShowTaskModal(false);
    };

    const handleTaskSubmit = async (e) => {
        e.preventDefault();
        
        const taskData = {
            ...taskFormData,
            start_time: new Date(taskFormData.start_time).toISOString(),
            end_time: new Date(taskFormData.end_time).toISOString()
        };

        let success = false;
        if (modalMode === 'create') {
            success = await createTask(taskData);
        } else if (modalMode === 'edit') {
            success = await updateTask(selectedTask.id, taskData);
        }

        if (success) {
            setShowTaskModal(false);
            alert(modalMode === 'create' ? 'Task created!' : 'Task updated!');
        }
    };

    const handleTaskDelete = async () => {
        if (!selectedTask) return;
        
        const confirmed = window.confirm('Are you sure you want to delete this task?');
        if (!confirmed) return;

        const success = await deleteTask(selectedTask.id);
        if (success) {
            setShowTaskModal(false);
            alert('Task deleted!');
        }
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
                        <h2 className="text-xl font-bold text-black-900 dark:text-white mb-4 ml-3">Goals</h2>
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

                    {/* Header with Add Task Button */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">
                                Task Calendar
                            </h2>
                            <p className="text-muted-foreground">
                                Add and manage your tasks on the calendar
                            </p>
                        </div>
                        <Button onClick={openTaskModal} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add Task
                        </Button>
                    </div>

                    {/* Calendar Display */}
                    <TaskCalendarDisplay tasks={tasks} onEditTask={openEditModal} />
                </div>
            </div>
            
            {/* Add Task Modal */}
            {showTaskModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                                {modalMode === 'create' ? 'Add New Task' : 'Edit Task'}
                            </h3>
                            <button
                                onClick={closeTaskModal}
                                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleTaskSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title *</label>
                                <input
                                    type="text"
                                    value={taskFormData.title}
                                    onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    value={taskFormData.description}
                                    onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Start Time *</label>
                                    <input
                                        type="datetime-local"
                                        value={taskFormData.start_time}
                                        onChange={(e) => setTaskFormData({ ...taskFormData, start_time: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">End Time *</label>
                                    <input
                                        type="datetime-local"
                                        value={taskFormData.end_time}
                                        onChange={(e) => setTaskFormData({ ...taskFormData, end_time: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Category</label>
                                    <select
                                        value={taskFormData.category}
                                        onChange={(e) => setTaskFormData({ ...taskFormData, category: e.target.value })}
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
                                        value={taskFormData.priority}
                                        onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-between gap-2 pt-4">
                                <div>
                                    {modalMode === 'edit' && (
                                        <button
                                            type="button"
                                            onClick={handleTaskDelete}
                                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                                
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={closeTaskModal}
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

            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-1/2 flex items-center">
                <input
                    type="text"
                    placeholder="Enter goal or tasks (e.g., 'Plan my wedding' or 'Meeting at 2pm, call John, gym workout')"
                    value={goalInput}
                    onChange={handleInputChange}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handleCreateTasksFromAI();
                        }
                    }}
                    className="flex-grow p-3 rounded-l-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleCreateTasksFromAI}
                    disabled={!goalInput.trim()}
                    className={`p-3 text-white rounded-r-lg focus:outline-none focus:ring-2 shadow-md ${
                        goalInput.trim() 
                            ? 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500' 
                            : 'bg-gray-400 cursor-not-allowed'
                    }`}
                >
                    🤖 Create Tasks
                </button>
            </div>
        </div>
    )
}
