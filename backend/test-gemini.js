const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGeminiKey() {
  try {
    console.log('🔍 Testing Gemini API Key...');
    console.log('Key starts with:', process.env.GEMINI_API_KEY?.substring(0, 10) + '...');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Try different model names
    const modelNames = ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.0-pro'];
    
    for (const modelName of modelNames) {
      try {
        console.log(`Testing model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hello, respond with "API key is working!"');
        console.log(`✅ SUCCESS! Model ${modelName} works`);
        console.log('Response:', result.response.text());
        console.log(`\n🎯 Use this model in your code: "${modelName}"`);
        return; // Exit on first success
      } catch (modelError) {
        console.log(`❌ Model ${modelName} failed:`, modelError.message);
      }
    }
    
    console.error('❌ All models failed!');
  } catch (error) {
    console.error('❌ FAILED! Gemini API Key is invalid');
    console.error('Error:', error.message);
    console.log('\n🔧 To fix:');
    console.log('1. Go to: https://aistudio.google.com/app/apikey');
    console.log('2. Create new API key');
    console.log('3. Update your .env file with the new key');
  }
}

testGeminiKey();