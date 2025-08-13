/**
 * API Key Test Utility
 * 
 * Simple test to verify if your OpenAI API key is working correctly
 */

import { config } from '../utils/config.js';

export class APIKeyTester {
  static async testAPIKey() {
    console.log('🔍 Testing OpenAI API Key...');
    
    // Check if key exists
    if (!config.openai.apiKey) {
      return {
        success: false,
        error: 'API key not found in environment variables',
        suggestion: 'Make sure VITE_OPENAI_API_KEY is set in your .env file'
      };
    }

    // Check if key format looks correct
    if (!config.openai.apiKey.startsWith('sk-')) {
      return {
        success: false,
        error: 'API key format appears incorrect',
        suggestion: 'OpenAI API keys should start with "sk-"'
      };
    }

    console.log('✅ API key found and format looks correct');
    console.log(`🔑 Key preview: ${config.openai.apiKey.substring(0, 10)}...`);

    // Test API call
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.openai.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: 'Say "API test successful" if you receive this message.'
            }
          ],
          max_tokens: 10
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: `API call failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`,
          suggestion: response.status === 401 ? 
            'Your API key appears to be invalid or expired' :
            'Check your internet connection and API key permissions'
        };
      }

      const data = await response.json();
      console.log('🎉 API test successful!', data);
      
      return {
        success: true,
        message: 'API key is working correctly!',
        response: data.choices[0]?.message?.content
      };

    } catch (error) {
      return {
        success: false,
        error: `Network error: ${error.message}`,
        suggestion: 'Check your internet connection'
      };
    }
  }
}
