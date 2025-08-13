/**
 * User Model for MongoDB
 * 
 * Defines the user schema with authentication fields and document history
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  name: {
    type: String,
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  
  // Document processing history
  documentHistory: [{
    filename: String,
    originalText: String,
    simplifiedText: String,
    summary: String,
    keyPoints: [String],
    warningFlags: [String],
    processedAt: {
      type: Date,
      default: Date.now
    },
    documentType: {
      type: String,
      enum: ['tos', 'privacy-policy', 'eula', 'other'],
      default: 'tos'
    }
  }],
  
  // User preferences
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'dark'
    },
    simplificationLevel: {
      type: String,
      enum: ['basic', 'detailed', 'technical'],
      default: 'detailed'
    },
    saveHistory: {
      type: Boolean,
      default: true
    }
  },
  
  // Account metadata
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastLoginAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to add document to history
userSchema.methods.addDocumentToHistory = function(documentData) {
  if (this.preferences.saveHistory) {
    this.documentHistory.push(documentData);
    
    // Keep only last 50 documents to prevent unlimited growth
    if (this.documentHistory.length > 50) {
      this.documentHistory = this.documentHistory.slice(-50);
    }
  }
  return this.save();
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

const User = mongoose.model('User', userSchema);

export default User;
