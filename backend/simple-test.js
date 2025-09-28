const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function simpleTest() {
  try {
    console.log('🔍 Simple API Key Test...');
    console.log('Using key:', process.env.GEMINI_API_KEY);
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Try the most basic model that should work
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    console.log('📤 Sending test request...');
    const result = await model.generateContent('Say hello');
    
    console.log('✅ SUCCESS! API Key works!');
    console.log('Response:', result.response.text());
    
  } catch (error) {
    console.error('❌ API Key Test Failed');
    console.error('Full Error:', error);
    console.log('\n🔧 Your API key is invalid. Here\'s how to get a new one:');
    console.log('1. Open: https://aistudio.google.com/app/apikey');
    console.log('2. Sign in with Google');
    console.log('3. Click "Create API Key"');
    console.log('4. Select "Create API key in new project"');
    console.log('5. Copy the key (39 characters, starts with AIza)');
    console.log('6. Replace GEMINI_API_KEY in your .env file');
    console.log('7. Restart your server');
  }
}

simpleTest();