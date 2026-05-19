const mongoose = require('mongoose');

const connectDB = async () => {
  const options = {
    serverSelectionTimeoutMS: 8000 // Timeout Atlas server selection in 8 seconds
  };

  const attemptConnect = async () => {
    try {
      // 1. Set command buffering timeout to 3s (down from 10s default) to fail fast
      mongoose.set('bufferTimeoutMS', 3000);
      
      const conn = await mongoose.connect(process.env.MONGODB_URI, options);
      
      // 2. Re-enable buffering once connected successfully
      mongoose.set('bufferCommands', true);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(`MongoDB Connection Error: ${error.message}`);
      
      // 3. Force disable buffering on failure so subsequent queries fail instantly
      mongoose.set('bufferCommands', false);
      
      console.log('\n💡 DNS / NETWORK RESOLUTION ERROR DETECTED:');
      console.log('If you see ECONNREFUSED/ENOTFOUND, this means your network/DNS server is blocking MongoDB Atlas.');
      console.log('👉 To fix this, change your DNS Server in Windows settings to Google (8.8.8.8) or Cloudflare (1.1.1.1).');
      console.log('👉 Or whitelist your current IP address in your MongoDB Atlas Dashboard security settings.');
      
      console.log('\n🔄 MongoDB connection failed. Retrying in 5 seconds...');
      setTimeout(attemptConnect, 5000);
    }
  };

  // Monitor connection lifecycle events
  mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB connection lost. Attempting to reconnect...');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`🚨 MongoDB connection error: ${err.message}`);
  });

  await attemptConnect();
};

module.exports = connectDB;
