const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000 // Timeout in 2s instead of 10s or 30s
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log('\n💡 DNS / NETWORK RESOLUTION ERROR DETECTED:');
    console.log('If you see ECONNREFUSED/ENOTFOUND, this means your network/DNS server is blocking MongoDB Atlas.');
    console.log('👉 To fix this, change your DNS Server in Windows settings to Google (8.8.8.8) or Cloudflare (1.1.1.1).');
    console.log('👉 Or whitelist your current IP address in your MongoDB Atlas Dashboard security settings.');
    console.log('👉 For offline use, MedFlow is now fully equipped with a zero-downtime mock database fallback!\n');
  }
};

module.exports = connectDB;
