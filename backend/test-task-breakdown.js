const { convertTextToTasks } = require('./ai-scheduler');
require('dotenv').config();

async function testTaskBreakdown() {
  console.log('🧪 Testing AI Task Breakdown...\n');
  
  const testInputs = [
    'Go to the gym 7 days straight at 5pm',
    'Study for finals every day at 2pm for 5 days',
    'Learn Python programming over 4 weeks',
    'Meeting with John at 2pm tomorrow, Call Sarah, Gym workout at 6pm'
  ];
  
  for (const input of testInputs) {
    console.log(`\n🔍 Testing: "${input}"`);
    console.log('─'.repeat(50));
    
    try {
      const tasks = await convertTextToTasks(input);
      console.log(`✅ Generated ${tasks.length} tasks:`);
      
      tasks.forEach((task, index) => {
        const startTime = new Date(task.start_time);
        const endTime = new Date(task.end_time);
        console.log(`  ${index + 1}. ${task.title}`);
        console.log(`     📅 ${startTime.toLocaleDateString()} at ${startTime.toLocaleTimeString()}`);
        console.log(`     ⏱️  Duration: ${Math.round((endTime - startTime) / (1000 * 60))} minutes`);
        console.log(`     📝 ${task.description}`);
      });
      
    } catch (error) {
      console.error(`❌ Failed to process: ${error.message}`);
    }
  }
}

if (process.env.GEMINI_API_KEY) {
  testTaskBreakdown();
} else {
  console.log('❌ No GEMINI_API_KEY found. Add it to your .env file to test.');
}