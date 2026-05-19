const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // 1. Set command buffering timeout to 3s (down from 10s default) to fail fast
    mongoose.set('bufferTimeoutMS', 3000);
    
    // 2. Configure mongoose connection parameters with short resolution windows
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000 // Timeout Atlas server selection in 8 seconds instead of 30 seconds
    });
    
    // 3. Re-enable buffer if connection succeeded
    mongoose.set('bufferCommands', true);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    
    // 4. Force disable buffering globally on failure so subsequent queries fail instantly
    mongoose.set('bufferCommands', false);
    
    console.log('\n💡 DNS / NETWORK RESOLUTION ERROR DETECTED:');
    console.log('If you see ECONNREFUSED/ENOTFOUND, this means your network/DNS server is blocking MongoDB Atlas.');
    console.log('👉 To fix this, change your DNS Server in Windows settings to Google (8.8.8.8) or Cloudflare (1.1.1.1).');
    console.log('👉 Or whitelist your current IP address in your MongoDB Atlas Dashboard security settings.\n');
  }
};

module.exports = connectDB;
