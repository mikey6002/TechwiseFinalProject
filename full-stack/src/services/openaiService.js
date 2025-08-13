/**
 * OpenAI API Service
 * 
 * This service handles all interactions with the OpenAI API for document analysis.
 * It provides methods to simplify Terms of Service documents and other legal text.
 */

import config from '../utils/config.js';

class OpenAIService {
  constructor() {
    this.apiKey = config.openai.apiKey;
    this.model = config.openai.model;
    this.maxTokens = config.openai.maxTokens;
    this.apiUrl = config.api.openai;
  }

  /**
   * Validates if the API key is configured
   */
  isConfigured() {
    return !!this.apiKey;
  }

  /**
   * Simplifies a Terms of Service document using OpenAI
   * @param {string} documentText - The raw document text to simplify
   * @param {string} documentType - Type of document (e.g., 'tos', 'privacy-policy', 'eula')
   * @returns {Promise<Object>} - Simplified text and analysis
   */
  async simplifyDocument(documentText, documentType = 'tos') {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your environment variables.');
    }

    if (!documentText || documentText.trim().length === 0) {
      throw new Error('Document text cannot be empty');
    }

    // Limit text size to prevent token overflow
    const limitedText = this.limitTextSize(documentText, 3000);

    const prompt = this.createPrompt(limitedText, documentType);

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are the "Legal Jargon Dumbifier" - a friendly expert who specializes in translating confusing legal documents into plain English. You have a talent for spotting the important stuff that companies try to hide in legal jargon, and you explain everything in a conversational, easy-to-understand way. You use emojis, analogies, and simple language to make legal documents accessible to everyone. Your goal is to help regular people understand exactly what they\'re agreeing to when they sign terms and conditions.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: this.maxTokens,
          temperature: 0.4, // Slightly higher for more conversational tone
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response generated from OpenAI');
      }

      const simplifiedContent = data.choices[0].message.content;
      
      return {
        original: documentText,
        simplified: simplifiedContent,
        wordCount: {
          original: documentText.split(/\s+/).length,
          simplified: simplifiedContent.split(/\s+/).length
        },
        timestamp: new Date().toISOString(),
        model: this.model,
        success: true
      };

    } catch (error) {
      console.error('OpenAI Service Error:', error);
      throw new Error(`Failed to simplify document: ${error.message}`);
    }
  }

  /**
   * Creates a specialized prompt based on document type
   * @param {string} text - Document text
   * @param {string} type - Document type
   * @returns {string} - Formatted prompt
   */
  createPrompt(text, type) {
    // Get document-specific instructions
    const typeSpecificInstructions = this.getTypeSpecificInstructions(type);
    
    const basePrompt = `You are the "Legal Jargon Dumbifier" - an expert at translating confusing legal language into simple, plain English that anyone can understand.

Your job is to take this ${type.toUpperCase()} document and make it crystal clear what it actually means in real life.

${typeSpecificInstructions}

🎯 YOUR MISSION:
- Turn lawyer-speak into human-speak
- Explain what users are ACTUALLY agreeing to
- Point out the sneaky stuff companies try to hide
- Make it sound like you're explaining it to a friend over coffee

📝 WRITING STYLE:
- Use everyday words (say "you can't sue us" instead of "liability is limited")
- Be conversational and friendly
- Use "you" and "they" instead of "the user" and "the company"
- Add emojis to make important points stand out
- Use analogies when helpful (e.g., "It's like signing a blank check")

📋 FORMAT YOUR RESPONSE EXACTLY LIKE THIS:

## 🔥 The Bottom Line (TL;DR)
[3-4 bullet points of the most crucial things to know - the stuff that really matters]

## 📖 What This Actually Says (In Human Terms)
[Break down the main sections in simple language, explaining what each part really means for the user]

## 🚨 Red Flags & Gotchas
[Point out anything sketchy, unfair, or concerning - the stuff buried in legal jargon that could bite users later]

## 💰 Money & Privacy Stuff
[Explain anything about costs, fees, data collection, or privacy in plain terms]

## ⚖️ Your Rights (Or Lack Thereof)
[What can you do if something goes wrong? Can you sue? Get refunds? What are your actual options?]

## 🤔 Should You Actually Agree to This?
[Your honest take - is this reasonable, sketchy, or somewhere in between?]

REMEMBER: Your goal is to make legal jargon disappear and help regular people understand what they're signing up for!

---

Document to dumbify:
${text}`;

    return basePrompt;
  }

  /**
   * Gets document type-specific instructions
   * @param {string} type - Document type
   * @returns {string} - Type-specific instructions
   */
  getTypeSpecificInstructions(type) {
    const instructions = {
      'tos': `
🎯 TERMS OF SERVICE FOCUS:
- What can you and can't you do on their platform?
- How can they kick you off or ban you?
- Who owns the content you post?
- What happens if you break their rules?`,

      'privacy-policy': `
🎯 PRIVACY POLICY FOCUS:
- What personal info do they collect about you?
- Who do they share your data with?
- Can you delete your data or opt out?
- Do they track you across other websites?
- What happens if they get hacked?`,

      'eula': `
🎯 SOFTWARE LICENSE FOCUS:
- What can you actually do with this software?
- Can you share it, modify it, or resell it?
- What happens if the software breaks your computer?
- Are there any sneaky limitations or restrictions?`,

      'other': `
🎯 GENERAL LEGAL DOCUMENT FOCUS:
- What are the main obligations and restrictions?
- What are the potential risks or consequences?
- What rights do you gain or give up?`
    };

    return instructions[type] || instructions['other'];
  }

  /**
   * Limits text size to prevent token overflow
   * @param {string} text - Input text
   * @param {number} maxChars - Maximum characters to keep
   * @returns {string} - Truncated text
   */
  limitTextSize(text, maxChars = 3000) {
    if (text.length <= maxChars) {
      return text;
    }

    // Try to cut at a sentence boundary
    const truncated = text.substring(0, maxChars);
    const lastSentence = truncated.lastIndexOf('.');
    
    if (lastSentence > maxChars * 0.8) {
      return truncated.substring(0, lastSentence + 1);
    }
    
    return truncated + '...';
  }

  /**
   * Extracts text from different file types
   * @param {File} file - The uploaded file
   * @returns {Promise<string>} - Extracted text content
   */
  async extractTextFromFile(file) {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    try {
      if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
        return await this.readTextFile(file);
      } else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        // For PDF files, you might want to use a PDF parsing library
        // For now, we'll throw an error suggesting text files
        throw new Error('PDF parsing not implemented yet. Please convert your PDF to a text file or copy-paste the content.');
      } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
        throw new Error('Word document parsing not implemented yet. Please convert your document to a text file or copy-paste the content.');
      } else {
        throw new Error('Unsupported file type. Please use .txt files or copy-paste the content.');
      }
    } catch (error) {
      throw new Error(`Failed to extract text from file: ${error.message}`);
    }
  }

  /**
   * Reads text from a text file
   * @param {File} file - Text file
   * @returns {Promise<string>} - File content
   */
  async readTextFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        resolve(event.target.result);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }
}

// Export a singleton instance
export const openaiService = new OpenAIService();
export default openaiService;
