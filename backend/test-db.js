const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

console.log('Attempting to connect to MongoDB Atlas at:');
console.log(process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 60) + '...' : 'Undefined URI');

const run = async () => {
  try {
    const start = Date.now();
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout
    });
    console.log(`\n🎉 SUCCESS: Connected to MongoDB Atlas in ${Date.now() - start}ms!`);
    process.exit(0);
  } catch (err) {
    console.error('\n❌ CONNECTION FAILED:');
    console.error(err.message);
    console.error('\nError Details:', JSON.stringify(err, null, 2));
    process.exit(1);
  }
};

run();
