/**
 * Database Connection Test Script
 * Run this to test your MongoDB connection
 */

require('dotenv').config();
const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    console.log('🔗 Testing MongoDB connection...');
    console.log('📍 Connection URI:', process.env.MONGO_URI.replace(/\/\/.*@/, '//***:***@'));
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('✅ MongoDB connection successful!');
    console.log('📦 Database name:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('🔌 Port:', mongoose.connection.port);
    
    // Test creating a collection
    const testCollection = mongoose.connection.db.collection('test');
    await testCollection.insertOne({ test: true, timestamp: new Date() });
    console.log('✅ Test document inserted successfully!');
    
    // Clean up test document
    await testCollection.deleteOne({ test: true });
    console.log('🧹 Test document cleaned up');
    
    // Close connection
    await mongoose.connection.close();
    console.log('👋 Connection closed');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('💡 Check your internet connection and MongoDB URI');
    } else if (error.message.includes('authentication failed')) {
      console.log('💡 Check your username and password in the connection string');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Check if MongoDB service is running (local) or network access is configured (Atlas)');
    }
    
    process.exit(1);
  }
};

// Run the test
testConnection();
