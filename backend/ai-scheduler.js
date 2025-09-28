const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function suggestScheduleWithGemini({ tasks, busySlots }) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const systemPrompt = `
You are an AI scheduling assistant. Your job is to schedule tasks ONLY into open time slots.

Rules:
1. DO NOT overlap with any busy time slots
2. DO NOT make tasks overlap with each other  
3. Return ONLY valid JSON array with format: [{"title": "Task Name", "start": "2025-01-15T10:00:00.000Z", "end": "2025-01-15T11:00:00.000Z"}]
4. Use ISO 8601 UTC datetime format
5. If a task cannot fit anywhere, omit it completely
6. Schedule during any time (24/7 for now)
7. Prefer earlier available times
8. Do not include any explanation, just return the JSON array

Current busy slots (DO NOT SCHEDULE DURING THESE TIMES):
${JSON.stringify(busySlots, null, 2)}

Tasks to schedule:
${JSON.stringify(tasks, null, 2)}
`;

    const result = await model.generateContent(systemPrompt);
    const response = result.response.text().trim();
    
    // Extract JSON from response (in case it's wrapped in code blocks)
    let jsonStr = response;
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    
    // Parse and validate the JSON
    const events = JSON.parse(jsonStr);
    
    if (!Array.isArray(events)) {
      throw new Error('AI did not return a valid array');
    }
    
    // Validate each event has required fields
    events.forEach(event => {
      if (!event.title || !event.start || !event.end) {
        throw new Error('Invalid event format from AI');
      }
    });
    
    return events;
    
  } catch (error) {
    console.error('Gemini AI Error:', error);
    throw new Error('Failed to generate schedule with AI: ' + error.message);
  }
}

// Helper function to check if two time ranges overlap
function hasOverlap(start1, end1, start2, end2) {
  return !(new Date(end1) <= new Date(start2) || new Date(start1) >= new Date(end2));
}

// Filter out events that would overlap with existing ones
function filterNonOverlapping(newEvents, existingEvents) {
  const safeEvents = [];
  
  for (const newEvent of newEvents) {
    let hasConflict = false;
    
    // Check against existing events
    for (const existing of existingEvents) {
      if (hasOverlap(newEvent.start, newEvent.end, existing.start_time, existing.end_time)) {
        hasConflict = true;
        break;
      }
    }
    
    // Check against other accepted new events
    if (!hasConflict) {
      for (const accepted of safeEvents) {
        if (hasOverlap(newEvent.start, newEvent.end, accepted.start, accepted.end)) {
          hasConflict = true;
          break;
        }
      }
    }
    
    if (!hasConflict) {
      safeEvents.push(newEvent);
    }
  }
  
  return safeEvents;
}

module.exports = {
  suggestScheduleWithGemini,
  filterNonOverlapping
};