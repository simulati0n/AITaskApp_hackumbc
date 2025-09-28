import React, { useState } from 'react';

export default function TaskPage() {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [goals, setGoals] = useState([]);

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleSend = () => {
        if (inputValue.trim()) {
            setGoals([...goals, inputValue.trim()]);
            setInputValue('');
        }
    };

    const handleDelete = (indexToDelete) => {
        setGoals(goals.filter((_, index) => index !== indexToDelete));
    };

    return (
        <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar */}
            <div className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-lg p-4 transform transition-transform duration-300 ease-in-out z-30 ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full'}`}>
                <div className={`absolute top-4 ${isSidebarOpen ? 'right-4' : 'left-full ml-4'}`}>
                    <button onClick={toggleSidebar} className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                        <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                        </svg>
                    </button>
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
            <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <div className="flex-1 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Task Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mb-8">
                            Manage your tasks and stay organized with AI-powered insights.
                        </p>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                                Coming Soon
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                This page is under development. Check back soon for amazing task management features!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-1/2 flex items-center">
                <input
                    type="text"
                    placeholder="Enter Goal"
                    value={inputValue}
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
