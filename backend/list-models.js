const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
  try {
    console.log('🔍 Listing available Gemini models...');
    console.log('Key starts with:', process.env.GEMINI_API_KEY?.substring(0, 10) + '...');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Try to list models
    const models = await genAI.listModels();
    console.log('✅ Available models:');
    models.forEach(model => {
      console.log(`- ${model.name}`);
    });
  } catch (error) {
    console.error('❌ Failed to list models:', error.message);
    console.log('\n🚨 Your API key is definitely invalid!');
    console.log('\n🔧 Create a NEW API key:');
    console.log('1. Go to: https://aistudio.google.com/app/apikey');
    console.log('2. Click "Create API Key"');
    console.log('3. Select "Create API key in new project"');
    console.log('4. Copy the new key (starts with AIza)');
    console.log('5. Replace in your .env file');
  }
}

listModels();