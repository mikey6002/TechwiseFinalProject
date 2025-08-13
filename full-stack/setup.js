#!/usr/bin/env node

/**
 * Setup Script for ToS Dumbifier OpenAI Integration
 * 
 * This script helps users set up the OpenAI integration quickly
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 ToS Dumbifier - OpenAI Integration Setup');
console.log('==========================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    // Copy .env.example to .env
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from .env.example');
  } else {
    // Create basic .env file
    const basicEnv = `# OpenAI API Configuration
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_OPENAI_MODEL=gpt-3.5-turbo
VITE_OPENAI_MAX_TOKENS=1500

# Application Settings
VITE_APP_NAME=ToS Dumbifier
VITE_MAX_FILE_SIZE=10485760
VITE_DEBUG_MODE=false
`;
    fs.writeFileSync(envPath, basicEnv);
    console.log('✅ Created basic .env file');
  }
} else {
  console.log('ℹ️  .env file already exists');
}

// Check for OpenAI API key
const envContent = fs.readFileSync(envPath, 'utf8');
const hasApiKey = envContent.includes('VITE_OPENAI_API_KEY=') && 
                  !envContent.includes('VITE_OPENAI_API_KEY=your_openai_api_key_here');

if (!hasApiKey) {
  console.log('\n⚠️  IMPORTANT: OpenAI API Key Required');
  console.log('=====================================');
  console.log('1. Go to https://platform.openai.com/api-keys');
  console.log('2. Create an account or sign in');
  console.log('3. Generate a new API key');
  console.log('4. Edit .env file and replace "your_openai_api_key_here" with your actual API key');
  console.log('5. Restart the development server\n');
} else {
  console.log('✅ OpenAI API key appears to be configured');
}

// Check if required directories exist
const dirsToCheck = [
  'src/services',
  'src/components',
  'src/utils'
];

dirsToCheck.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    console.log(`✅ Directory exists: ${dir}`);
  } else {
    console.log(`❌ Missing directory: ${dir}`);
  }
});

// Final instructions
console.log('\n🎉 Setup Complete!');
console.log('==================');
console.log('Next steps:');
console.log('1. Configure your OpenAI API key in .env (if not done already)');
console.log('2. Run: npm run dev');
console.log('3. Open: http://localhost:5173');
console.log('4. Upload a Terms of Service document and test the AI analysis');
console.log('\n📖 For more information, see OPENAI_README.md');
