import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import TaskCalendar from '../components/TaskCalendar';
import { Menu, X, Target, Plus } from 'lucide-react';

export default function TaskPage() {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [goalInput, setGoalInput] = useState('');

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    const handleAddGoal = () => {
        if (goalInput.trim()) {
            // TODO: Implement goal addition logic
            console.log('Adding goal:', goalInput);
            setGoalInput('');
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
                    <div className="mt-16 p-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Target className="h-5 w-5" />
                                    Goals
                                </CardTitle>
                                <CardDescription>
                                    Track your daily objectives
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Enter new goal..."
                                        value={goalInput}
                                        onChange={(e) => setGoalInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
                                    />
                                    <Button size="icon" onClick={handleAddGoal}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Goals will appear here...
                                </div>
                            </CardContent>
                        </Card>
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
        </div>
    )
}
