/**
 * DocumentResults Component
 * 
 * Displays the results of document analysis in a user-friendly format
 */

import React, { useState } from 'react';
import './DocumentResults.css';

const DocumentResults = ({ result, onClose, onSaveToHistory }) => {
  const [activeTab, setActiveTab] = useState('summary');

  if (!result || !result.success) {
    return (
      <div className="document-results error">
        <div className="results-header">
          <h2>Processing Failed</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <div className="error-message">
          <p>{result?.error || 'An unknown error occurred'}</p>
        </div>
      </div>
    );
  }

  // Handle both old and new data structures
  const analysis = result.analysis || {
    simplified: result.processedText,
    original: result.originalText,
    wordCount: {
      original: result.originalText ? result.originalText.split(/\s+/).length : 0,
      simplified: result.processedText ? result.processedText.split(/\s+/).length : 0
    },
    model: 'GPT-4',
    timestamp: result.processedAt || new Date().toISOString()
  };
  
  const { documentType, filename } = result;
  const file = result.file || { name: filename || 'Pasted Text' };

  const handleSave = () => {
    if (onSaveToHistory) {
      onSaveToHistory(result);
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
      console.log('Copied to clipboard');
    });
  };

  const formatDocumentType = (type) => {
    const types = {
      'tos': 'Terms of Service',
      'privacy-policy': 'Privacy Policy',
      'eula': 'End User License Agreement'
    };
    return types[type] || 'Legal Document';
  };

  return (
    <div className="document-results">
      <div className="results-header">
        <div className="header-info">
          <h2>Document Analysis Results</h2>
          <div className="document-meta">
            <span className="doc-type">{formatDocumentType(documentType)}</span>
            {file && <span className="file-name">{file.name}</span>}
          </div>
        </div>
        <div className="header-actions">
          <button onClick={handleSave} className="save-btn">Save to History</button>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
      </div>

      <div className="results-tabs">
        <button 
          className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          Simplified Summary
        </button>
        <button 
          className={`tab ${activeTab === 'original' ? 'active' : ''}`}
          onClick={() => setActiveTab('original')}
        >
          Original Text
        </button>
        <button 
          className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
      </div>

      <div className="results-content">
        {activeTab === 'summary' && (
          <div className="tab-content">
            <div className="content-header">
              <h3>AI-Simplified Analysis</h3>
              <button 
                onClick={() => handleCopyToClipboard(analysis.simplified || 'No processed text available')}
                className="copy-btn"
              >
                Copy to Clipboard
              </button>
            </div>
            <div className="simplified-content">
              <div dangerouslySetInnerHTML={{ 
                __html: (analysis.simplified || 'No processed text available').replace(/\n/g, '<br>') 
              }} />
            </div>
          </div>
        )}

        {activeTab === 'original' && (
          <div className="tab-content">
            <div className="content-header">
              <h3>Original Document Text</h3>
              <button 
                onClick={() => handleCopyToClipboard(analysis.original || 'No original text available')}
                className="copy-btn"
              >
                Copy to Clipboard
              </button>
            </div>
            <div className="original-content">
              <pre>{analysis.original || 'No original text available'}</pre>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="tab-content">
            <h3>Document Statistics</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <label>Original Word Count:</label>
                <span>{(analysis.wordCount?.original || 0).toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <label>Simplified Word Count:</label>
                <span>{(analysis.wordCount?.simplified || 0).toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <label>Reduction Percentage:</label>
                <span>
                  {analysis.wordCount?.original > 0 ? Math.round(
                    ((analysis.wordCount.original - analysis.wordCount.simplified) / 
                    analysis.wordCount.original) * 100
                  ) : 0}%
                </span>
              </div>
              <div className="stat-item">
                <label>Document Type:</label>
                <span>{formatDocumentType(documentType)}</span>
              </div>
              <div className="stat-item">
                <label>AI Model Used:</label>
                <span>{analysis.model || 'GPT-4'}</span>
              </div>
              <div className="stat-item">
                <label>Processed At:</label>
                <span>{new Date(analysis.timestamp || new Date()).toLocaleString()}</span>
              </div>
              {file && (
                <>
                  <div className="stat-item">
                    <label>File Size:</label>
                    <span>{(file.size / 1024).toFixed(2)} KB</span>
                  </div>
                  <div className="stat-item">
                    <label>File Type:</label>
                    <span>{file.type || 'Unknown'}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentResults;
