/**
 * MongoDB Atlas Connection Test
 * 
 * Run this script to test your MongoDB Atlas connection before starting the full app
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const testConnection = async () => {
  console.log('🧪 Testing MongoDB Atlas Connection...\n');
  
  const mongoURI = process.env.MONGODB_URI;
  
  if (!mongoURI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    console.log('💡 Make sure you have a .env file with MONGODB_URI set');
    process.exit(1);
  }
  
  console.log('🔍 Connection Details:');
  console.log('   URI Type:', mongoURI.includes('mongodb+srv') ? 'MongoDB Atlas (Cloud)' : 'Local MongoDB');
  console.log('   URI:', mongoURI.replace(/:([^:@]{8})[^:@]*@/, ':****@')); // Hide password
  console.log('');
  
  try {
    console.log('🔌 Attempting to connect...');
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connection successful!');
    console.log('🗄️  Database name:', mongoose.connection.name);
    console.log('🏠 Host:', mongoose.connection.host);
    console.log('📊 Ready state:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not connected');
    
    // Test creating a simple document
    console.log('\n🧪 Testing database operations...');
    
    const testSchema = new mongoose.Schema({
      message: String,
      timestamp: { type: Date, default: Date.now }
    });
    
    const TestModel = mongoose.model('ConnectionTest', testSchema);
    
    const testDoc = new TestModel({
      message: 'Atlas connection test successful!'
    });
    
    await testDoc.save();
    console.log('✅ Write operation successful');
    
    const foundDoc = await TestModel.findOne({ message: 'Atlas connection test successful!' });
    console.log('✅ Read operation successful');
    
    await TestModel.deleteOne({ _id: testDoc._id });
    console.log('✅ Delete operation successful');
    
    console.log('\n🎉 All tests passed! Your MongoDB Atlas connection is working perfectly.');
    
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    
    console.log('\n🔧 Troubleshooting Tips:');
    
    if (error.message.includes('authentication failed')) {
      console.log('   • Check your username and password in the connection string');
      console.log('   • Ensure the database user exists and has proper permissions');
    }
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.log('   • Check your cluster URL');
      console.log('   • Verify your internet connection');
      console.log('   • Ensure the cluster is running');
    }
    
    if (error.message.includes('IP') || error.message.includes('not authorized')) {
      console.log('   • Add your IP address to MongoDB Atlas Network Access');
      console.log('   • Or use 0.0.0.0/0 to allow access from anywhere (dev only)');
    }
    
    console.log('\n📖 For detailed setup instructions, see: MONGODB_ATLAS_SETUP.md');
    
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

testConnection();
