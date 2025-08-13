/**
 * User Routes
 * 
 * Handles user profile management and document history
 */

import express from 'express';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, preferences } = req.body;
    const user = req.user;

    // Update user fields
    if (name !== undefined) {
      user.name = name;
    }

    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      message: 'Server error updating profile',
      error: 'PROFILE_UPDATE_ERROR'
    });
  }
});

// @route   POST /api/user/document-history
// @desc    Add document to user's history
// @access  Private
router.post('/document-history', authenticateToken, async (req, res) => {
  try {
    const {
      filename,
      originalText,
      simplifiedText,
      summary,
      keyPoints,
      warningFlags,
      documentType
    } = req.body;

    const user = req.user;

    const documentData = {
      filename,
      originalText,
      simplifiedText,
      summary,
      keyPoints: keyPoints || [],
      warningFlags: warningFlags || [],
      documentType: documentType || 'tos',
      processedAt: new Date()
    };

    await user.addDocumentToHistory(documentData);

    res.json({
      message: 'Document added to history successfully',
      documentId: user.documentHistory[user.documentHistory.length - 1]._id
    });

  } catch (error) {
    console.error('Document history error:', error);
    res.status(500).json({
      message: 'Server error adding document to history',
      error: 'DOCUMENT_HISTORY_ERROR'
    });
  }
});

// @route   GET /api/user/document-history
// @desc    Get user's document history
// @access  Private
router.get('/document-history', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { limit = 20, offset = 0 } = req.query;

    // Get paginated history
    const history = user.documentHistory
      .sort((a, b) => new Date(b.processedAt) - new Date(a.processedAt))
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      history,
      total: user.documentHistory.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      message: 'Server error getting document history',
      error: 'GET_HISTORY_ERROR'
    });
  }
});

// @route   DELETE /api/user/document-history/:documentId
// @desc    Delete specific document from history
// @access  Private
router.delete('/document-history/:documentId', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { documentId } = req.params;

    // Remove document from history
    user.documentHistory = user.documentHistory.filter(
      doc => doc._id.toString() !== documentId
    );

    await user.save();

    res.json({
      message: 'Document removed from history successfully'
    });

  } catch (error) {
    console.error('Delete history error:', error);
    res.status(500).json({
      message: 'Server error deleting document from history',
      error: 'DELETE_HISTORY_ERROR'
    });
  }
});

// @route   DELETE /api/user/document-history
// @desc    Clear all document history
// @access  Private
router.delete('/document-history', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    user.documentHistory = [];
    await user.save();

    res.json({
      message: 'Document history cleared successfully'
    });

  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({
      message: 'Server error clearing document history',
      error: 'CLEAR_HISTORY_ERROR'
    });
  }
});

export default router;
