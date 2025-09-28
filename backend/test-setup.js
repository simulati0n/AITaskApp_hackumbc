const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testSetup() {
  console.log('🔍 Testing AI setup...');
  
  // Test 1: Check if API key exists
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ No GEMINI_API_KEY found in .env file!');
    console.log('Add this to your backend/.env file:');
    console.log('GEMINI_API_KEY=your_api_key_here');
    return;
  }
  
  console.log('✅ API key found:', process.env.GEMINI_API_KEY.substring(0, 10) + '...');
  
  // Test 2: Test AI connection
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const result = await model.generateContent('Convert this text to a task: "Call mom tomorrow at 3pm"');
    console.log('✅ AI connection works!');
    console.log('Sample response:', result.response.text().substring(0, 100) + '...');
  } catch (error) {
    console.error('❌ AI connection failed:', error.message);
    console.log('Get a new API key from: https://aistudio.google.com/app/apikey');
  }
  
  // Test 3: Check Supabase connection
  const { createClient } = require('@supabase/supabase-js');
  
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Supabase credentials missing!');
    return;
  }
  
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const { data, error } = await supabase.from('tasks').select('count');
    if (error) throw error;
    
    console.log('✅ Supabase connection works!');
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
  }
  
  console.log('\n🚀 If all tests passed, your setup is ready!');
  console.log('Start your servers:');
  console.log('1. Backend: cd backend && npm run dev');
  console.log('2. Frontend: cd frontend && npm run dev');
}

testSetup();