const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// NEW: Convert text input into structured tasks/events
async function convertTextToTasks(textInput) {
  try {
    console.log('🤖 Converting text to structured tasks...');
    console.log('Input text:', textInput);
    
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `You are an intelligent task breakdown assistant. Your job is to analyze user input, extract timing patterns, and create multiple specific subtasks.

User Input: "${textInput}"

INSTRUCTIONS:
1. CAREFULLY PARSE the timing/schedule mentioned (e.g., "7 days straight at 5pm", "every Monday at 10am", "next week at 3pm")
2. BREAK DOWN the main goal into specific, varied subtasks
3. CREATE multiple tasks following the extracted schedule pattern
4. MAKE each subtask unique and specific (not just "Task 1", "Task 2")
5. USE the exact times/dates specified by the user

ADVANCED EXAMPLES:

Input: "Go to the gym 7 days straight at 5pm"
→ Creates 7 tasks:
- "Back and Biceps Workout" (Today 5pm)
- "Chest and Triceps Day" (Tomorrow 5pm) 
- "Leg Day - Squats and Lunges" (Day 3 at 5pm)
- "Cardio and Core Workout" (Day 4 at 5pm)
- "Shoulders and Arms" (Day 5 at 5pm)
- "Full Body Strength Training" (Day 6 at 5pm)
- "Recovery Yoga and Stretching" (Day 7 at 5pm)

Input: "Study for finals every day at 2pm for 5 days"
→ Creates 5 tasks:
- "Study Mathematics - Algebra Review" (Day 1 at 2pm)
- "Study History - World War Analysis" (Day 2 at 2pm)
- "Study Science - Chemistry Practice" (Day 3 at 2pm)
- "Study English - Essay Writing" (Day 4 at 2pm)
- "Final Review - All Subjects" (Day 5 at 2pm)

Input: "Learn Python programming over 4 weeks"
→ Creates 4 weekly tasks:
- "Week 1: Python Basics and Syntax" (This Monday 10am)
- "Week 2: Data Structures and Functions" (Next Monday 10am)
- "Week 3: Object-Oriented Programming" (Week 3 Monday 10am)
- "Week 4: Build Final Python Project" (Week 4 Monday 10am)

PARSING RULES:
1. Extract time patterns: "at 5pm", "every day", "for 7 days", "next week"
2. Extract frequency: "daily", "weekly", "7 days straight", "every Monday"
3. Create specific subtasks related to the main goal
4. Apply the time pattern to each subtask

Return ONLY a JSON array with this exact format:
[
  {
    "title": "Specific Subtask Name",
    "description": "Detailed description of this specific subtask",
    "start_time": "2025-09-29T17:00:00.000Z",
    "end_time": "2025-09-29T18:00:00.000Z",
    "category": "ai-generated",
    "priority": "medium"
  }
]

CRITICAL REQUIREMENTS:
1. EXTRACT the exact timing from user input (e.g., "at 5pm" = 17:00 UTC)
2. CREATE specific subtask names (not generic "Day 1", "Day 2")
3. REPEAT the pattern for the specified duration
4. USE ISO 8601 UTC datetime format
5. MAKE each subtask unique and relevant to the main goal
6. SET realistic durations (30min-2hrs per task)

User input: "${textInput}"`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    console.log('AI Raw Response:', responseText);
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON array found in AI response');
    }
    
    const tasks = JSON.parse(jsonMatch[0]);
    
    // Ensure we have multiple tasks
    if (tasks.length < 2) {
      console.log('⚠️ AI only created 1 task, creating additional breakdown tasks...');
      
      // If only 1 task returned, try to break it down further
      const breakdownPrompt = `Break down this single task into 3-5 smaller actionable steps:
      
      Task: "${tasks[0].title}"
      Description: "${tasks[0].description}"
      
      Create multiple smaller tasks that lead to completing this goal. Return JSON array format:`;
      
      const breakdownResult = await model.generateContent(breakdownPrompt);
      const breakdownText = breakdownResult.response.text().trim();
      const breakdownMatch = breakdownText.match(/\[[\s\S]*\]/);
      
      if (breakdownMatch) {
        const breakdownTasks = JSON.parse(breakdownMatch[0]);
        console.log(`✅ Created ${breakdownTasks.length} breakdown tasks`);
        return breakdownTasks;
      }
    }
    
    console.log(`✅ Parsed ${tasks.length} tasks from text input`);
    return tasks;
    
  } catch (error) {
    console.error('❌ Text to tasks conversion failed:', error);
    
    // Enhanced fallback: Parse patterns like "7 days at 5pm"
    const fallbackTasks = [];
    const input = textInput.toLowerCase();
    
    // Try to extract patterns
    const dayMatch = input.match(/(\d+)\s*days?/);
    const timeMatch = input.match(/at\s*(\d{1,2})\s*(pm|am)/);
    const activityMatch = input.match(/(gym|workout|study|work|meeting|practice)/);
    
    if (dayMatch && timeMatch) {
      // Pattern like "gym 7 days at 5pm" detected
      const numDays = parseInt(dayMatch[1]);
      const hour = parseInt(timeMatch[1]);
      const isPM = timeMatch[2] === 'pm';
      const actualHour = isPM && hour !== 12 ? hour + 12 : (!isPM && hour === 12 ? 0 : hour);
      
      const activity = activityMatch ? activityMatch[1] : 'activity';
      const taskNames = getVariedTaskNames(activity, numDays);
      
      for (let i = 0; i < numDays && i < 7; i++) {
        const startTime = new Date();
        startTime.setDate(startTime.getDate() + i);
        startTime.setHours(actualHour, 0, 0, 0);
        const endTime = new Date(startTime);
        endTime.setHours(actualHour + 1, 0, 0, 0); // 1 hour duration
        
        fallbackTasks.push({
          title: taskNames[i] || `Day ${i + 1}: ${textInput}`,
          description: `${taskNames[i]} scheduled for ${timeMatch[0]}`,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          category: 'ai-generated',
          priority: 'medium'
        });
      }
    } else {
      // Generic fallback
      const steps = ['Planning Phase', 'Preparation', 'Implementation', 'Review'];
      
      steps.forEach((step, index) => {
        const startTime = new Date();
        startTime.setDate(startTime.getDate() + index);
        startTime.setHours(10, 0, 0, 0);
        const endTime = new Date(startTime);
        endTime.setHours(12, 0, 0, 0);
        
        fallbackTasks.push({
          title: `${step}: ${textInput}`,
          description: `${step} phase for: "${textInput}"`,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          category: 'ai-generated',
          priority: index === 0 ? 'high' : 'medium'
        });
      });
    }
    
    console.log(`🔄 Using fallback with ${fallbackTasks.length} tasks`);
    return fallbackTasks;
  }
}

// Helper function to generate varied task names based on activity type
function getVariedTaskNames(activity, numDays) {
  const taskVariations = {
    'gym': [
      'Back and Biceps Workout',
      'Chest and Triceps Training', 
      'Leg Day - Squats and Lunges',
      'Cardio and Core Session',
      'Shoulders and Arms',
      'Full Body Strength Training',
      'Recovery Yoga and Stretching'
    ],
    'workout': [
      'Upper Body Strength',
      'Cardio Blast Session',
      'Core and Abs Focus',
      'Lower Body Power',
      'HIIT Training',
      'Flexibility and Mobility',
      'Active Recovery'
    ],
    'study': [
      'Mathematics Review',
      'Science Chapter Study',
      'History Analysis',
      'Literature Reading',
      'Practice Problems',
      'Review and Summary',
      'Mock Test Prep'
    ]
  };
  
  const variations = taskVariations[activity] || [
    `Day 1: ${activity}`,
    `Day 2: ${activity}`, 
    `Day 3: ${activity}`,
    `Day 4: ${activity}`,
    `Day 5: ${activity}`,
    `Day 6: ${activity}`,
    `Day 7: ${activity}`
  ];
  
  return variations.slice(0, numDays);
}

async function suggestScheduleWithGemini({ tasks, busySlots }) {
  try {
    console.log('🤖 Asking Gemini AI to schedule tasks...');
    
    // Use the correct model name
    
    const prompt = `You are a smart scheduling assistant. Given these tasks and busy time slots, suggest optimal scheduling.

Current busy time slots:
${busySlots.map(slot => `- ${slot.start} to ${slot.end}`).join('\n')}

Tasks to schedule:
${tasks.map(task => `- ${task.title} (${task.durationMinutes} minutes)`).join('\n')}

Please suggest start and end times for each task during open hours (9 AM - 6 PM, Monday-Friday), avoiding the busy slots above.

Return ONLY a JSON array in this exact format:
[
  {
    "title": "Task Name",
    "start": "2025-09-29T10:00:00.000Z",
    "end": "2025-09-29T11:00:00.000Z"
  }
]`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    console.log('✅ AI Response received');
    
    // Parse JSON from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON array found in AI response');
    }
    
    const events = JSON.parse(jsonMatch[0]);
    console.log(`📅 AI suggested ${events.length} scheduled events`);
    
    return events;
    
  } catch (error) {
    console.error('❌ Gemini AI error:', error);
    throw new Error('AI scheduling failed: ' + error.message);
  }
}

// Enhanced goal creation function
async function enhanceGoalToSMART(goal) {
  try {
    console.log('🎯 Enhancing goal with Gemini AI...');
    
    const prompt = `Transform this goal into a SMART goal (Specific, Measurable, Achievable, Relevant, Time-bound). 
    Keep it concise and actionable:
    
    Original goal: "${goal}"
    
    Enhanced SMART goal:`;

    const result = await model.generateContent(prompt);
    const enhancedGoal = result.response.text().trim();
    
    console.log('✅ Enhanced goal:', enhancedGoal);
    return enhancedGoal;
    
  } catch (error) {
    console.error('❌ Gemini AI error:', error);
    // Return fallback instead of throwing error
    return `Make "${goal}" more specific with a timeline and measurable outcome`;
  }
}

// Helper function to check if two time ranges overlap
function hasOverlap(start1, end1, start2, end2) {
  return new Date(start1) < new Date(end2) && new Date(end1) > new Date(start2);
}

// Filter out events that would overlap with existing ones
function filterNonOverlapping(newEvents, existingEvents) {
  return newEvents.filter(newEvent => {
    return !existingEvents.some(existingEvent => 
      hasOverlap(newEvent.start, newEvent.end, existingEvent.start_time, existingEvent.end_time)
    );
  });
}

module.exports = { 
  convertTextToTasks,
  suggestScheduleWithGemini, 
  filterNonOverlapping, 
  enhanceGoalToSMART 
};