const mongoose = require('mongoose');

const connectDB = async () => {
  // 1. If already connected, return the connection immediately (0ms overhead)
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // 2. If currently connecting, wait for the existing connection to resolve
  if (mongoose.connection.readyState === 2) {
    console.log('⏳ MongoDB connection in progress... Awaiting resolution...');
    await new Promise((resolve) => {
      mongoose.connection.once('connected', () => resolve(true));
      mongoose.connection.once('error', () => resolve(false));
    });
    return mongoose.connection;
  }

  console.log('🔄 No active database connection. Initiating connection to MongoDB Atlas...');
  
  try {
    // Set low buffering limits so transient failures fail fast
    mongoose.set('bufferTimeoutMS', 3000);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000 // Atlas connection resolution timeout (8s)
    });
    
    mongoose.set('bufferCommands', true);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn.connection;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    mongoose.set('bufferCommands', false);
    throw error; // Propagate exception to middleware so server can report it
  }
};

module.exports = connectDB;
