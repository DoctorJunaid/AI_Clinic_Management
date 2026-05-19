const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Zero-downtime active serverless connection check middleware
const dbCheckMiddleware = async (req, res, next) => {
  try {
    // Actively verify/re-establish connection in the background if dropped or booting
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection validation failed:', error.message);
    return res.status(503).json({
      success: false,
      message: 'Database is currently offline. If this is a cold start, please retry in 3 seconds.'
    });
  }
};

// Basic Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Import Routes (applied robust database connection check)
app.use('/api/v1/auth', dbCheckMiddleware, require('./src/routes/authRoutes'));
app.use('/api/v1/patients', dbCheckMiddleware, require('./src/routes/patientRoutes'));
app.use('/api/v1/appointments', dbCheckMiddleware, require('./src/routes/appointmentRoutes'));
app.use('/api/v1/prescriptions', dbCheckMiddleware, require('./src/routes/prescriptionRoutes'));
app.use('/api/v1/ai', dbCheckMiddleware, require('./src/routes/aiRoutes'));

const startServer = async () => {
  console.log('🔄 Booting MedFlow Clinical Backend...');
  
  // Try to pre-warm the database connection asynchronously
  connectDB().catch((err) => console.log('Database warming up in background:', err.message));

  const PORT = process.env.PORT || 5000;
  
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

startServer();

module.exports = app;
