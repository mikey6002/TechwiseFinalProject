/**
 * Environment Configuration Utilities
 * 
 * Handles environment variables and configuration for the application
 */

export const config = {
  // OpenAI Configuration
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-3.5-turbo',
    maxTokens: parseInt(import.meta.env.VITE_OPENAI_MAX_TOKENS || '1500'),
  },
  
  // Application Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'ToS Dumbifier',
    maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '10485760'), // 10MB
    debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
  },
  
  // API URLs
  api: {
    openai: 'https://api.openai.com/v1/chat/completions',
  }
};

/**
 * Validates if the application is properly configured
 * @returns {Object} Validation result with missing configurations
 */
export function validateConfiguration() {
  const issues = [];
  
  if (!config.openai.apiKey) {
    issues.push({
      type: 'critical',
      message: 'OpenAI API key is not configured',
      solution: 'Set VITE_OPENAI_API_KEY in your .env file'
    });
  }
  
  if (config.openai.maxTokens < 100 || config.openai.maxTokens > 4000) {
    issues.push({
      type: 'warning',
      message: 'OpenAI max tokens should be between 100 and 4000',
      solution: 'Adjust VITE_OPENAI_MAX_TOKENS in your .env file'
    });
  }
  
  if (config.app.maxFileSize < 1024 || config.app.maxFileSize > 50 * 1024 * 1024) {
    issues.push({
      type: 'warning',
      message: 'File size limit should be between 1KB and 50MB',
      solution: 'Adjust VITE_MAX_FILE_SIZE in your .env file'
    });
  }
  
  return {
    isValid: issues.filter(issue => issue.type === 'critical').length === 0,
    issues
  };
}

/**
 * Gets a user-friendly display of the current configuration
 * @returns {Object} Configuration display object
 */
export function getConfigurationDisplay() {
  const validation = validateConfiguration();
  
  return {
    openai: {
      configured: !!config.openai.apiKey,
      model: config.openai.model,
      maxTokens: config.openai.maxTokens,
    },
    app: {
      name: config.app.name,
      maxFileSize: `${(config.app.maxFileSize / 1024 / 1024).toFixed(1)}MB`,
      debugMode: config.app.debugMode,
    },
    validation
  };
}

export default config;
