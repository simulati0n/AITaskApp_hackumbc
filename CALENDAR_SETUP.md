# AI Task Scheduler with React Big Calendar & Gemini Integration

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- Google Gemini API key

### Backend Setup

1. **Install additional dependencies:**
   ```bash
   cd backend
   npm install @google/generative-ai
   ```

2. **Get your Gemini API key:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key

3. **Update your `.env` file:**
   ```bash
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=task_scheduler
   DB_PASSWORD=your_password
   DB_PORT=5432
   PORT=5000
   
   # Add your Gemini API key
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

4. **Make sure your database table supports time scheduling:**
   Your existing `tasks` table should already work, but ensure it has these columns:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'tasks';
   ```

   The table should include:
   - `start_time` (TIMESTAMP or TIMESTAMPTZ)
   - `end_time` (TIMESTAMP or TIMESTAMPTZ)

### Frontend Setup

1. **Install React Big Calendar and date utilities:**
   ```bash
   cd frontend
   npm install react-big-calendar moment date-fns
   ```

2. **Install the CSS for React Big Calendar:**
   The CSS is already imported in the TaskCalendar component.

### 🎯 Features

#### 1. **AI-Powered Scheduling**
- Click "🤖 AI Schedule Tasks" to let Gemini AI find open time slots
- AI respects existing appointments and won't create overlapping events
- Configurable sample tasks that can be modified

#### 2. **Visual Calendar Interface**
- Multiple views: Month, Week, Day, Agenda
- Color-coded events by priority and category
- Tooltips showing task details
- Click events to see full details

#### 3. **Smart Conflict Detection**
- Server-side validation prevents overlapping appointments
- AI considers existing events when scheduling
- Safe scheduling with fallback handling

### 🎨 Calendar Color Coding

- 🟢 **Green**: AI-scheduled tasks
- 🔴 **Red**: High priority tasks  
- 🔵 **Blue**: Normal priority tasks
- ⚪ **Gray**: Low priority tasks
- 🫥 **Faded**: Completed tasks

### 📝 How to Use

1. **Start both servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend  
   cd frontend
   npm run dev
   ```

2. **Access the calendar:**
   - Navigate to `http://localhost:5173/calendar`
   - Or click "Calendar" in the navigation menu

3. **Schedule with AI:**
   - Click the "🤖 AI Schedule Tasks" button
   - Gemini will analyze your existing schedule
   - It will place sample tasks in available time slots
   - New events appear immediately on the calendar

### 🔧 Customization Options

#### Modify Sample Tasks
Edit the `sampleTasks` array in `TaskCalendar.jsx`:
```javascript
const [sampleTasks] = useState([
  { title: 'Your Custom Task', durationMinutes: 60 },
  { title: 'Another Task', durationMinutes: 45 }
]);
```

#### Change AI Scheduling Prompt
Modify the prompt in `ai-scheduler.js` to change how Gemini schedules tasks:
```javascript
const systemPrompt = `
Your custom scheduling instructions...
- Custom rule 1
- Custom rule 2  
`;
```

#### Adjust Time Preferences
Currently set to "anytime" - you can modify the AI prompt to include specific hours:
```javascript
// Add to the systemPrompt in ai-scheduler.js
- Only schedule between 9AM-5PM weekdays
- Avoid lunch time (12PM-1PM)
- Prefer morning hours for important tasks
```

### 🐛 Troubleshooting

#### Common Issues:

1. **"Failed to resolve import react-router-dom"**
   ```bash
   cd frontend
   npm install react-router-dom
   ```

2. **"Button UI component not found"**
   - Import path should be: `'../components/ui/button'`
   - Make sure the button component exists

3. **"Gemini API key invalid"**
   - Verify your API key is correct in `.env`
   - Make sure there are no extra spaces
   - Restart the backend server after changing `.env`

4. **"Database connection failed"**
   - Check PostgreSQL is running
   - Verify database credentials in `.env`
   - Ensure the database and table exist

5. **"AI scheduling failed"**
   - Check the browser console and server logs
   - Verify Gemini API key is valid
   - Make sure you have existing events to create "busy slots"

### 🔮 Future Enhancements

- User-configurable scheduling preferences UI
- Multiple user support
- Recurring event scheduling
- Integration with external calendars (Google Calendar, Outlook)
- Advanced AI prompting for different scheduling strategies
- Task priority-based scheduling
- Smart scheduling based on task types and user patterns

### 📊 API Endpoints

- `GET /api/tasks` - Fetch all tasks/events
- `POST /api/tasks` - Create manual task
- `POST /api/ai-schedule` - AI-powered scheduling

### 🎉 You're Ready!

Your AI Task Scheduler is now integrated with React Big Calendar and Gemini AI. The system will:

✅ Display your existing tasks in a beautiful calendar interface  
✅ Use AI to find open time slots for new tasks  
✅ Prevent scheduling conflicts automatically  
✅ Provide visual feedback and task management  

Navigate to `/calendar` and click "🤖 AI Schedule Tasks" to see the magic happen!