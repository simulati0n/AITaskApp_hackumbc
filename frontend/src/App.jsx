import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from "./components/Navbar"
import HomePage from "./pages/HomePage"
import TaskPage from "./pages/TaskPage"
import CalendarPage from "./pages/CalendarPage"

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tasks" element={<TaskPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/projects" element={<TaskPage />} />
          <Route path="/analytics" element={<TaskPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
