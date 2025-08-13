/**
 * Express Server for ToS Dumbifier
 * 
 * This server handles authentication, user management, and document processing
 */

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:5175'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'ToS Dumbifier API is running',
    timestamp: new Date().toISOString()
  });
});

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tos-dumbifier';
    
    console.log('🔌 Connecting to MongoDB...');
    console.log('📍 URI format:', mongoURI.includes('mongodb+srv') ? 'MongoDB Atlas' : 'Local MongoDB');
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB Connected Successfully');
    console.log('🗄️  Database:', mongoose.connection.name);
    
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    
    // Provide helpful error messages for common Atlas issues
    if (error.message.includes('authentication failed')) {
      console.error('🔑 Check your MongoDB username and password in the connection string');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('🌐 Check your cluster URL and internet connection');
    } else if (error.message.includes('IP') || error.message.includes('whitelist')) {
      console.error('🚫 Check your IP whitelist in MongoDB Atlas Network Access');
    }
    
    console.error('💡 See MONGODB_ATLAS_SETUP.md for detailed setup instructions');
    process.exit(1);
  }
};

// Connect to database and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api/health`);
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

export default app;
