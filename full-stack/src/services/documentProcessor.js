/**
 * Document Processing Service
 * 
 * This service orchestrates the document processing workflow:
 * 1. File upload and text extraction
 * 2. OpenAI analysis and simplification
 * 3. Result formatting and storage
 */

import { openaiService } from './openaiService.js';
import config from '../utils/config.js';

class DocumentProcessor {
  constructor() {
    this.supportedTypes = ['.txt', '.pdf', '.doc', '.docx'];
    this.maxFileSize = config.app.maxFileSize;
  }

  /**
   * Validates if a file can be processed
   * @param {File} file - The file to validate
   * @returns {Object} - Validation result with success/error
   */
  validateFile(file) {
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    if (file.size > this.maxFileSize) {
      return { 
        valid: false, 
        error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the maximum limit of 10MB` 
      };
    }

    const fileName = file.name.toLowerCase();
    const isSupported = this.supportedTypes.some(type => fileName.endsWith(type));
    
    if (!isSupported) {
      return {
        valid: false,
        error: `Unsupported file type. Supported types: ${this.supportedTypes.join(', ')}`
      };
    }

    return { valid: true };
  }

  /**
   * Processes a document file through the complete workflow
   * @param {File} file - The document file to process
   * @param {Function} onProgress - Progress callback function
   * @returns {Promise<Object>} - Processing result
   */
  async processDocument(file, onProgress = () => {}) {
    try {
      // Step 1: Validate file
      onProgress({ step: 'validating', progress: 10, message: 'Validating file...' });
      
      const validation = this.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Step 2: Extract text from file
      onProgress({ step: 'extracting', progress: 30, message: 'Extracting text from file...' });
      
      const extractedText = await openaiService.extractTextFromFile(file);
      
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No text content found in the file');
      }

      // Step 3: Analyze with OpenAI
      onProgress({ step: 'analyzing', progress: 60, message: 'Analyzing document with AI...' });
      
      const documentType = this.detectDocumentType(file.name, extractedText);
      const analysisResult = await openaiService.simplifyDocument(extractedText, documentType);

      // Step 4: Format final result
      onProgress({ step: 'formatting', progress: 90, message: 'Formatting results...' });
      
      const result = {
        file: {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        },
        documentType,
        analysis: analysisResult,
        processedAt: new Date().toISOString(),
        success: true
      };

      onProgress({ step: 'complete', progress: 100, message: 'Document processing complete!' });
      
      return result;

    } catch (error) {
      console.error('Document processing error:', error);
      onProgress({ step: 'error', progress: 0, message: error.message });
      
      return {
        success: false,
        error: error.message,
        processedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Processes text directly (for copy-paste input)
   * @param {Object} textData - Object containing text and metadata
   * @param {Function} onProgress - Progress callback function
   * @returns {Promise<Object>} - Processing result
   */
  async processText(textData, onProgress = () => {}) {
    try {
      const { text, filename = 'Pasted Text', type = 'text/plain' } = textData;

      // Step 1: Validate text input
      onProgress({ step: 'validating', progress: 10, message: 'Validating text input...' });
      
      // Ensure text is a string and handle various input types
      let textString;
      if (typeof text === 'string') {
        textString = text;
      } else if (text !== null && text !== undefined) {
        textString = String(text);
      } else {
        throw new Error('No text content provided');
      }
      
      // Trim whitespace
      textString = textString.trim();
      
      if (textString.length === 0) {
        throw new Error('No text content provided');
      }

      if (textString.length > 50000) { // Limit text length to avoid token overflow
        throw new Error('Text is too long. Please limit to 50,000 characters or less.');
      }

      console.log('Processing text:', { 
        originalType: typeof text, 
        processedLength: textString.length, 
        filename 
      });

      // Step 2: Analyze with OpenAI
      onProgress({ step: 'analyzing', progress: 40, message: 'Analyzing text with AI...' });
      
      const documentType = this.detectDocumentType(filename, textString);
      const analysisResult = await openaiService.simplifyDocument(textString, documentType);

      // Step 3: Format final result
      onProgress({ step: 'formatting', progress: 80, message: 'Formatting results...' });
      
      const result = {
        file: {
          name: filename,
          size: textString.length,
          type: type,
          lastModified: Date.now()
        },
        documentType,
        analysis: analysisResult,
        processedAt: new Date().toISOString(),
        success: true,
        isTextInput: true // Flag to indicate this was text input, not file
      };

      onProgress({ step: 'complete', progress: 100, message: 'Text analysis complete!' });
      
      return result;

    } catch (error) {
      console.error('Text processing error:', error);
      onProgress({ step: 'error', progress: 0, message: error.message });
      
      return {
        success: false,
        error: error.message,
        processedAt: new Date().toISOString(),
        isTextInput: true
      };
    }
  }

  /**
   * Universal processing method that handles both files and text
   * @param {File|Object} input - File object or text data object
   * @param {Function} onProgress - Progress callback function
   * @returns {Promise<Object>} - Processing result
   */
  async processDocument(input, onProgress = () => {}) {
    try {
      console.log('ProcessDocument called with:', { 
        inputType: typeof input, 
        isFile: input instanceof File, 
        hasText: !!(input && (input.text || input.content)),
        input: input
      });

      // Check if input is a File object or text data
      if (input instanceof File) {
        return this.processFile(input, onProgress);
      } else if (input && (input.text !== undefined || input.content !== undefined)) {
        // Handle text input - normalize the object structure
        const textData = {
          text: input.text || input.content,
          filename: input.filename || input.name || 'Pasted Text',
          type: input.type || 'text/plain'
        };
        console.log('Calling processText with:', textData);
        return this.processText(textData, onProgress);
      } else {
        console.error('Invalid input received:', input);
        throw new Error('Invalid input: Expected File object or text data object with "text" or "content" property');
      }
    } catch (error) {
      console.error('ProcessDocument error:', error);
      onProgress({ step: 'error', progress: 0, message: error.message });
      return {
        success: false,
        error: error.message,
        processedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Original file processing method (renamed for clarity)
   * @param {File} file - The document file to process
   * @param {Function} onProgress - Progress callback function
   * @returns {Promise<Object>} - Processing result
   */
  async processFile(file, onProgress = () => {}) {
    try {
      // Step 1: Validate file
      onProgress({ step: 'validating', progress: 10, message: 'Validating file...' });
      
      const validation = this.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Step 2: Extract text from file
      onProgress({ step: 'extracting', progress: 30, message: 'Extracting text from file...' });
      
      const extractedText = await openaiService.extractTextFromFile(file);
      
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No text content found in the file');
      }

      // Step 3: Analyze with OpenAI
      onProgress({ step: 'analyzing', progress: 60, message: 'Analyzing document with AI...' });
      
      const documentType = this.detectDocumentType(file.name, extractedText);
      const analysisResult = await openaiService.simplifyDocument(extractedText, documentType);

      // Step 4: Format final result
      onProgress({ step: 'formatting', progress: 90, message: 'Formatting results...' });
      
      const result = {
        file: {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        },
        documentType,
        analysis: analysisResult,
        processedAt: new Date().toISOString(),
        success: true
      };

      onProgress({ step: 'complete', progress: 100, message: 'Document processing complete!' });
      
      return result;

    } catch (error) {
      console.error('Document processing error:', error);
      onProgress({ step: 'error', progress: 0, message: error.message });
      
      return {
        success: false,
        error: error.message,
        processedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Attempts to detect document type based on filename and content
   * @param {string} fileName - Name of the file
   * @param {string} content - Document content
   * @returns {string} - Detected document type
   */
  detectDocumentType(fileName, content) {
    const lowerFileName = fileName.toLowerCase();
    const lowerContent = content.toLowerCase();

    // Check filename patterns
    if (lowerFileName.includes('terms') || lowerFileName.includes('tos')) {
      return 'tos';
    }
    if (lowerFileName.includes('privacy')) {
      return 'privacy-policy';
    }
    if (lowerFileName.includes('eula') || lowerFileName.includes('license')) {
      return 'eula';
    }

    // Check content patterns
    if (lowerContent.includes('terms of service') || lowerContent.includes('terms and conditions')) {
      return 'tos';
    }
    if (lowerContent.includes('privacy policy') || lowerContent.includes('data collection')) {
      return 'privacy-policy';
    }
    if (lowerContent.includes('end user license') || lowerContent.includes('software license')) {
      return 'eula';
    }

    // Default to terms of service
    return 'tos';
  }

  /**
   * Processes text directly (without file upload)
   * @param {Object|string} textData - Text data object or raw text string
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} - Processing result
   */
  async processText(textData, onProgress = () => {}) {
    try {
      console.log('ProcessText called with:', textData);
      
      // Handle both old string format and new object format
      let text, documentType, filename;
      
      if (typeof textData === 'string') {
        // Legacy support for direct string input
        text = textData;
        documentType = 'tos';
        filename = 'Pasted Text';
      } else if (textData && typeof textData === 'object') {
        // New object format
        text = textData.text || textData.content;
        documentType = textData.documentType || this.detectDocumentType(textData.filename || 'text', text);
        filename = textData.filename || 'Pasted Text';
      } else {
        throw new Error('Invalid text data format');
      }

      if (!text || text.trim().length === 0) {
        throw new Error('No text provided for processing');
      }

      console.log(`Processing text as ${documentType} document`);
      onProgress({ step: 'analyzing', progress: 30, message: `Analyzing ${documentType.toUpperCase()} document with AI...` });
      
      const analysisResult = await openaiService.simplifyDocument(text, documentType);
      console.log('OpenAI analysis result:', analysisResult);

      if (!analysisResult || !analysisResult.success) {
        throw new Error('OpenAI processing failed or returned invalid result');
      }

      onProgress({ step: 'formatting', progress: 90, message: 'Formatting results...' });

      // Handle the response structure from openaiService
      const processedText = analysisResult.simplified || analysisResult.processedText || 'Processing failed';
      
      if (!processedText || processedText === 'Processing failed') {
        throw new Error('No processed text received from OpenAI service');
      }
      
      const result = {
        success: true,
        originalText: text,
        processedText: processedText,
        documentType: documentType,
        filename: filename,
        processedAt: new Date().toISOString(),
        metadata: {
          originalLength: text.length,
          processedLength: processedText.length,
          processingTime: analysisResult.processingTime || 'N/A',
          wordCount: analysisResult.wordCount || {
            original: text.split(/\s+/).length,
            simplified: processedText.split(/\s+/).length
          }
        }
      };

      onProgress({ step: 'complete', progress: 100, message: 'Text processing complete!' });
      return result;

    } catch (error) {
      console.error('Text processing error:', error);
      onProgress({ step: 'error', progress: 0, message: error.message });
      
      return {
        success: false,
        error: error.message,
        processedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Gets processing history from localStorage
   * @returns {Array} - Array of previous processing results
   */
  getProcessingHistory() {
    try {
      const history = localStorage.getItem('tos-dumbifier-history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error reading processing history:', error);
      return [];
    }
  }

  /**
   * Saves processing result to history
   * @param {Object} result - Processing result to save
   */
  saveToHistory(result) {
    try {
      const history = this.getProcessingHistory();
      
      // Add new result to the beginning of the array
      history.unshift({
        id: Date.now().toString(),
        ...result,
        savedAt: new Date().toISOString()
      });

      // Keep only the last 10 results
      const limitedHistory = history.slice(0, 10);
      
      localStorage.setItem('tos-dumbifier-history', JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Error saving to processing history:', error);
    }
  }

  /**
   * Clears processing history
   */
  clearHistory() {
    try {
      localStorage.removeItem('tos-dumbifier-history');
    } catch (error) {
      console.error('Error clearing processing history:', error);
    }
  }
}

// Export singleton instance
export const documentProcessor = new DocumentProcessor();
export default documentProcessor;
