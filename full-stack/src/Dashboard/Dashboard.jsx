import React, { useState } from 'react';
import './Dashboard.css';
import { dashboardConfig } from './dashboardConfig.js';
import Navbar from './Navbar.jsx';
import FileUploader from './FileUploader/FileUploader.tsx';
import { useAuth } from '../context/AuthContext.jsx';
import { documentProcessor } from '../services/documentProcessor.js';
import DocumentResults from '../components/DocumentResults/DocumentResults.jsx';

/**
 * renders a dashboard with a title and textboxes
 * based on dashboardConfig.js
 */
const Dashboard = () => {
  const [isNavbarExpanded, setIsNavbarExpanded] = useState(false);
  const { user, logout } = useAuth();
  
  // State for text processing
  const [isProcessingText, setIsProcessingText] = useState(false);
  const [textResults, setTextResults] = useState(null);
  const [showTextResults, setShowTextResults] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // Function to get the right CSS class for textbox size
  const getTextboxSizeClass = (size) => {
    // Map size names to CSS class names
    if (size === 'small') return 'textbox-small';
    if (size === 'medium') return 'textbox-medium';
    if (size === 'large') return 'textbox-large';
    
    // Default to medium if size not recognized
    return 'textbox-medium';
  };

  // Function to get the position styles for textboxes
  const getTextboxPosition = (position) => {
    return {
      position: 'absolute',
      top: position.top || '50%',
      left: position.left || '50%',
      right: position.right,
      bottom: position.bottom,
      transform: position.transform || 'none'
    };
  };

  // Function to detect document type based on content
  const detectDocumentType = (text) => {
    const lowercaseText = text.toLowerCase();
    
    // Terms of Service detection
    if (lowercaseText.includes('terms of service') || 
        lowercaseText.includes('terms and conditions') ||
        lowercaseText.includes('user agreement') ||
        lowercaseText.includes('acceptable use')) {
      return 'tos';
    }
    
    // Privacy Policy detection
    if (lowercaseText.includes('privacy policy') ||
        lowercaseText.includes('data collection') ||
        lowercaseText.includes('personal information') ||
        lowercaseText.includes('cookies') ||
        lowercaseText.includes('tracking')) {
      return 'privacy-policy';
    }
    
    // EULA detection
    if (lowercaseText.includes('end user license') ||
        lowercaseText.includes('software license') ||
        lowercaseText.includes('eula') ||
        lowercaseText.includes('license agreement')) {
      return 'eula';
    }
    
    // Default to 'other' for general legal documents
    return 'other';
  };

  // Function to handle text submission
  const handleSubmit = async (textboxId, textValue) => {
    console.log(`Submitting text from ${textboxId}:`, textValue);
    console.log('Text value type:', typeof textValue);
    console.log('Text value length:', textValue?.length);
    
    // Convert to string and validate
    const textString = String(textValue || '').trim();
    
    // Only process if there's actual text content
    if (!textString || textString.length === 0) {
      alert('Please enter some text to process.');
      return;
    }

    // Process text with OpenAI for the main textbox
    if (textboxId === 'main-textbox') {
      setIsProcessingText(true);
      setProcessingProgress(0);
      setProcessingMessage('Analyzing document type...');
      setTextResults(null);
      setShowTextResults(false);

      try {
        // Detect document type
        const documentType = detectDocumentType(textString);
        console.log(`Detected document type: ${documentType}`);
        setProcessingMessage(`Processing ${documentType.toUpperCase()} document...`);

        // Create a progress callback
        const onProgress = (progress) => {
          setProcessingProgress(progress.progress);
          setProcessingMessage(progress.message);
        };

        // Process the text as a document with detected type
        const result = await documentProcessor.processDocument({
          text: textString,  // Ensure it's a string
          filename: 'Pasted Text',
          type: 'text/plain',
          documentType: documentType  // Pass the detected document type
        }, onProgress);

        if (result && result.success) {
          setTextResults(result);
          setShowTextResults(true);
          setProcessingMessage('Analysis complete!');
          
          // Save to user history if logged in
          if (user) {
            try {
              await documentProcessor.saveToHistory(result);
            } catch (historyError) {
              console.warn('Failed to save to history:', historyError);
            }
          }
        } else {
          setProcessingMessage('Failed to process text. Please try again.');
        }

      } catch (error) {
        console.error('Text processing failed:', error);
        setProcessingMessage(error.message || 'Processing failed. Please try again.');
      } finally {
        setIsProcessingText(false);
      }
    }
  };

  // Function to handle closing text results
  const handleCloseTextResults = () => {
    setShowTextResults(false);
    setTextResults(null);
    setProcessingProgress(0);
    setProcessingMessage('');
  };
  

  return (
    <div className={`dashboard ${isNavbarExpanded ? 'navbar-expanded' : ''}`}>
      <Navbar onToggle={setIsNavbarExpanded} />
      
      {/* Dashboard Title */}
      <h1 className="dashboard-title">
        {dashboardConfig.header.title}
      </h1>
      
      {/* File Uploader Component */}
      <div className="file-uploader-container">
        <FileUploader />
      </div>
      
      {/* Render all textboxes from config */}
      {dashboardConfig.textboxes.map((textbox) => (
        <div 
          key={textbox.id}
          className="textbox-container"
          style={getTextboxPosition(textbox.position)}
        >
          <textarea
            id={textbox.id}
            className={`textbox-base ${getTextboxSizeClass(textbox.size)}`}
            placeholder={textbox.placeholder}
            rows={textbox.rows}
            cols={textbox.cols}
            defaultValue={textbox.initialValue}
          />
          <button
            className="textbox-submit-btn"
            onClick={() => {
              const textarea = document.getElementById(textbox.id);
              if (textarea) {
                const textValue = textarea.value || '';
                console.log('Button clicked, textarea value:', textValue, 'type:', typeof textValue);
                handleSubmit(textbox.id, textValue);
              } else {
                console.error('Textarea not found:', textbox.id);
                alert('Error: Could not find the text area. Please try again.');
              }
            }}
            title="Submit text"
            disabled={isProcessingText && textbox.id === 'main-textbox'}
          >
            {isProcessingText && textbox.id === 'main-textbox' ? (
              <div className="processing-spinner"></div>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
          
          {/* Processing status for main textbox */}
          {textbox.id === 'main-textbox' && isProcessingText && (
            <div className="text-processing-status">
              <div className="processing-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${processingProgress}%` }}
                  ></div>
                </div>
                <span className="progress-text">{processingProgress}%</span>
              </div>
              <p className="processing-message">{processingMessage}</p>
            </div>
          )}
        </div>
      ))}

      {/* Text Processing Results */}
      {showTextResults && textResults && (
        <DocumentResults
          result={textResults}
          onClose={handleCloseTextResults}
          onSave={() => documentProcessor.saveToHistory(textResults)}
        />
      )}
      
  
      {/* Renders simple text to the dashboard */}
      {dashboardConfig.textElements?.map((textElement) => (
        <div
          key={textElement.id}
          id={textElement.id}
          className="text-element"
          style={{
            position: 'absolute',
            top: textElement.position.top,
            left: textElement.position.left,
            color: 'white',
            fontFamily: 'Arial, sans-serif',
            zIndex: 10,
            ...textElement.style
          }}
        >
          {textElement.text}
        </div>
      ))}
    </div>
  );
};

export default Dashboard;